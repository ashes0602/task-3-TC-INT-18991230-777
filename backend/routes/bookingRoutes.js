import express from 'express';
import { createBooking, getMyBookings, getProviderBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, getMyBookings); // get bookings as customer

router.get('/provider', protect, getProviderBookings); // get incoming bookings

router.route('/:id')
  .put(protect, updateBookingStatus);

export default router;
