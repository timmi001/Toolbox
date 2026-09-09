import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { createCanvas } from "@napi-rs/canvas";
import { logger } from "../lib/logger";

const router = Router();
const MAX_PDF_SIZE = 25 * 1024 * 1024;
const PDF_FIELD_NAME = "file";

type PdfErrorCode =
  | "PDF_FILE_REQUIRED"
  | "PDF_TOO_LARGE"
  | "PDF_INVALID_TYPE"
  | "PDF_PARSE_FAILED"
  | "PDF_EXTRACTION_FAILED"
  | "PDF_PASSWORD_PROTECTED"
  | "PDF_OCR_FAILED";

function sendPdfError(
  res: Response,
  status: number,
  code: PdfErrorCode,
  message: string,
  retryable: boolean,
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      retryable,
    },
  });
}

function getRequestId(req: Request) {
  return (req as Request & { id?: string }).id;
}

function isPasswordError(error: unknown) {
  return /password|encrypted|encryption|incorrect password/i.test(error instanceof Error ? error.message : String(error));
}

async function ocrPages(data: Buffer, pageNumbers: number[]) {
  const [{ getDocument }, { createWorker }] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("tesseract.js"),
  ]);
  const pdfDocument = await getDocument({ data: new Uint8Array(data), verbosity: 0, disableWorker: true } as never).promise;
  const worker = await createWorker("eng");
  const results = new Map<number, string>();
  try {
    for (const pageNumber of pageNumbers.slice(0, 20)) {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      await page.render({ canvas: null, canvasContext: canvas.getContext("2d") as never, viewport }).promise;
      const text = await worker.recognize(canvas.toBuffer("image/png"));
      results.set(pageNumber, text.data.text.replace(/\s+/g, " ").trim());
    }
    return results;
  } finally {
    await worker.terminate();
  }
}

function logPdfFailure(req: Request, file: Express.Multer.File | undefined, error: unknown, message: string) {
  const parsedError = error instanceof Error
    ? {
        name: error.name,
        message: error.message,
        ...(process.env["NODE_ENV"] !== "production" ? { stack: error.stack } : {}),
      }
    : { message: String(error) };

  logger.error(
    {
      requestId: getRequestId(req),
      fileName: file?.originalname,
      fileSize: file?.size,
      fileMimeType: file?.mimetype,
      error: parsedError,
    },
    message,
  );
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PDF_SIZE,
    files: 1,
    // Busboy counts multipart parts slightly differently across clients
    // (browser FormData and curl do not produce identical boundaries). Keep
    // the file count strict while allowing the normal single-file envelope.
    fields: 1,
    parts: 2,
  },
});

function uploadPdfFile(req: Request, res: Response, next: NextFunction) {
  if (!req.is("multipart/form-data")) {
    sendPdfError(
      res,
      415,
      "PDF_INVALID_TYPE",
      "Upload a PDF using a multipart/form-data request.",
      false,
    );
    return;
  }

  upload.single(PDF_FIELD_NAME)(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        logPdfFailure(req, undefined, error, "PDF upload rejected because it exceeded the size limit");
        sendPdfError(
          res,
          413,
          "PDF_TOO_LARGE",
          `That PDF is too large. Please choose a file smaller than ${MAX_PDF_SIZE / 1024 / 1024} MB.`,
          false,
        );
        return;
      }

      if (
        error.code === "LIMIT_UNEXPECTED_FILE"
        || error.code === "LIMIT_FILE_COUNT"
        || error.code === "LIMIT_PART_COUNT"
        || error.code === "LIMIT_FIELD_COUNT"
      ) {
        logPdfFailure(req, undefined, error, "PDF upload rejected because the multipart form was invalid");
        sendPdfError(
          res,
          400,
          "PDF_INVALID_TYPE",
          `Send exactly one PDF in the "${PDF_FIELD_NAME}" field.`,
          false,
        );
        return;
      }
    }

    logPdfFailure(req, undefined, error, "PDF multipart upload failed");
    sendPdfError(
      res,
      400,
      "PDF_EXTRACTION_FAILED",
      "The PDF upload could not be read. Please try again.",
      true,
    );
  });
}

