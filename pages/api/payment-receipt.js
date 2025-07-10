// pages/api/payment-receipt.js

import mongoose from 'mongoose';
import Order from '../../models/Order';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI not defined in .env.local');

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

async function fetchOrderWithRetries(paymentIntent, maxRetries = 5, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔍 Attempt ${i + 1}: Searching for payment_intent = ${paymentIntent}`);
    const order = await Order.findOne({ payment_intent: paymentIntent });

    if (order) return order;

    await new Promise(res => setTimeout(res, delayMs)); // Wait before retry
  }

  console.warn(`⚠️ Order not found after ${maxRetries} retries for payment_intent: ${paymentIntent}`);
  return null;
}

export default async function handler(req, res) {
  const { method, query: { payment_intent } } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!payment_intent) {
    return res.status(400).json({ error: 'Missing payment_intent parameter' });
  }

  await dbConnect();

  const order = await fetchOrderWithRetries(payment_intent);

  if (!order) {
    return res.status(404).json({ error: 'Order not found after retries' });
  }

  const receipt = {
    customer_name: order.name,
    customer_email: order.email,
    customer_phone: order.phone,
    shipping_address: order.address,
    created: new Date(order.createdAt).getTime() / 1000,
    line_items: order.items.map((i) => {
      const parsedPrice = typeof i.price === 'string'
        ? parseFloat(i.price.replace('$', ''))
        : i.price;
      return {
        description: i.name,
        quantity: i.qty,
        amount: parsedPrice || 0,
      };
    }),
    tax: order.tax,
    shipping: order.shipping?.rate || 0,
    total: order.total,
  };

  console.log('✅ Order fetched successfully:', order.orderNumber);

  return res.status(200).json(receipt);
}
