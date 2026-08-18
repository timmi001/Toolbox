# Express 5 CORS Fix

**Status:** Deployment-safe fix  
**Issue:** A wildcard route registration could trigger Express 5 routing validation while handling CORS preflight.

---

## What Was Fixed

The backend now handles OPTIONS preflight requests in middleware instead of registering a route pattern.

```ts
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") {
    return next();
  }

  return cors(corsOptions)(req, res, () => {
    res.sendStatus(204);
  });
});
```

This preserves CORS behavior without creating a route string that Express 5 rejects.

---

## Why This Works

- No route is registered for the preflight path.
- The middleware handles only OPTIONS requests.
- Normal routing and API behavior remain unchanged.
- Express 5 validation is not triggered by a wildcard route pattern.

---

## Verification

- Build succeeds.
- Server startup is clean once required environment variables are present.
- The fix remains minimal and non-breaking.
