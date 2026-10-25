import express from 'express';
import { chat, getChatHistory, clearChatHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chat', chat);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
