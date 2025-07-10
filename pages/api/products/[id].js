// pages/api/products/[id].js

import mongoose from 'mongoose';
import Product from '../../../models/Product';

// --- MongoDB connection caching ---
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
  const { id } = req.query;

  if (method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json({ product });
    } catch (err) {
      console.error('Product fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  if (method === 'PUT') {
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
      const updated = await Product.findByIdAndUpdate(
        id,
        {
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
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json({ product: updated });
    } catch (err) {
      console.error('Product update error:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  if (method === 'DELETE') {
    try {
      await Product.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (err) {
      console.error('Product delete error:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
