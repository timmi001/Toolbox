# ============================================================================
# ToolboxX API Server — Docker image for Render deployment
#
# Root cause of ERR_MODULE_NOT_FOUND for @google/genai (now fixed):
#   build.mjs had "@google/*" in the esbuild external list, which blocked
#   @google/genai from being bundled into dist/index.mjs. The runner stage
#   then had no node_modules path that Node could resolve it from.
#   Fix: "@google/*" removed from externals. "@google-cloud/*" stays external
#   because those packages load sibling .proto files at runtime.
#   @google/genai is now inlined into dist/index.mjs by esbuild.
#
# Architecture:
#   All JS dependencies (Express, pino, drizzle, @google/genai, workspace libs)
#   are bundled into dist/ by esbuild. The runner image needs zero node_modules.
#   Only FFmpeg is installed as an optional media-processing dependency.
#
# Build context: workspace root — api-server depends on lib/* workspace packages
#   that esbuild resolves and inlines at compile time.
#
# Render settings:
#   Root Directory:   . (workspace root)
#   Dockerfile Path:  ./Dockerfile
#   Health Check:     /api/healthz
# ============================================================================

# ── Stage 1: install workspace dependencies ──────────────────────────────────
FROM node:20-bookworm-slim AS deps

WORKDIR /workspace

# Install pnpm (same major version as local toolchain)
RUN npm install -g pnpm@10

# Copy workspace manifests for layer caching — re-runs only on lockfile changes
COPY .npmrc pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy every package.json that pnpm needs to resolve the workspace graph.
# pnpm reads these to understand which workspace packages exist before
# installing anything. Missing entries cause "workspace package not found" errors.
COPY scripts/package.json                  ./scripts/
COPY lib/api-zod/package.json              ./lib/api-zod/
COPY lib/api-spec/package.json             ./lib/api-spec/
COPY lib/db/package.json                   ./lib/db/
COPY lib/api-client-react/package.json     ./lib/api-client-react/
COPY artifacts/api-server/package.json     ./artifacts/api-server/

# Install only what api-server and its transitive workspace deps need.
# "--filter @workspace/api-server..." means: this package + all workspace deps.
RUN pnpm install --filter @workspace/api-server... --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /workspace

# Copy source for workspace lib packages — esbuild resolves these from source
# (they use "exports": "./src/index.ts" so no pre-compilation step is needed)
COPY lib/       ./lib/
COPY scripts/   ./scripts/

# Copy api-server source and build tooling
COPY artifacts/api-server/ ./artifacts/api-server/

# esbuild bundles everything into dist/index.mjs:
#   - all Express middleware, pino, drizzle-orm, zod, pg
#   - @google/genai (no longer external — pure ESM, safe to bundle)
#   - @workspace/api-zod and @workspace/db (workspace libs, inlined from source)
#   - pino transports get separate worker files via esbuild-plugin-pino
# Result: dist/ is self-contained; no runtime node_modules needed.
RUN pnpm --filter @workspace/api-server run build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
# The dist/ bundle is completely self-contained — all JS deps are inlined by
# esbuild. No node_modules are needed at runtime. FFmpeg remains installed for
# future media-processing providers.
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# System dependency retained for future media-processing providers.
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy the compiled bundle from the builder stage.
# This is the ONLY thing needed at runtime — dist/ contains everything.
COPY --from=builder /workspace/artifacts/api-server/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check — Render also polls /api/healthz via render.yaml
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:8080/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
