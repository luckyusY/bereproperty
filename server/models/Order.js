import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  delivery: {
    province: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, default: '' },
    notes: { type: String, default: '', maxlength: 1000 },
    phone: { type: String, default: '', maxlength: 32 },
  },
  subtotal: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['pending_manual'], default: 'pending_manual' },
  status: { type: String, enum: ['requested', 'accepted', 'rejected'], default: 'requested', index: true },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
