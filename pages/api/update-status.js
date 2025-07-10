import mongoose from 'mongoose';
import Order from '../../models/Order';
import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const cookies = parse(req.headers.cookie || '');
  if (cookies.admin !== '1') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: 'Missing orderId or status' });
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    await Order.findByIdAndUpdate(orderId, { status });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
}
