import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  deliveryTime: { type: String, required: true }, // e.g., '3 days'
  availability: { type: Boolean, default: true },
  portfolioImages: [{ type: String }],
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
