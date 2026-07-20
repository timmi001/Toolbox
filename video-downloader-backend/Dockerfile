FROM node:20-bullseye

WORKDIR /app

# ============================================================================
# Stage 1: Install system dependencies (ffmpeg, python3, pip)
# ============================================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Stage 2: Install yt-dlp and verify it's discoverable on PATH
# ============================================================================
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir yt-dlp

# Verify yt-dlp is installed and accessible
RUN echo "Verifying yt-dlp installation..." && \
    which yt-dlp || (echo "ERROR: yt-dlp not found on PATH"; exit 1) && \
    yt-dlp --version && \
    echo "✓ yt-dlp verified"

# Verify ffmpeg is installed
RUN echo "Verifying ffmpeg installation..." && \
    which ffmpeg || (echo "ERROR: ffmpeg not found on PATH"; exit 1) && \
    ffmpeg -version | head -1 && \
    echo "✓ ffmpeg verified"

# Create explicit symlinks to ensure discoverability by Node
RUN YT_DLP_PATH=$(which yt-dlp) && \
    mkdir -p /usr/local/bin && \
    ln -sf $YT_DLP_PATH /usr/local/bin/yt-dlp || true

# Final verification: test that Node can find these binaries
RUN node -e "const { execSync } = require('child_process'); try { execSync('yt-dlp --version'); console.log('✓ Node can access yt-dlp'); } catch(e) { console.error('✗ Node cannot access yt-dlp:', e.message); process.exit(1); }"

# ============================================================================
# Stage 3: Build Node application
# ============================================================================
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3001

# ============================================================================
# Startup: Run health checks and start server
# ============================================================================
CMD ["npm", "start"]
