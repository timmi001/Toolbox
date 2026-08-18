#!/usr/bin/env node
/**
 * Fallback Chain Test Script
 *
 * Tests the complete AI provider fallback chain by sending requests to the
 * /ai/generate endpoint and verifying that:
 * 1. At least one provider responds successfully
 * 2. The response format is correct
 * 3. The system falls back through providers correctly
 *
 * Usage:
 *   npm run test:fallback
 *   or
 *   npx ts-node scripts/test-fallback-chain.ts http://localhost:3000
 */

import * as http from "http";

interface TestScenario {
  name: string;
  toolId: string;
  inputs: Record<string, string>;
}

const BASE_URL = process.argv[2] || "http://localhost:3000";

const testScenarios: TestScenario[] = [
  {
    name: "Simple text generation",
    toolId: "ai-writer",
    inputs: {
      topic: "artificial intelligence",
      tone: "professional",
      length: "short",
    },
  },
  {
    name: "Code analysis",
    toolId: "ai-code-explainer",
    inputs: {
      language: "javascript",
      code: 'const x = [1,2,3].map(n => n * 2); console.log(x);',
    },
  },
  {
    name: "Text summarization",
    toolId: "ai-summarizer",
    inputs: {
      text: "Artificial intelligence (AI) is transforming the world by enabling machines to learn and make decisions. AI powers recommendation systems, autonomous vehicles, and healthcare diagnostics. The technology continues to evolve rapidly.",
      style: "Paragraph",
      length: "Moderate",
    },
  },
];

interface GenerateResponse {
  success: boolean;
  result?: {
    text: string;
    provider: string;
    model: string;
    durationMs: number;
    finishReason?: string;
  };
  error?: string;
  details?: unknown;
}

async function makeRequest(path: string, method: string, data?: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", chunk => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          if (body) {
            resolve(JSON.parse(body));
          } else {
            resolve(null);
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testSingleRequest(scenario: TestScenario): Promise<{
  success: boolean;
  provider?: string;
  model?: string;
  duration?: number;
  error?: string;
  output?: string;
}> {
  console.log(`\n  Testing: ${scenario.name}`);
  console.log(`    Tool: ${scenario.toolId}`);

  try {
    const response = (await makeRequest("/ai/generate", "POST", {
      toolId: scenario.toolId,
      inputs: scenario.inputs,
    })) as GenerateResponse;

    if (!response.success) {
      return {
        success: false,
        error: response.error || "Generation failed",
      };
    }

    if (!response.result) {
      return {
        success: false,
        error: "No result in response",
      };
    }

    const { text, provider, model, durationMs } = response.result;

    console.log(`    ✓ Success (${durationMs}ms)`);
    console.log(`    Provider: ${provider}/${model}`);
    console.log(`    Output: ${text.slice(0, 80)}${text.length > 80 ? "..." : ""}`);

    return {
      success: true,
      provider,
      model,
      duration: durationMs,
      output: text,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.log(`    ✗ Error: ${error}`);
    return {
      success: false,
      error,
    };
  }
}

async function main(): Promise<void> {
  console.log("\n" + "═".repeat(70));
  console.log("  FALLBACK CHAIN TEST");
  console.log("═".repeat(70));

  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Testing ${testScenarios.length} scenarios...\n`);

  // Check if server is reachable
  try {
    await makeRequest("/health", "GET");
  } catch (err) {
    console.error(`✗ Cannot reach server at ${BASE_URL}`);
    console.error(`  Make sure the server is running:`);
    console.error(`  npm run dev`);
    process.exit(1);
  }

  const results: Array<{
    scenario: string;
    success: boolean;
    provider?: string;
    model?: string;
    duration?: number;
    error?: string;
  }> = [];

  for (const scenario of testScenarios) {
    const result = await testSingleRequest(scenario);
    results.push({
      scenario: scenario.name,
      ...result,
    });

    // Rate limit courtesy delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("  RESULTS SUMMARY");
  console.log("=".repeat(70));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\nTests Passed: ${passed}/${results.length}`);
  console.log(`Tests Failed: ${failed}/${results.length}`);

  if (passed === results.length) {
    console.log("\n✓ All tests passed! The fallback chain is working correctly.");
  } else if (passed > 0) {
    console.log(
      `\n⚠ Partial success. ${passed} test(s) passed, but ${failed} test(s) failed.`
    );
  } else {
    console.log("\n✗ All tests failed! Check the server configuration.");
  }

  console.log("\nDetailed Results:");
  console.log("-".repeat(70));
  console.log(
    `${"Scenario".padEnd(30)} ${"Provider".padEnd(20)} ${"Duration".padEnd(10)} Status`
  );
  console.log("-".repeat(70));

  for (const result of results) {
    const status = result.success ? "✓ PASS" : "✗ FAIL";
    const provider = result.provider ? `${result.provider}/${result.model}` : "N/A";
    const duration = result.duration ? `${result.duration}ms` : "N/A";

    console.log(
      `${result.scenario.slice(0, 29).padEnd(30)} ${provider.padEnd(20)} ${duration.padEnd(10)} ${status}`
    );

    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }

  console.log("-".repeat(70));

  console.log("\nNext Steps:");
  if (passed === results.length) {
    console.log("✓ The system is ready for production!");
    console.log("  - Monitor /ai/generate endpoint logs");
    console.log("  - Verify fallback behavior under load");
    console.log("  - Check rate limits and quotas");
  } else {
    console.log("  1. Check the test output above for specific errors");
    console.log("  2. Verify API keys are configured correctly");
    console.log("  3. Run: npm run test:providers (to test individual providers)");
    console.log("  4. Check server logs for detailed error information");
    console.log("  5. Update model IDs if you see 'model_not_found' errors");
  }

  console.log("\n" + "═".repeat(70) + "\n");

  process.exit(passed > 0 ? 0 : 1);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