router.post("/pdf/extract", uploadPdfFile, async (req, res) => {
  const file = req.file;
  if (!file) {
    sendPdfError(
      res,
      400,
      "PDF_FILE_REQUIRED",
      `Choose a PDF file in the "${PDF_FIELD_NAME}" field and try again.`,
      false,
    );
    return;
  }

  if (Object.keys(req.body ?? {}).length > 0) {
    sendPdfError(
      res,
      400,
      "PDF_INVALID_TYPE",
      `Send only one PDF in the "${PDF_FIELD_NAME}" field.`,
      false,
    );
    return;
  }

  const header = file.buffer.subarray(0, 1024).toString("latin1");
  const hasPdfHeader = header.includes("%PDF-");
  const hasPdfMime = file.mimetype === "application/pdf";
  const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");

  if ((!hasPdfMime && !hasPdfExtension) || !hasPdfHeader) {
    logPdfFailure(req, file, new Error("PDF signature or metadata validation failed"), "PDF upload rejected as a non-PDF file");
    sendPdfError(
      res,
      415,
      "PDF_INVALID_TYPE",
      "That file is not a readable PDF. Choose a valid PDF file and try again.",
      false,
    );
    return;
  }

  try {
    let pageTexts: string[];
    try {
      const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfDocument = await getDocument({ data: new Uint8Array(file.buffer), verbosity: 0, disableWorker: true } as never).promise;
      pageTexts = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();
        pageTexts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" ").replace(/\s+/g, " ").trim());
      }
    } catch (pdfJsError) {
      logger.warn({ error: pdfJsError instanceof Error ? pdfJsError.message : String(pdfJsError) }, "PDF.js extraction failed; trying pdf-parse fallback");
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: file.buffer });
      pageTexts = (await parser.getText({ itemJoiner: " ", pageJoiner: "\n\n" })).pages.map((page: { text: string }) => page.text.replace(/\s+/g, " ").trim());
      await parser.destroy();
    }

    if (!pageTexts.length || pageTexts.every((page) => !page)) {
      const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfDocument = await getDocument({ data: new Uint8Array(file.buffer), verbosity: 0, disableWorker: true } as never).promise;
      pageTexts = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();
        pageTexts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" ").replace(/\s+/g, " ").trim());
      }
    }

    const sparsePages = pageTexts.map((page, index) => page.length < 20 ? index + 1 : 0).filter(Boolean);
    if (sparsePages.length) {
      try {
        const ocr = await ocrPages(file.buffer, sparsePages);
        for (const [pageNumber, text] of ocr) if (text.length > pageTexts[pageNumber - 1].length) pageTexts[pageNumber - 1] = text;
      } catch (error) {
        if (pageTexts.every((page) => !page)) throw Object.assign(new Error("OCR could not read the scanned PDF pages."), { code: "PDF_OCR_FAILED" });
        logger.warn({ error: error instanceof Error ? error.message : String(error) }, "PDF OCR fallback failed; retaining extracted text");
      }
    }

    const textCharacterCount = pageTexts.reduce((total, pageText) => total + pageText.length, 0);
    const textAvailable = textCharacterCount > 0;
    const warning = textAvailable ? undefined : "No readable text was found in this PDF.";

    logger.info(
      {
        requestId: getRequestId(req),
        fileName: file.originalname,
        fileSize: file.size,
        pageCount: pageTexts.length,
        textCharacterCount,
      },
      "PDF extracted successfully",
    );

    res.json({
      success: true,
      document: {
        id: randomUUID(),
        name: file.originalname.replace(/\.pdf$/i, ""),
        fileName: file.originalname,
        pageCount: pageTexts.length,
        pageTexts,
        uploadDate: new Date().toISOString(),
        status: "ready" as const,
        size: file.size,
        textAvailable,
        warning,
      },
    });
  } catch (error) {
    logPdfFailure(req, file, error, "PDF text extraction failed");
    const code = (error as { code?: string }).code;
    if (code === "PDF_OCR_FAILED") sendPdfError(res, 422, "PDF_OCR_FAILED", "The PDF was uploaded, but OCR could not read its scanned pages.", true);
    else if (isPasswordError(error)) sendPdfError(res, 422, "PDF_PASSWORD_PROTECTED", "This PDF is password-protected or encrypted. Remove the password and try again.", false);
    else sendPdfError(res, 422, "PDF_EXTRACTION_FAILED", "The PDF was uploaded successfully but its text could not be extracted.", true);
  }
});

export default router;