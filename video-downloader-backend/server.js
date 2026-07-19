const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const downloadRoutes = require('./routes/download');
const { verifyDependencies } = require('./services/downloader');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const tempDir = path.join(__dirname, 'temp');
const downloadsDir = path.join(__dirname, 'downloads');

fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(downloadsDir, { recursive: true });

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json({ limit: process.env.MAX_REQUEST_BODY_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_BODY_SIZE || '10mb' }));
app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/download', downloadRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, HOST, async () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
  
  // Verify dependencies on startup
  try {
    await verifyDependencies();
  } catch (error) {
    console.error('Failed to verify dependencies:', error.message);
  }
});
