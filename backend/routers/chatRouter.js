const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, chatController.getHistory);
router.get('/history/:sessionId', protect, chatController.getChatBySessionId);
router.post('/chat', protect, chatController.handleChat);

module.exports = router;
