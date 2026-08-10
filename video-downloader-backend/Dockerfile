FROM node:20-bullseye

WORKDIR /app

ENV PATH=/usr/local/bin:/usr/bin:/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN ffmpeg -version | head -n 1 && \
    test -x "$(command -v ffmpeg)"

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
