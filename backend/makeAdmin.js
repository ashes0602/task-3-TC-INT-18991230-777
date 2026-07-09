import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketplace');
    console.log('Connected to MongoDB');

    // Get email from command line arg
    const email = process.argv[2];
    
    if (!email) {
      console.log('Please provide an email address! Usage: node makeAdmin.js user@example.com');
      process.exit(1);
    }

    const user = await User.findOne({ email });

    if (user) {
      user.isAdmin = true;
      await user.save();
      console.log(`Success! User ${email} is now an Admin!`);
    } else {
      console.log(`User with email ${email} not found.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
