// models/Receipt.js

import mongoose from 'mongoose';

const ReceiptSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  pdf: Buffer, // store the raw PDF bytes
});

// If this model already exists in mongoose.models, reuse it
export default mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);
