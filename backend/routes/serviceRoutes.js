import express from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, updateService)
  .delete(protect, deleteService);

export default router;
