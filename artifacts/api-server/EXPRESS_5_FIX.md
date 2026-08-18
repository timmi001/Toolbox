# Express 5 CORS Middleware Fix

**Status:** Fixed and verified for Express 5  
**Issue:** Invalid wildcard route registration in the app setup could trigger Express 5 path validation errors.

---

## What Changed

The app no longer registers a wildcard route for CORS preflight. Instead, it handles OPTIONS requests in middleware before the routers mount.

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

This keeps CORS preflight behavior intact without creating a route pattern that Express 5 rejects.

---

## Why This Is Safe

- It avoids route registration entirely.
- It preserves preflight handling for all paths.
- It does not change the API route structure or behavior.
- It works with Express 5's stricter route validation.

---

## Verification

- TypeScript build succeeds.
- The app is no longer registering a wildcard route.
- Startup is validated with the required environment variables set.

---

## Notes

This fix is intentionally minimal: it only addresses the Express 5 invalid route registration while keeping the rest of the backend, routing, and CORS behavior unchanged.
