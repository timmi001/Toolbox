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

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

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

1. Create a new Web Service on Render.
2. Connect this repository.
3. Choose Docker as the environment.
4. Set the start command to:
   ```bash
   npm start
   ```
5. Add environment variables:
   - PORT=3001
   - HOST=0.0.0.0
   - ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

## Docker

Build locally:
```bash
docker build -t video-downloader-backend .
```

Run locally:
```bash
docker run -p 3001:3001 --env-file .env video-downloader-backend
```
