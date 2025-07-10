// pages/api/get-receipt-pdf.js

import mongoose from 'mongoose';
import Order from '../../models/Order';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import getStream from 'get-stream';



const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Define MONGODB_URI in .env.local');

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
  const { query: { orderNumber, session_id, payment_intent } } = req;
  await dbConnect();

  let order = null;
  if (orderNumber) {
    order = await Order.findOne({ orderNumber });
  } else if (payment_intent) {
    order = await Order.findOne({ sessionId: payment_intent });
  } else if (session_id) {
    order = await Order.findOne({ sessionId: session_id });
  }

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="receipt-${order.orderNumber || 'order'}.pdf"`
  );

  doc.pipe(res);

  // --- Header with logo and Order Info ---
  const logoPath = path.resolve('./public/img/Knighton_Tech_Black_Only.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  // Order Number and Date (Top-Right)
  doc.moveDown();
  doc
    .fontSize(12)
    .text(`Order #: ${order.orderNumber}`, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { align: 'right' });

  // Divider
  doc.moveTo(50, 130).lineTo(550, 130).stroke();
  doc.moveDown();

  // --- Customer Info ---
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

  // --- Items ---
  doc.fontSize(14).text('Items', { underline: true });
  order.items.forEach(item => {
    const parsedPrice =
      typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
    const itemTotal = parsedPrice * item.qty;

    doc
      .fontSize(12)
      .text(`${item.name} (x${item.qty}) - $${parsedPrice.toFixed(2)} each`, { continued: true })
      .text(`   Total: $${itemTotal.toFixed(2)}`, { align: 'right' });
  });

  doc.moveDown();

  // --- Totals ---
  doc.fontSize(14).text('Summary', { underline: true });
  doc.fontSize(12);
  doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`);
  doc.text(`Tax: $${order.tax.toFixed(2)}`);
  doc.text(`Shipping (${order.shipping.carrier}): $${order.shipping.rate.toFixed(2)}`);
  doc.moveDown();
  doc.fontSize(13).text(`Total: $${order.total.toFixed(2)}`, { bold: true });

  // --- Footer ---
  doc
    .moveDown(2)
    .fontSize(10)
    .fillColor('gray')
    .text('Thank you for shopping with Knighton Tech!', { align: 'center' });

  doc.end();
}
