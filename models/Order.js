// models/Order.js

import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, required: true },
    },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: String, required: true }, // e.g. "$19.99"
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: {
      carrier: { type: String, required: true },
      rate: { type: Number, required: true },
      delivery_days: { type: Number },
      estimated_delivery: { type: String },
    },
    total: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    payment_intent: { type: String, required: true, unique: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    strict: true,     // disallow fields not in schema
  }
);

// Optional: Log order before save (for debugging)
OrderSchema.pre('save', function (next) {
  console.log('📝 Saving Order:', this.toObject());
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
