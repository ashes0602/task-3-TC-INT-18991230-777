import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

export const createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, notes } = req.body;
    
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own service' });
    }

    const booking = new Booking({
      service: serviceId,
      customer: req.user._id,
      provider: service.provider,
      bookingDate,
      notes
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    // Bookings where user is the customer
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('service', 'title price')
      .populate('provider', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    // Bookings where user is the provider (incoming requests)
    const bookings = await Booking.find({ provider: req.user._id })
      .populate('service', 'title price')
      .populate('customer', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only provider can accept/reject/complete, customer can cancel
    if (booking.provider.toString() === req.user._id.toString()) {
      if (['accepted', 'rejected', 'completed'].includes(status)) {
        booking.status = status;
      }
    } else if (booking.customer.toString() === req.user._id.toString()) {
      if (status === 'cancelled') {
        booking.status = status;
      }
    } else {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
