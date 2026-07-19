# Video Downloader Backend

A production-ready Node.js + Express backend for downloading videos and audio from supported sites using yt-dlp and FFmpeg.

## Features

- Secure Express server with Helmet, CORS, compression and rate limiting
- Modular architecture with controllers, services, routes and middleware
- Health check endpoint
- URL validation and error handling
- Temporary file handling and cleanup support
- Docker-ready deployment instructions for Render

## Local Development

### Prerequisites

Before running the server locally, ensure you have yt-dlp and FFmpeg installed:

**macOS:**
```bash
brew install yt-dlp ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install yt-dlp ffmpeg
```

**Windows:**
Download and install:
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (via Chocolatey: `choco install yt-dlp`)
- [FFmpeg](https://ffmpeg.org/download.html)

Or via Python:
```bash
pip install yt-dlp
```

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
3. Verify dependencies are installed:
   ```bash
   yt-dlp --version
   ffmpeg -version
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

The server will log a verification message confirming all dependencies are available.

## API Endpoints

### Health
```bash
GET /health
```

### Inspect URL
```bash
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Download Video
```bash
POST /api/download/video
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "best"
}
```

### Download Audio
```bash
POST /api/download/audio
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp3"
}
```

## Render Deployment

### Option 1: Render Dashboard

1. Create a new Web Service on Render.
2. Connect this repository.
3. Choose Docker as the environment.
4. Use the following start command:
   ```bash
   npm start
   ```
5. Add these environment variables:
   - PORT=3001
   - HOST=0.0.0.0
   - NODE_ENV=production
   - ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   - MAX_REQUEST_BODY_SIZE=10mb

### Option 2: Render Blueprint

Render will also pick up the included [render.yaml](render.yaml) file.

### Docker Commands

Build locally:
```bash
docker build -t video-downloader-backend .
```

Run locally:
```bash
docker run -p 3001:3001 --env-file .env video-downloader-backend
```

## Docker

Build locally:
```bash
docker build -t video-downloader-backend .
```

Run locally:
```bash
docker run -p 3001:3001 --env-file .env video-downloader-backend
```
