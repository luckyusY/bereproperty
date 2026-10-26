import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '', maxlength: 2000 },
  category: { type: String, default: 'Retailer' },
  phone: { type: String, default: '', trim: true },
  country: { type: String, default: 'Rwanda' },
  province: { type: String, required: true },
  district: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Store', storeSchema);
