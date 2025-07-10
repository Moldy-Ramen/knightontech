// pages/api/generate-receipt-pdf.js

import { dbConnect } from '../../lib/dbConnect';
import Receipt from '../../models/Receipt';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id in request body' });
  }

  try {
    // 1) Connect to MongoDB
    await dbConnect();

    // 2) If we already generated a PDF for this session, skip regeneration
    const existing = await Receipt.findOne({ sessionId: session_id });
    if (existing) {
      return res.status(200).json({
        message: 'PDF already exists',
        receiptId: existing._id.toString(),
      });
    }

    // 3) Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product', 'customer_details'],
    });

    // 4) Fetch line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id, {
      limit: 100,
    });

    // 5) Build a PDF in memory using PDFKit
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      // 6) Save to MongoDB
      const receiptDoc = new Receipt({
        sessionId: session_id,
        pdf: pdfBuffer,
      });
      await receiptDoc.save();

      return res.status(200).json({
        message: 'PDF generated and stored',
        receiptId: receiptDoc._id.toString(),
      });
    });

    // PDF content:
    doc.fontSize(20).text('Order Receipt', { align: 'center' });
    doc.moveDown();

    const customerName = session.metadata?.name || session.customer_details?.name || '';
    const customerEmail = session.customer_details?.email || '';
    const customerPhone = session.customer_details?.phone || session.metadata?.phone || '';

    doc.fontSize(12).text(`Name: ${customerName}`);
    doc.text(`Email: ${customerEmail}`);
    if (customerPhone) doc.text(`Phone: ${customerPhone}`);

    let shippingAddressText = '';
    if (session.shipping?.address) {
      const addr = session.shipping.address;
      shippingAddressText = `${addr.line1}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}`;
    } else if (session.metadata.address_line1) {
      shippingAddressText = `${session.metadata.address_line1}, ${session.metadata.address_city}, ${session.metadata.address_state} ${session.metadata.address_postal_code}, ${session.metadata.address_country}`;
    }
    if (shippingAddressText) {
      doc.moveDown();
      doc.text(`Shipping Address:`);
      doc.text(shippingAddressText);
    }

    doc.moveDown();
    const orderDate = new Date(session.created * 1000).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    doc.fontSize(10).fillColor('gray').text(`Order Date: ${orderDate}`);
    doc.fillColor('black');

    doc.moveDown();
    doc.fontSize(14).text('Items:', { underline: true });
    doc.moveDown(0.5);
    lineItems.data.forEach((item) => {
      const description = item.description;
      const qty = item.quantity;
      const amount = (item.amount_total / 100).toFixed(2);
      doc.fontSize(12).text(`${description} x ${qty}  —  $${amount}`);
    });

    doc.moveDown();
    const taxCents = session.total_details?.amount_tax || 0;
    const shipCents = session.total_details?.amount_shipping || 0;
    const totalCents = session.amount_total || 0;

    const taxDollars = (taxCents / 100).toFixed(2);
    const shipDollars = (shipCents / 100).toFixed(2);
    const totalDollars = (totalCents / 100).toFixed(2);

    doc.fontSize(12).text(`Tax: $${taxDollars}`);
    doc.text(`Shipping: $${shipDollars}`);
    doc.moveDown();
    doc.fontSize(14).text(`Total: $${totalDollars}`, { bold: true });

    doc.end();
  } catch (err) {
    console.error('❌ Error generating PDF receipt:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
