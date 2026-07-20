FROM node:20-bullseye

WORKDIR /app

ENV PATH=/usr/local/bin:/usr/bin:/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN python3 --version && \
    python3 -m pip --version && \
    python3 -m pip install --no-cache-dir --break-system-packages yt-dlp && \
    yt-dlp --version && \
    ffmpeg -version | head -n 1 && \
    which yt-dlp && \
    which ffmpeg

RUN test -x "$(command -v yt-dlp)" && \
    test -x "$(command -v ffmpeg)"

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
