// pages/api/orders/[id].js

import mongoose from 'mongoose';
import Order from '../../../models/Order';

// --- MongoDB connection caching ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global._mongo;
if (!cached) {
  cached = global._mongo = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  const { method, query: { id } } = req;
  await dbConnect();

  if (method === 'PUT') {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status in request body' });
    }
    try {
      const updated = await Order.findOneAndUpdate(
        { orderNumber: id },
        { status },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json({ order: updated });
    } catch (err) {
      console.error('Order update error:', err);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  if (method === 'GET') {
    try {
      // Try to find by orderNumber, fallback to sessionId
      let order = await Order.findOne({ orderNumber: id });
      if (!order) {
        order = await Order.findOne({ sessionId: id });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json({ order });
    } catch (err) {
      console.error('Order fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  if (method === 'DELETE') {
    try {
      await Order.findOneAndDelete({ orderNumber: id });
      return res.status(204).end();
    } catch (err) {
      console.error('Order delete error:', err);
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
