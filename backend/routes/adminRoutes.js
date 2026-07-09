import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getStats,
  getUsers,
  deleteUser,
  getProducts,
  deleteProduct,
  getServices,
  deleteService
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', protect, admin, getStats);

router.route('/users')
  .get(protect, admin, getUsers);
router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/products')
  .get(protect, admin, getProducts);
router.route('/products/:id')
  .delete(protect, admin, deleteProduct);

router.route('/services')
  .get(protect, admin, getServices);
router.route('/services/:id')
  .delete(protect, admin, deleteService);

export default router;
