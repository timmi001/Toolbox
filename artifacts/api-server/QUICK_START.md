# Quick Start: AI Provider Configuration

## 5-Minute Setup

### Step 1: Get API Keys
1. AgentRouter: https://agentrouter.org/dashboard
2. Gemini: https://aistudio.google.com/apikey
3. Groq: https://console.groq.com/keys
4. OpenRouter: https://openrouter.ai/keys

### Step 2: Configure Environment
Create `.env.local`:
```env
AGENTROUTER_API_KEY=your_agentrouter_key_here
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
PORT=3000
```

### Step 3: Test Configuration
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test providers (in api-server directory)
cd artifacts/api-server
npx ts-node scripts/test-ai-providers.ts

# Terminal 2: Test fallback chain
npx ts-node scripts/test-fallback-chain.ts http://localhost:3000
```

### Step 4: Verify Success
Look for output like:
```
✓ AgentRouter: Success in 1234ms
✓ Gemini: Success in 2345ms
✓ Groq: Success in 3456ms
✓ OpenRouter: Success in 4567ms

Tests Passed: 4/4
✓ All tests passed! The fallback chain is working correctly.
```

## Common Issues & Fixes

### "AGENTROUTER_API_KEY is not set"
**Fix:** Add to `.env.local`:
```env
AGENTROUTER_API_KEY=your_key_here
```

### "model_not_found" errors
**Fix:** Update in `.env.local`:
```env
GEMINI_MODEL_STANDARD=gemini-2.0-flash
GROQ_MODEL_STANDARD=llama-3.3-70b-versatile
OPENROUTER_MODEL_STANDARD=meta-llama/llama-3.1-8b-instruct
```

### "Cannot reach server at http://localhost:3000"
**Fix:** Make sure dev server is running:
```bash
npm run dev
```

### Tests say "Auth failed" for AgentRouter
**Fix:** Verify your API key is correct:
1. Go to https://agentrouter.org/dashboard
2. Copy the API key exactly (no extra spaces)
3. Paste into `.env.local` as `AGENTROUTER_API_KEY=...`

## What Was Changed

### Model IDs Updated
| Provider | Old Model | New Model |
|----------|-----------|-----------|
| Gemini | gemini-2.0-flash-lite ❌ | gemini-2.0-flash ✓ |
| Groq | llama-3.1-8b-instant ❌ | llama-3.3-70b-versatile ✓ |
| OpenRouter | google/gemini-2.0-flash-lite-001 ❌ | meta-llama/llama-3.1-8b-instruct ✓ |
| AgentRouter | (various) ❌ | auto ✓ |

### Code Changes
1. **src/lib/ai-service.ts** - Added environment-variable based model configuration
2. **src/index.ts** - Added AgentRouter validation at startup
3. **.env.example** - Created comprehensive configuration reference
4. **scripts/test-ai-providers.ts** - New: Test individual providers
5. **scripts/test-fallback-chain.ts** - New: Test entire fallback chain
6. **AI_PROVIDER_GUIDE.md** - New: Comprehensive deployment guide

### Zero Breaking Changes
- No API endpoint changes
- No response format changes
- Frontend code unchanged
- Existing error handling still works

## Provider Fallback Order

```
Request to /ai/generate
    ↓
Try AgentRouter (PRIMARY)
    ├─ Success? → Return response ✓
    ├─ Failed? → Log and continue ↓
    ↓
Try Gemini (FALLBACK #1)
    ├─ Success? → Return response ✓
    ├─ Failed? → Log and continue ↓
    ↓
Try Groq (FALLBACK #2)
    ├─ Success? → Return response ✓
    ├─ Failed? → Log and continue ↓
    ↓
Try OpenRouter (FALLBACK #3)
    ├─ Success? → Return response ✓
    ├─ Failed? → Return error ✗
```

## How to Update Model IDs (When Provider Retires One)

1. **Option A: Environment Variable (Recommended)**
   ```env
   GEMINI_MODEL_STANDARD=gemini-1.5-pro
   ```
   No code changes needed! Just restart server.

2. **Option B: Update Code**
   Edit `src/lib/ai-service.ts` in `getModelId()` defaults
   Then redeploy

## Monitoring Production

### Check Which Provider Handled Request
Look at `/ai/generate` response:
```json
{
  "result": {
    "provider": "agentrouter",  // ← Shows which provider
    "model": "auto",
    "durationMs": 1234
  }
}
```

### Check Server Logs
Look for `[ai-service]` prefix:
```
[ai-service][request-id] → agentrouter/auto (attempt 1)
[ai-service][request-id] ✓ agentrouter/auto in 1234ms
```

Or if fallback happened:
```
[ai-service][request-id] → agentrouter/auto (attempt 1)
[ai-service][request-id] ✗ agentrouter/auto — auth_failure: 401
[ai-service][request-id] → gemini/gemini-2.0-flash (attempt 1)
[ai-service][request-id] ✓ gemini/gemini-2.0-flash in 2345ms
```

## Deployment to Production (Render, Vercel, etc.)

### 1. Add Environment Variables
In your platform's settings:
```
AGENTROUTER_API_KEY = sk_...
GEMINI_API_KEY = AIza...
GROQ_API_KEY = gsk_...
OPENROUTER_API_KEY = sk-...
```

### 2. Deploy
```bash
git push  # Deploy normally
```

### 3. Test Production
```bash
curl -X POST https://your-domain.com/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"toolId":"ai-writer","inputs":{"topic":"test","tone":"professional","length":"short"}}'
```

### 4. Monitor Logs
```bash
# Render: renderctl logs
# Vercel: vercel logs
# Or check your platform's dashboard
```

Look for:
- ✓ Startup: "AgentRouter API key validated at startup"
- ✓ Requests: "[ai-service] → agentrouter" or provider fallback
- ✓ No errors: "model_not_found", "auth_failure", etc.

## Performance Notes

- **AgentRouter:** Fastest (if working) - Primary
- **Gemini:** Reliable, free tier - First fallback
- **Groq:** Cost-effective - Second fallback
- **OpenRouter:** All-models access - Last fallback

Typical latencies:
- AgentRouter: 0.5-2s
- Gemini: 1-3s
- Groq: 1-4s
- OpenRouter: 1-5s

## File Structure

```
artifacts/api-server/
├── src/
│   ├── lib/
│   │   ├── ai-service.ts          ← Model configuration here
│   │   └── ai-providers.ts        ← (No changes)
│   ├── routes/
│   │   └── ai.ts                  ← (No changes)
│   └── index.ts                   ← Startup validation here
├── scripts/
│   ├── test-ai-providers.ts       ← NEW: Provider testing
│   └── test-fallback-chain.ts     ← NEW: Fallback chain testing
├── .env.example                   ← NEW: Configuration reference
├── AI_PROVIDER_GUIDE.md           ← NEW: Full documentation
└── AI_PROVIDER_FIX_SUMMARY.md     ← NEW: This summary
```

## Next Steps

1. ✅ Copy `.env.example` to `.env.local`
2. ✅ Fill in your API keys
3. ✅ Run `npm run test:providers`
4. ✅ Run `npm run test:fallback`
5. ✅ Deploy with confidence!

## Support

- **Setup Issues:** Check `.env.example` for all variables
- **Model Issues:** Run `npm run test:providers` to see available models
- **Fallback Issues:** Run `npm run test:fallback` to trace the chain
- **Production Issues:** Check logs for `[ai-service]` messages

---

**Ready to deploy!** Questions? See `AI_PROVIDER_GUIDE.md` for detailed documentation.
