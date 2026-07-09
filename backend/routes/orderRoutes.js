import express from 'express';
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, getMyOrders);

router.get('/seller', protect, getSellerOrders);

router.route('/:id')
  .put(protect, updateOrderStatus);

export default router;
