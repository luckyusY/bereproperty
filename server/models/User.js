import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
  isActive: { type: Boolean, default: true, index: true },
  phone: { type: String, default: '', trim: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
