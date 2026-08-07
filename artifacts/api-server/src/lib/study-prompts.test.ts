import test from "node:test";
import assert from "node:assert/strict";
import { buildStudyPrompt } from "./study-prompts.ts";

test("buildStudyPrompt returns a structured prompt for study notes", () => {
  const prompt = buildStudyPrompt("notes", {
    topic: "Photosynthesis",
    level: "Intermediate",
    format: "Detailed Notes",
  });

  assert.match(prompt, /Photosynthesis/i);
  assert.match(prompt, /Detailed Notes/i);
  assert.match(prompt, /Key Concepts/i);
});

test("buildStudyPrompt returns a quiz prompt when asked for quiz content", () => {
  const prompt = buildStudyPrompt("quiz", {
    topic: "World War II",
    difficulty: "Mixed",
    count: "8",
  });

  assert.match(prompt, /World War II/i);
  assert.match(prompt, /8/i);
  assert.match(prompt, /Multiple choice/i);
});
