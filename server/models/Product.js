import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, default: '', maxlength: 5000 },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'RWF', enum: ['RWF'] },
  unit: { type: String, default: 'piece', maxlength: 24 },
  stock: { type: Number, default: 0, min: 0 },
  images: { type: [imageSchema], default: [] },
  refundPolicy: { type: String, default: 'Contact seller for return terms' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
export default mongoose.model('Product', productSchema);
