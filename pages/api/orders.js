// pages/api/orders.js

import mongoose from 'mongoose';
import Order from '../../models/Order';
import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  // 🔐 Admin-only access check
  const cookies = parse(req.headers.cookie || '');
  if (cookies.admin !== '1') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Ensure we’re connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Fetch all orders, newest first
    const orders = await Order.find().sort({ createdAt: -1 });

    // Map to plain objects and include sessionId
    const sanitized = orders.map((orderDoc) => ({
      _id: orderDoc._id.toString(),
      name: orderDoc.name,
      email: orderDoc.email,
      phone: orderDoc.phone,
      address: orderDoc.address,
      items: orderDoc.items,
      total: orderDoc.total,
      tax: orderDoc.tax,
      shipping: orderDoc.shipping,
      status: orderDoc.status,
      createdAt: orderDoc.createdAt,
      sessionId: orderDoc.sessionId, // ← explicitly include it
      orderNumber: orderDoc.orderNumber || null, // if you have one
    }));

    return res.status(200).json({ orders: sanitized });
  } catch (err) {
    console.error('❌ Failed to fetch orders:', err.message);
    return res.status(500).json({ error: 'Server Error' });
  }
}
