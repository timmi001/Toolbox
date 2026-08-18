# AI Provider Configuration Guide

## Overview

This guide covers the AI provider configuration for the ToolboXX /ai/generate endpoint. The system uses a resilient fallback chain that automatically switches between providers when one fails.

**Provider Order (Primary → Fallback):**
1. **AgentRouter** (Primary)
2. **Gemini** (Fallback #1)
3. **Groq** (Fallback #2)
4. **OpenRouter** (Fallback #3)

## Configuration

### Environment Variables

All AI provider configuration is done through environment variables. See `.env.example` for complete reference.

#### Required Variables
- `AGENTROUTER_API_KEY` — AgentRouter API key (PRIMARY provider)
- `PORT` — Server port (default: 3000)

#### Optional Variables (for fallback providers)
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` — Gemini API key
- `GROQ_API_KEY` — Groq API key
- `OPENROUTER_API_KEY` — OpenRouter API key

#### Model Configuration (Optional)
Override default model IDs if providers retire models:

```env
# Gemini (default: gemini-2.0-flash)
GEMINI_MODEL_STANDARD=gemini-2.0-flash
GEMINI_MODEL_COMPLEX=gemini-2.0-flash

# Groq (default: llama-3.3-70b-versatile)
GROQ_MODEL_STANDARD=llama-3.3-70b-versatile
GROQ_MODEL_COMPLEX=llama-3.3-70b-versatile

# OpenRouter (defaults: meta-llama/llama-3.1-8b-instruct, meta-llama/llama-3.1-70b-instruct)
OPENROUTER_MODEL_STANDARD=meta-llama/llama-3.1-8b-instruct
OPENROUTER_MODEL_COMPLEX=meta-llama/llama-3.1-70b-instruct

# AgentRouter (default: auto)
AGENTROUTER_MODEL_STANDARD=auto
AGENTROUTER_MODEL_COMPLEX=auto
```

## Deployment Steps

### 1. Set Environment Variables

Create `.env.local` or add to your hosting platform's environment variables:

```bash
# Production environment (Render, Vercel, etc.)
AGENTROUTER_API_KEY=<your_api_key>
GEMINI_API_KEY=<your_api_key>
GROQ_API_KEY=<your_api_key>
OPENROUTER_API_KEY=<your_api_key>
PORT=3000
```

### 2. Verify Configuration

Before deploying, run the test suite:

```bash
# Test individual providers
npx ts-node scripts/test-ai-providers.ts

# Test fallback chain (requires server running on http://localhost:3000)
npm run dev &  # Start development server
npx ts-node scripts/test-fallback-chain.ts http://localhost:3000
```

### 3. Check Startup Logs

Monitor startup for configuration validation:

```
✓ AgentRouter API key validated at startup
✓ All AI provider keys are configured — full fallback chain available.
✓ Server listening on port 3000
```

### 4. Test Production Endpoint

Make a simple test request:

```bash
curl -X POST http://your-domain.com/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "ai-writer",
    "inputs": {
      "topic": "test",
      "tone": "professional",
      "length": "short"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "result": {
    "text": "...",
    "provider": "agentrouter",
    "model": "auto",
    "durationMs": 1234,
    "finishReason": "stop"
  }
}
```

## Model Availability

### Current Working Models

**Gemini:**
- `gemini-2.0-flash` ✓ (recommended)
- `gemini-2.0-flash-thinking` ✓
- `gemini-1.5-pro` ✓ (older)
- `gemini-1.5-flash` ✓ (older)

**Groq:**
- `llama-3.3-70b-versatile` ✓ (recommended, most capable)
- `llama-3.1-70b-versatile` ✓
- `llama-3.1-8b-instant` ✗ (RETIRED)
- `mixtral-8x7b-32768` ✓ (experimental)

**OpenRouter:**
- `meta-llama/llama-3.1-8b-instruct` ✓ (recommended for speed)
- `meta-llama/llama-3.1-70b-instruct` ✓ (recommended for quality)
- `google/gemini-2.0-flash` ✓
- `anthropic/claude-3.5-sonnet` ✓

**AgentRouter:**
- `auto` ✓ (recommended - lets AgentRouter choose)
- Provider-specific model IDs also supported

### Deprecated Models (Will Return 404)

- ✗ `gemini-2.0-flash-lite` (Gemini)
- ✗ `gemini-2.5-flash-lite` (Gemini)
- ✗ `llama-3.1-8b-instant` (Groq)
- ✗ `google/gemini-2.0-flash-lite-001` (OpenRouter)
- ✗ `google/gemini-2.0-flash-001` (OpenRouter)

## Troubleshooting

### Issue: Server Fails to Start

**Error:** `AGENTROUTER_API_KEY is not set`

**Solution:**
1. Verify `AGENTROUTER_API_KEY` is set in environment
2. Check that the key is not wrapped in quotes in your `.env` file
3. Restart the server after setting the variable

### Issue: All Providers Return model_not_found

**Solution:**
1. Run `npm run test:providers` to check which models are available
2. Update the corresponding environment variable:
   ```bash
   GEMINI_MODEL_STANDARD=gemini-2.0-flash
   GROQ_MODEL_STANDARD=llama-3.3-70b-versatile
   ```
3. Restart the server

### Issue: AgentRouter Returns auth_failure

**Solution:**
1. Verify `AGENTROUTER_API_KEY` is correct: `curl -H "Authorization: Bearer YOUR_KEY" https://co.agentrouter.org/v1/models`
2. Check key doesn't have extra whitespace or quotes
3. Verify key has minimum 10 characters
4. Check that base URL is correct: `https://co.agentrouter.org/v1` (default)
5. Test fallback to ensure system still works with other providers

### Issue: Timeouts or Slow Responses

**Investigation:**
- Check which provider is handling the request in logs
- Look for `[ai-service]` prefixed log messages
- Check provider's rate limits and quotas
- Complex tools have 60s timeout; standard tools have 30s timeout

**Solution:**
- Monitor response times for each provider
- Consider upgrading provider quotas
- Implement caching for repeated requests
- Use fallback providers with lower latency

### Issue: Rate Limits Being Hit

**Solution:**
1. Check which provider is rate-limited in logs
2. Implement request queuing/rate limiting on your side
3. Upgrade provider quota/plan
4. Distribute requests across multiple providers

## Logging and Monitoring

### Log Format

Each AI request generates detailed logs:

```
[ai-service][request-id] → agentrouter/auto (attempt 1)
[ai-service][request-id] ✓ agentrouter/auto in 1234ms
```

Fallback example:
```
[ai-service][request-id] → agentrouter/auto (attempt 1)
[ai-service][request-id] ✗ agentrouter/auto — auth_failure: 401 Unauthorized
[ai-service][request-id] → gemini/gemini-2.0-flash (attempt 1)
[ai-service][request-id] ✓ gemini/gemini-2.0-flash in 2345ms
```

### Monitoring Recommendations

- Track which provider is being used for each request
- Monitor fallback frequency (if agentrouter failing often)
- Alert on all-providers-exhausted errors
- Monitor per-provider error rates
- Track response times per provider

## Performance Tuning

### Timeouts
- **Standard requests:** 30 seconds (most tools)
- **Complex requests:** 60 seconds (essay, long-form tools)

### Retry Strategy
- Up to 2 retries per provider
- 200ms exponential backoff between retries
- Retries only for transient errors (network, 5xx)
- Fallback immediately for: 404, 429, auth failures

### Rate Limiting
- Global rate limiter: 100 requests per 15 minutes per IP
- Per-provider quotas: Check provider documentation
- Consider implementing request queuing for high-volume

## Cost Optimization

### Provider Pricing (Approximate, Verify Current)
1. **AgentRouter** - Variable based on routed model
2. **Gemini** - Free tier available, pay-as-you-go
3. **Groq** - Most cost-effective for inference
4. **OpenRouter** - Aggregated pricing across models

### Optimization Tips
1. Use AgentRouter for auto-routing to cost-effective models
2. Set Groq as primary fallback (low cost)
3. Use Gemini as secondary (reliable, free tier)
4. Reserve OpenRouter for when others fail
5. Monitor costs and adjust model selection

## API Endpoint Reference

### POST /ai/generate

Generate AI response for a tool.

**Request:**
```json
{
  "toolId": "ai-writer",
  "inputs": {
    "topic": "string",
    "tone": "professional",
    "length": "short"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "result": {
    "text": "Generated content...",
    "provider": "agentrouter",
    "model": "auto",
    "durationMs": 1234,
    "finishReason": "stop",
    "usage": {
      "promptTokens": 50,
      "completionTokens": 150,
      "totalTokens": 200
    }
  }
}
```

**Response (Failure - All Providers Exhausted):**
```json
{
  "success": false,
  "message": "All AI providers are currently unavailable. Summary=agentrouter/auto(auth_failure) → gemini/gemini-2.0-flash(rate_limit) → groq/llama-3.3-70b-versatile(timeout) → openrouter/llama-3.1-8b-instruct(rate_limit); last=openrouter/llama-3.1-8b-instruct reason=rate_limit code=429",
  "statusCode": 429
}
```

## Migration Guide

### Upgrading from Old Configuration

If upgrading from a configuration without environment-variable based models:

1. Update startup code to call `validateAgentRouterEnv()`
2. Update model IDs in `PROVIDER_MODELS`
3. Set environment variables for model overrides (if needed)
4. Redeploy and test with `npm run test:providers`

### Rollback

If you need to rollback to a previous model:

1. Set environment variable to override: `GEMINI_MODEL_STANDARD=gemini-1.5-pro`
2. Restart server (no code changes needed)
3. Test with `npm run test:fallback`

## Support & Resources

- **AgentRouter Docs:** https://agentrouter.org/docs
- **Gemini Docs:** https://ai.google.dev/docs
- **Groq Docs:** https://console.groq.com/docs
- **OpenRouter Docs:** https://openrouter.ai/docs

## Checklist for Production Deployment

- [ ] All required environment variables set
- [ ] AGENTROUTER_API_KEY is valid and configured
- [ ] At least one fallback provider configured
- [ ] Ran `npm run test:providers` successfully
- [ ] Ran `npm run test:fallback` successfully
- [ ] Verified logs show correct provider order
- [ ] Tested /ai/generate endpoint manually
- [ ] Monitored logs for first 24 hours
- [ ] Verified fallback behavior works
- [ ] Set up monitoring/alerting for provider failures
- [ ] Documented custom model selections
