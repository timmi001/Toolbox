import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";
import type { PDFParse as PdfParser } from "pdf-parse";

const router = Router();
const MAX_PDF_SIZE = 25 * 1024 * 1024;
const PDF_FIELD_NAME = "file";

type PdfErrorCode =
  | "PDF_FILE_REQUIRED"
  | "PDF_TOO_LARGE"
  | "PDF_INVALID_TYPE"
  | "PDF_PARSE_FAILED"
  | "PDF_EXTRACTION_FAILED";

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

      if (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_PART_COUNT" || error.code === "LIMIT_FIELD_COUNT") {
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

  const startedAt = process.hrtime.bigint();
  let parser: PdfParser | undefined;

  try {
    // pdf-parse pulls in PDF.js rendering support. Load it only for an
    // extraction request so an optional canvas/DOMMatrix shim cannot prevent
    // the API server from starting.
    const { PDFParse } = await import("pdf-parse");
    parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText({
      itemJoiner: " ",
      pageJoiner: "",
    });
    const pageTexts = result.pages.map((page) => page.text.replace(/\s+/g, " ").trim());
    const textCharacterCount = pageTexts.reduce((total, pageText) => total + pageText.length, 0);
    const textAvailable = textCharacterCount > 0;
    const warning = textAvailable
      ? undefined
      : "This PDF has no selectable text. It may be scanned or image-based, so OCR is needed to read its contents.";
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info(
      {
        requestId: getRequestId(req),
        fileName: file.originalname,
        fileSize: file.size,
        pageCount: result.total,
        textCharacterCount,
        durationMs,
      },
      "PDF extracted successfully",
    );

    res.json({
      success: true,
      document: {
        id: randomUUID(),
        name: file.originalname.replace(/\.pdf$/i, ""),
        fileName: file.originalname,
        pageCount: result.total,
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
    sendPdfError(
      res,
      422,
      "PDF_PARSE_FAILED",
      "This PDF could not be read. It may be corrupted, password-protected, or using an unsupported format.",
      true,
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (error) {
        logPdfFailure(req, file, error, "PDF parser cleanup failed");
      }
    }
  }
});

export default router;