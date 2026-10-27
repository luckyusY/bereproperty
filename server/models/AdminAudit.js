import mongoose from 'mongoose';

const adminAuditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, maxlength: 80, index: true },
  targetType: { type: String, required: true, enum: ['user', 'store', 'product', 'order'] },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  summary: { type: String, required: true, maxlength: 300 },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

adminAuditSchema.index({ createdAt: -1 });
export default mongoose.model('AdminAudit', adminAuditSchema);
