import express from 'express';
import { getMessages, getConversations, markAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.put('/:senderId/read', protect, markAsRead);

export default router;
