const express = require('express');
const { getInfo, downloadVideoHandler, downloadAudioHandler } = require('../controllers/downloadController');

const router = express.Router();

router.post('/', getInfo);
router.post('/video', downloadVideoHandler);
router.post('/audio', downloadAudioHandler);

module.exports = router;
