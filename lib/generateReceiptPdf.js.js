// lib/generateReceiptPdf.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export function generateReceiptPDF(order) {
  const doc = new PDFDocument({ margin: 50 });

  const logoPath = path.resolve('./public/img/Knighton_Tech_Black_Only.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  doc
    .fontSize(12)
    .text(`Order #: ${order.orderNumber}`, 400, 50, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { align: 'right' });

  doc.moveTo(50, 130).lineTo(550, 130).stroke();
  doc.moveDown();

  doc.moveDown(5);
  doc.fontSize(14).text('Customer Information', { underline: true });
  doc.fontSize(12)
    .text(`Name: ${order.name}`)
    .text(`Email: ${order.email}`)
    .text(`Phone: ${order.phone || 'N/A'}`)
    .text(`Address: ${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.postal_code}, ${order.address.country}`)
    .moveDown();

  doc.fontSize(14).text('Items', { underline: true });
  order.items.forEach(item => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
    const total = price * item.qty;

    doc.fontSize(12)
      .text(`${item.name} (x${item.qty}) - $${price.toFixed(2)} each`, { continued: true })
      .text(`   Total: $${total.toFixed(2)}`, { align: 'right' });
  });

  doc.moveDown();
  doc.fontSize(14).text('Summary', { underline: true });
  doc.fontSize(12)
    .text(`Subtotal: $${order.subtotal.toFixed(2)}`)
    .text(`Tax: $${order.tax.toFixed(2)}`)
    .text(`Shipping (${order.shipping.carrier}): $${order.shipping.rate.toFixed(2)}`)
    .moveDown()
    .fontSize(13).text(`Total: $${order.total.toFixed(2)}`, { bold: true });

  doc.moveDown(2)
    .fontSize(10)
    .fillColor('gray')
    .text('Thank you for shopping with Knighton Tech!', { align: 'center' });

  return doc;
}
