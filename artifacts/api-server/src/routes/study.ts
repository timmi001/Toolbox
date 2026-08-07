import { Router } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";
import { generateText } from "../lib/ai-service";
import { buildStudyPrompt, type StudyAction, type StudyPromptInput } from "../lib/study-prompts";

const router = Router();

const studyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many study requests. Please wait a moment and try again." },
});

function nowMs(): number {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

function validateStudyPayload(action: StudyAction, body: unknown): { input: StudyPromptInput; error?: string } {
  if (!body || typeof body !== "object") {
    return { input: {}, error: "Request body must be a JSON object." };
  }

  const payload = body as Record<string, unknown>;
  const topic = typeof payload.topic === "string" ? payload.topic.trim() : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  const role = typeof payload.role === "string" ? payload.role.trim() : "";
  const question = typeof payload.question === "string" ? payload.question.trim() : "";
  const answer = typeof payload.answer === "string" ? payload.answer.trim() : "";
  const days = typeof payload.days === "string" ? payload.days.trim() : "";
  const level = typeof payload.level === "string" ? payload.level.trim() : "";
  const format = typeof payload.format === "string" ? payload.format.trim() : "";
  const difficulty = typeof payload.difficulty === "string" ? payload.difficulty.trim() : "";
  const count = typeof payload.count === "string" ? payload.count.trim() : "";
  const type = typeof payload.type === "string" ? payload.type.trim() : "";

  if (!topic && action !== "tutor") {
    return { input: {}, error: "A topic is required." };
  }

  if (action === "tutor" && !question) {
    return { input: {}, error: "A question is required for tutor mode." };
  }

  const input: StudyPromptInput = {
    topic,
    level,
    format,
    difficulty,
    count,
    subject,
    days,
    question,
    answer,
    role,
    type,
  };

  return { input };
}

router.post("/:action", studyLimiter, async (req, res) => {
  const requestId = req.header("x-request-id") || Math.random().toString(36).slice(2, 8);
  const action = req.params.action as StudyAction;
  const start = nowMs();

  const supportedActions: StudyAction[] = ["notes", "quiz", "flashcards", "planner", "homework", "tutor"];
  if (!supportedActions.includes(action)) {
    return res.status(404).json({ success: false, message: "Unsupported study action." });
  }

  const validation = validateStudyPayload(action, req.body);
  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  const prompt = buildStudyPrompt(action, validation.input);

  try {
    const { result } = await generateText({
      prompt,
      toolId: `study-${action}`,
      maxOutputTokens: 1000,
      isComplex: action === "notes" || action === "planner" || action === "tutor",
      requestId,
    });

    logger.info(
      {
        requestId,
        action,
        durationMs: Number((nowMs() - start).toFixed(1)),
        provider: result.provider,
        model: result.model,
        ts: new Date().toISOString(),
      },
      `[study/${action}][${requestId}] completed`,
    );

    return res.json({ success: true, result: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Study generation failed.";
    logger.error(
      {
        requestId,
        action,
        durationMs: Number((nowMs() - start).toFixed(1)),
        error: message,
        ts: new Date().toISOString(),
      },
      `[study/${action}][${requestId}] failed`,
    );
    return res.status(500).json({ success: false, message });
  }
});

export default router;
