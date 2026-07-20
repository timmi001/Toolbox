# ============================================================================
# ToolboxX API Server — Docker image for Render deployment
#
# Build context: workspace root (required — api-server depends on workspace
# lib packages lib/api-zod and lib/db which esbuild bundles at build time).
#
# Render settings:
#   Root Directory:   . (workspace root)
#   Dockerfile Path:  ./Dockerfile
#   Health Check:     /api/healthz
# ============================================================================

# ── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /workspace

# Install pnpm
RUN npm install -g pnpm@10

# Copy workspace manifests — cached layer, only re-runs on lockfile changes
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy repository scripts that may be needed by workspace tooling/runtime steps
COPY scripts/ ./scripts/

# Copy every package.json needed for workspace resolution
# (only api-server and the lib packages it imports at build time)
COPY lib/api-zod/package.json       ./lib/api-zod/
COPY lib/api-spec/package.json      ./lib/api-spec/
COPY lib/db/package.json            ./lib/db/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install deps for api-server and all its workspace dependencies
# --filter @workspace/api-server... means "this package + all its deps"
RUN pnpm install --filter @workspace/api-server... --frozen-lockfile

# Copy source for the lib packages esbuild needs to bundle
COPY lib/ ./lib/

# Copy api-server source + build script
COPY artifacts/api-server/ ./artifacts/api-server/

# Compile TypeScript → dist/index.mjs (esbuild bundles workspace libs inline)
RUN pnpm --filter @workspace/api-server run build

# ── Stage 2: runner ───────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# System dependencies
#   ffmpeg   — required by yt-dlp for audio extraction (-x) and format muxing
#   python3 + pip — needed to install and run yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        python3 \
        python3-pip \
        python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp into an isolated venv (avoids Debian's pip isolation policy
# on Bookworm and keeps yt-dlp upgradeable without touching system Python)
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir yt-dlp

# Put the venv on PATH so `yt-dlp` is resolvable by the Node process
ENV PATH="/opt/venv/bin:$PATH"

# Install pnpm (needed to run the start script via pnpm if desired;
# also keeps the node_modules symlink structure intact)
RUN npm install -g pnpm@10

# Copy compiled bundle from builder — this is the only thing we need at runtime
COPY --from=builder /workspace/artifacts/api-server/dist ./dist

# Copy the full workspace package tree so runtime resolution works for workspace
# dependencies such as @workspace/api-zod, @workspace/db, and installed packages
# like @google/genai.
COPY --from=builder /workspace/package.json ./package.json
COPY --from=builder /workspace/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /workspace/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/artifacts ./artifacts
COPY --from=builder /workspace/lib ./lib
COPY --from=builder /workspace/scripts ./scripts

# Preserve the API server package's own node_modules tree. This is where
# pnpm places package installations for workspace packages such as
# @google/genai, and it's the path Node resolves from the built bundle.
COPY --from=builder /workspace/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=builder /workspace/artifacts/api-server/package.json ./artifacts/api-server/package.json

# Runtime configuration
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check — Render will also poll /api/healthz via render.yaml
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:8080/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
