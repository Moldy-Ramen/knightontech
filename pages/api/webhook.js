// pages/api/webhook.js

import Stripe from 'stripe';
import { buffer } from 'micro';
import mongoose from 'mongoose';
import dbConnect from '../../lib/dbConnect'; // ✅ use cached connection
import Order from '../../models/Order';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';
import { sendReceiptEmail } from '../../lib/sendEmail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

const getBufferFromStream = (streamInstance) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    streamInstance.on('data', (chunk) => chunks.push(chunk));
    streamInstance.on('end', () => resolve(Buffer.concat(chunks)));
    streamInstance.on('error', reject);
  });

async function generateReceiptPDFBuffer(order) {
  const stream = new PassThrough();
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  const logoPath = path.resolve('./public/img/Knighton_Tech_Black_Only.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Order #: ${order.orderNumber}`, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { align: 'right' });

  doc.moveTo(50, 130).lineTo(550, 130).stroke();
  doc.moveDown(5);

  doc.fontSize(14).text('Customer Information', { underline: true });
  doc
    .fontSize(12)
    .text(`Name: ${order.name}`)
    .text(`Email: ${order.email}`)
    .text(`Phone: ${order.phone || 'N/A'}`)
    .text(
      `Address: ${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.postal_code}, ${order.address.country}`
    )
    .moveDown();

  doc.fontSize(14).text('Items', { underline: true });
  order.items.forEach((item) => {
    const parsedPrice =
      typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
    const itemTotal = parsedPrice * item.qty;

    doc
      .fontSize(12)
      .text(
        `${item.name} (x${item.qty}) - $${parsedPrice.toFixed(2)} each`,
        { continued: true }
      )
      .text(`   Total: $${itemTotal.toFixed(2)}`, { align: 'right' });
  });

  doc.moveDown();
  doc.fontSize(14).text('Summary', { underline: true });
  doc.fontSize(12);
  doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`);
  doc.text(`Tax: $${order.tax.toFixed(2)}`);
  if (order.shipping && typeof order.shipping === 'object') {
    doc.text(`Shipping (${order.shipping.carrier}): $${order.shipping.rate.toFixed(2)}`);
  }
  doc.moveDown();
  doc.fontSize(13).text(`Total: $${order.total.toFixed(2)}`, { bold: true });

  doc.moveDown(2)
    .fontSize(10)
    .fillColor('gray')
    .text('Thank you for shopping with Knighton Tech!', { align: 'center' });

  doc.end();
  return await getBufferFromStream(stream);
}

export default async function handler(req, res) {
  console.log('🛎️ webhook handler invoked', { method: req.method });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  console.log('📬 Stripe webhook received');

  let event;
  try {
    console.log('🔑 verifying signature…');
    const sig = req.headers['stripe-signature'];
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ signature OK, got event:', event.type);
  } catch (err) {
    console.error('❌ signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔌 connecting to Mongo…');
  await dbConnect();
  console.log('🗄️  Mongo connected, state=', mongoose.connection.readyState);

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    console.log('💳 PaymentIntent ID:', intent.id);
    const m = intent.metadata || {};
    console.log('📦 Metadata:', m);
    console.log('📥 about to write order for PaymentIntent:', intent.id);

    // parse numeric values from metadata
    const subtotal = parseFloat(m.subtotal_amount || '0') || 0;
    const tax = parseFloat(m.tax_amount || '0') || 0;
    const shippingRate = parseFloat(m.shipping_rate || '0') || 0;
    const shippingCarrier = m.shipping_carrier || '';
    const deliveryDays = m.shipping_delivery_days
      ? parseInt(m.shipping_delivery_days, 10)
      : undefined;
    const estDelivery = m.shipping_estimated_delivery || '';
    const deliveryOption = m.delivery_option || 'Unknown';

    // parse items array
    let items = [];
    try {
      const parsed = JSON.parse(m.items || '[]');
      if (Array.isArray(parsed)) items = parsed;
    } catch (e) {
      console.warn('⚠️ Could not parse metadata.items:', m.items, e);
    }
    if (!items.length) {
      console.warn('⚠️ No items parsed from metadata. Using fallback item.');
      items = [{ name: 'Unknown', qty: 1, price: '$0.00' }];
    }

    // build address object
    const address = {
      line1: m.address_line1 || '',
      city: m.address_city || '',
      state: m.address_state || '',
      postal_code: m.address_postal_code || '',
      country: m.address_country || '',
    };

    // determine email
    const email = m.email || intent.receipt_email || '';
    if (!email) {
      console.error('❌ No email found in metadata or intent. Aborting.');
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // idempotency: skip if exists
      const existing = await Order.findOne({ payment_intent: intent.id });
      if (existing) {
        console.log('▶️ Order already exists for paymentIntent:', intent.id);
        return res.status(200).json({ received: true });
      }

      // construct order payload preserving metadata fields
      const orderNumber = `KT-${Date.now()}`;
      const orderPayload = {
        orderNumber,
        name: m.name || '',
        email,
        phone: m.phone || '',
        address,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        subtotal,
        tax,
        shipping: {
          carrier: shippingCarrier,
          rate: shippingRate,
          delivery_days: deliveryDays,
          estimated_delivery: estDelivery || undefined,
        },
        total: subtotal + tax + shippingRate,
        status: 'Paid',
        payment_intent: intent.id,
        deliveryOption,
      };

      console.log('📦 Order Payload:', orderPayload);

      // save order
      const newOrder = await new Order(orderPayload).save();
      console.log('✅ Order saved to DB via webhook:', newOrder._id);

      // generate and send receipt
      const pdfBuffer = await generateReceiptPDFBuffer(newOrder);
      await sendReceiptEmail({
        to: newOrder.email,
        subject: `Your Receipt for Order ${newOrder.orderNumber}`,
        text: 'Attached is your receipt. Thank you for shopping with us!',
        pdfBuffer,
        filename: `receipt-${newOrder.orderNumber}.pdf`,
      });
    } catch (err) {
      console.error('❌ failed in webhook logic:', err);
      if (err.name === 'ValidationError') {
        Object.keys(err.errors).forEach((field) => {
          console.error(`Field ${field}:`, err.errors[field].message);
        });
      }
      return res.status(500).json({ error: 'Webhook handler error' });
    }
  }

  res.status(200).json({ received: true });
}
