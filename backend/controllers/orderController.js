import Order from '../models/Order.js';

// Place a new order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      customer: req.user._id,
      items,
      totalAmount,
      shippingAddress
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders where user is the customer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get incoming orders for a seller
export const getSellerOrders = async (req, res) => {
  try {
    // Find all orders that contain at least one item sold by this user
    const orders = await Order.find({ 'items.seller': req.user._id }).sort({ createdAt: -1 }).populate('customer', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (for sellers)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Ensure the user is a seller of at least one item in this order, or the customer cancelling it
    const isSeller = order.items.some(item => item.seller.toString() === req.user._id.toString());
    const isCustomer = order.customer.toString() === req.user._id.toString();

    if (isSeller) {
      if (['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        order.status = status;
      }
    } else if (isCustomer && status === 'cancelled') {
      order.status = status;
    } else {
      return res.status(401).json({ message: 'Not authorized to update this order' });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
