// pages/api/checkout.js

import mongoose from 'mongoose';
import Order from '../../models/Order';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Define MONGODB_URI in .env.local');

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  const { items, name, email, phone, address, shipping, tax, deliveryOption } = req.body;

  // Calculate subtotal
  let subtotal = 0;
  items.forEach(item => {
    const unitPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
    subtotal += unitPrice * item.qty;
  });
  subtotal = parseFloat(subtotal.toFixed(2));

  // Line items for Stripe
  const line_items = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * 100),
    },
    quantity: item.qty,
  }));

  const taxAmount = parseFloat(tax) || 0;
  if (taxAmount > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Sales Tax' },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });
  }

  const shippingRate = shipping?.rate ? parseFloat(shipping.rate) : 0;
  if (shippingRate > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `Shipping (${shipping.carrier})` },
        unit_amount: Math.round(shippingRate * 100),
      },
      quantity: 1,
    });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_creation: 'always',
      customer_email: email,
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true },
      payment_intent_data: {
        metadata: {
          name: name || '',
          phone: phone || '',
          address_line1: address?.line1 || '',
          address_city: address?.city || '',
          address_state: address?.state || '',
          address_postal_code: address?.postal_code || '',
          address_country: address?.country || '',
          items: JSON.stringify(items),
          subtotal_amount: subtotal.toString(),
          tax_amount: taxAmount.toString(),
          shipping_rate: shippingRate.toString(),
          shipping_carrier: shipping?.carrier || deliveryOption || '',
          shipping_delivery_days: shipping?.delivery_days?.toString() || '',
          shipping_estimated_delivery: shipping?.estimated_delivery || '',
          delivery_option: deliveryOption || '',
        },
      },
      cancel_url: `${req.headers.origin}/cart`,
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      expand: ['payment_intent'],
    });
  } catch (err) {
    console.error('❌ Stripe session creation failed:', err);
    return res.status(500).json({ error: 'Stripe session creation failed' });
  }

  // Save order in DB
  const orderNumber = `KT-${Date.now()}`;
  try {
    await dbConnect();
    await Order.create({
      orderNumber,
      name,
      email,
      phone,
      address: {
        line1: address.line1,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      },
      items: items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      subtotal,
      tax: taxAmount,
      shipping: {
        carrier: shipping?.carrier || deliveryOption || 'Local Pickup',
        rate: shippingRate,
        delivery_days: shipping?.delivery_days || null,
        estimated_delivery: shipping?.estimated_delivery || null,
      },
      total: parseFloat((subtotal + taxAmount + shippingRate).toFixed(2)),
      deliveryOption,
      payment_intent: session.payment_intent.id, // ✅ Replaces sessionId
    });
  } catch (err) {
    console.error('❌ Order saving failed:', err);
  }

  return res.status(200).json({ url: session.url, orderNumber });
}
