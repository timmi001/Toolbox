#!/usr/bin/env node
/**
 * Provider Testing Script
 * 
 * Tests each AI provider individually to diagnose configuration issues.
 * Run this after deployment to verify the fallback chain is working.
 *
 * Usage:
 *   npx ts-node scripts/test-ai-providers.ts
 *   or
 *   node scripts/test-ai-providers.js
 *
 * This script will:
 * 1. Check if API keys are configured
 * 2. Attempt a simple generation with each provider
 * 3. Report success/failure with detailed error information
 * 4. Verify the fallback chain works end-to-end
 */

import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

interface TestResult {
  provider: string;
  model: string;
  configured: boolean;
  tested: boolean;
  success: boolean;
  duration: number;
  error?: string;
  output?: string;
}

const results: TestResult[] = [];

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logSection(title: string): void {
  console.log("\n" + "=".repeat(70));
  console.log(`  ${title}`);
  console.log("=".repeat(70));
}

function logSuccess(message: string): void {
  console.log(`✓ ${message}`);
}

function logWarning(message: string): void {
  console.log(`⚠ ${message}`);
}

function logError(message: string): void {
  console.log(`✗ ${message}`);
}

function summarizeKey(key: string | undefined): string {
  if (!key) return "NOT SET";
  if (key.length < 10) return `INVALID (${key.length} chars)`;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

async function testAgentRouter(): Promise<void> {
  logSection("AgentRouter (PRIMARY)");

  const apiKey = process.env["AGENTROUTER_API_KEY"];
  const baseURL = process.env["AGENTROUTER_BASE_URL"] || "https://co.agentrouter.org/v1";
  const model = process.env["AGENTROUTER_MODEL_STANDARD"] || "auto";

  console.log(`API Key: ${summarizeKey(apiKey)}`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Model: ${model}`);

  if (!apiKey) {
    logWarning("AGENTROUTER_API_KEY not configured — skipping test");
    results.push({
      provider: "agentrouter",
      model,
      configured: false,
      tested: false,
      success: false,
      duration: 0,
      error: "API key not set",
    });
    return;
  }

  try {
    const start = Date.now();
    console.log("\nAttempting test request...");

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: "Say 'AgentRouter working' and nothing else.",
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorData = await response.text();
      const error = `HTTP ${response.status}: ${errorData.slice(0, 200)}`;
      logError(`Failed: ${error}`);
      results.push({
        provider: "agentrouter",
        model,
        configured: true,
        tested: true,
        success: false,
        duration,
        error,
      });
      return;
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const output = data.choices?.[0]?.message?.content || "(empty response)";

    logSuccess(`Success in ${duration}ms`);
    console.log(`Response: ${output.slice(0, 100)}`);

    results.push({
      provider: "agentrouter",
      model,
      configured: true,
      tested: true,
      success: true,
      duration,
      output,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError(`Error: ${error}`);
    results.push({
      provider: "agentrouter",
      model,
      configured: true,
      tested: true,
      success: false,
      duration: 0,
      error,
    });
  }
}

async function testGemini(): Promise<void> {
  logSection("Gemini (FALLBACK #1)");

  const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
  const model = process.env["GEMINI_MODEL_STANDARD"] || "gemini-2.5-flash";

  console.log(`API Key: ${summarizeKey(apiKey)}`);
  console.log(`Model: ${model}`);

  if (!apiKey) {
    logWarning("GEMINI_API_KEY/GOOGLE_API_KEY not configured — skipping test");
    results.push({
      provider: "gemini",
      model,
      configured: false,
      tested: false,
      success: false,
      duration: 0,
      error: "API key not set",
    });
    return;
  }

  try {
    const start = Date.now();
    console.log("\nAttempting test request...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Say 'Gemini working' and nothing else.",
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 50,
          },
        }),
      }
    );

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorData = await response.text();
      const error = `HTTP ${response.status}: ${errorData.slice(0, 200)}`;
      logError(`Failed: ${error}`);
      results.push({
        provider: "gemini",
        model,
        configured: true,
        tested: true,
        success: false,
        duration,
        error,
      });
      return;
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "(empty response)";

    logSuccess(`Success in ${duration}ms`);
    console.log(`Response: ${output.slice(0, 100)}`);

    results.push({
      provider: "gemini",
      model,
      configured: true,
      tested: true,
      success: true,
      duration,
      output,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError(`Error: ${error}`);
    results.push({
      provider: "gemini",
      model,
      configured: true,
      tested: true,
      success: false,
      duration: 0,
      error,
    });
  }
}

async function testGroq(): Promise<void> {
  logSection("Groq (FALLBACK #2)");

  const apiKey = process.env["GROQ_API_KEY"];
  const model = process.env["GROQ_MODEL_STANDARD"] || "openai/gpt-oss-20b";

  console.log(`API Key: ${summarizeKey(apiKey)}`);
  console.log(`Model: ${model}`);

  if (!apiKey) {
    logWarning("GROQ_API_KEY not configured — skipping test");
    results.push({
      provider: "groq",
      model,
      configured: false,
      tested: false,
      success: false,
      duration: 0,
      error: "API key not set",
    });
    return;
  }

  try {
    const start = Date.now();
    console.log("\nAttempting test request...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: "Say 'Groq working' and nothing else.",
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorData = await response.text();
      const error = `HTTP ${response.status}: ${errorData.slice(0, 200)}`;
      logError(`Failed: ${error}`);
      results.push({
        provider: "groq",
        model,
        configured: true,
        tested: true,
        success: false,
        duration,
        error,
      });
      return;
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const output = data.choices?.[0]?.message?.content || "(empty response)";

    logSuccess(`Success in ${duration}ms`);
    console.log(`Response: ${output.slice(0, 100)}`);

    results.push({
      provider: "groq",
      model,
      configured: true,
      tested: true,
      success: true,
      duration,
      output,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError(`Error: ${error}`);
    results.push({
      provider: "groq",
      model,
      configured: true,
      tested: true,
      success: false,
      duration: 0,
      error,
    });
  }
}

async function testOpenRouter(): Promise<void> {
  logSection("OpenRouter (FALLBACK #3)");

  const apiKey = process.env["OPENROUTER_API_KEY"];
  const model = process.env["OPENROUTER_MODEL_STANDARD"] || "openai/gpt-oss-20b";

  console.log(`API Key: ${summarizeKey(apiKey)}`);
  console.log(`Model: ${model}`);

  if (!apiKey) {
    logWarning("OPENROUTER_API_KEY not configured — skipping test");
    results.push({
      provider: "openrouter",
      model,
      configured: false,
      tested: false,
      success: false,
      duration: 0,
      error: "API key not set",
    });
    return;
  }

  try {
    const start = Date.now();
    console.log("\nAttempting test request...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env["PUBLIC_SITE_URL"] || "https://toolbuxx.site",
        "X-Title": "ToolboXX",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: "Say 'OpenRouter working' and nothing else.",
          },
        ],
        max_tokens: 50,
      }),
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorData = await response.text();
      const error = `HTTP ${response.status}: ${errorData.slice(0, 200)}`;
      logError(`Failed: ${error}`);
      results.push({
        provider: "openrouter",
        model,
        configured: true,
        tested: true,
        success: false,
        duration,
        error,
      });
      return;
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const output = data.choices?.[0]?.message?.content || "(empty response)";

    logSuccess(`Success in ${duration}ms`);
    console.log(`Response: ${output.slice(0, 100)}`);

    results.push({
      provider: "openrouter",
      model,
      configured: true,
      tested: true,
      success: true,
      duration,
      output,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logError(`Error: ${error}`);
    results.push({
      provider: "openrouter",
      model,
      configured: true,
      tested: true,
      success: false,
      duration: 0,
      error,
    });
  }
}

async function main(): Promise<void> {
  console.log("\n" + "═".repeat(70));
  console.log("  AI PROVIDER TEST SUITE");
  console.log("═".repeat(70));
  console.log("\nTesting all configured AI providers...\n");

  // Test each provider
  await testAgentRouter();
  await sleep(1000); // Rate limit courtesy delay

  await testGemini();
  await sleep(1000);

  await testGroq();
  await sleep(1000);

  await testOpenRouter();

  // Summary
  logSection("TEST SUMMARY");

  const configured = results.filter(r => r.configured).length;
  const tested = results.filter(r => r.tested).length;
  const passed = results.filter(r => r.success).length;

  console.log(`\nProviders Configured: ${configured}/${results.length}`);
  console.log(`Providers Tested:     ${tested}/${configured}`);
  console.log(`Providers Passed:     ${passed}/${tested}`);

  console.log("\nDetailed Results:");
  console.log("-".repeat(70));

  for (const result of results) {
    const status = !result.configured
      ? "NOT_CONFIGURED"
      : !result.tested
        ? "SKIPPED"
        : result.success
          ? "✓ PASS"
          : "✗ FAIL";

    console.log(
      `${status.padEnd(20)} ${result.provider.padEnd(15)} ${result.model.padEnd(30)} (${result.duration}ms)`
    );

    if (result.error) {
      console.log(`                     Error: ${result.error.slice(0, 100)}`);
    }
  }

  console.log("-".repeat(70));

  // Final assessment
  logSection("RECOMMENDATIONS");

  const failedProviders = results.filter(r => r.tested && !r.success);
  const configuredButNotTested = results.filter(r => r.configured && !r.tested);

  if (passed === 0) {
    logError("All providers failed! Check your API keys and network connectivity.");
  } else if (passed === configured) {
    logSuccess("All configured providers are working!");
  } else if (passed > 0) {
    logWarning(`${passed} provider(s) working, but ${failedProviders.length} provider(s) failed.`);
  }

  if (configuredButNotTested.length > 0) {
    logWarning(
      `${configuredButNotTested.length} provider(s) configured but not tested. Check the logs above.`
    );
  }

  console.log("\nNext Steps:");
  console.log("1. Verify API keys in .env.local or environment variables");
  console.log("2. Check provider documentation for model availability");
  console.log("3. Review error messages above for configuration issues");
  console.log("4. Update model IDs in .env if you see 'model_not_found' errors");
  console.log("5. Deploy and test the /ai/generate endpoint in production");

  console.log("\n" + "═".repeat(70) + "\n");

  // Exit with appropriate code
  process.exit(passed > 0 ? 0 : 1);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
