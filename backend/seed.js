import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Service from './models/Service.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketplace';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Service.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'admin' },
      { name: 'Jane Seller', email: 'jane@example.com', password: hashedPassword, role: 'user' },
      { name: 'John Provider', email: 'john@example.com', password: hashedPassword, role: 'user' }
    ]);

    const sellerId = createdUsers[1]._id;
    const providerId = createdUsers[2]._id;

    await Product.insertMany([
      {
        title: 'Wireless Headphones',
        description: 'High-quality noise-canceling wireless headphones.',
        price: 199.99,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
        seller: sellerId,
        stock: 15
      },
      {
        title: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with cherry MX switches.',
        price: 129.50,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80'],
        seller: sellerId,
        stock: 5
      },
      {
        title: 'Running Shoes',
        description: 'Comfortable running shoes for men and women.',
        price: 89.99,
        category: 'Fashion',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'],
        seller: sellerId,
        stock: 30
      }
    ]);

    await Service.insertMany([
      {
        title: 'Web Development',
        description: 'I will build a modern, responsive website using React and Node.js.',
        price: 500,
        category: 'Programming',
        deliveryTime: '7 days',
        provider: providerId,
        portfolioImages: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80']
      },
      {
        title: 'Graphic Design',
        description: 'I will design a unique and professional logo for your brand.',
        price: 150,
        category: 'Design',
        deliveryTime: '3 days',
        provider: providerId,
        portfolioImages: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&q=80']
      }
    ]);

    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
