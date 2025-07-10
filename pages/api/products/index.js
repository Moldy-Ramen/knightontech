// pages/api/products/index.js

import mongoose from 'mongoose';
import Product from '../../../models/Product';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Define MONGODB_URI in .env.local');
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
  await dbConnect();

  const { method } = req;
  if (method === 'GET') {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  }

  if (method === 'POST') {
    const {
      name,
      price,
      cpu,
      motherboard,
      featuresMotherboard,
      ram,
      gpu,
      storage,
      cooler,
      case: caseName,
      featuresCase,
      powerSupply,
      image
    } = req.body;

    try {
      const product = await Product.create({
        name,
        price,
        cpu,
        motherboard,
        featuresMotherboard,
        ram,
        gpu,
        storage,
        cooler,
        case: caseName,
        featuresCase,
        powerSupply,
        image
      });
      return res.status(201).json({ product });
    } catch (err) {
      console.error('Product creation error:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
