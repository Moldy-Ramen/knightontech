// pages/api/create-payment-intent.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const {
      items = [],
      name = '',
      email = '',
      phone = '',
      address = {},
      shipping = {},
      tax = 0,
      total = 0,
      deliveryOption = '',
    } = req.body;

    const shippingRate = parseFloat(shipping.rate || 0);
    const taxAmount = parseFloat(tax || 0);
    const totalAmount = parseFloat(total || 0);
    const subtotal = parseFloat((totalAmount - taxAmount - shippingRate).toFixed(2));

    let itemsMetadata = '';
    try {
      const fullItems = JSON.stringify(items);
      itemsMetadata =
        fullItems.length < 450
          ? fullItems
          : items.map(i => `${i.name} x${i.qty}`).join(', ').slice(0, 490);
    } catch (err) {
      console.warn('⚠️ Failed to serialize items metadata:', err);
    }

    const metadata = {
      name,
      email,
      phone,
      items: itemsMetadata,
      subtotal_amount: subtotal.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      shipping_rate: shippingRate.toFixed(2),
      shipping_carrier: shipping.carrier || deliveryOption,
      shipping_delivery_days: shipping.delivery_days?.toString() || '',
      shipping_estimated_delivery: shipping.estimated_delivery || '',
      delivery_option: deliveryOption,
      address_line1: address.line1 || '',
      address_city: address.city || '',
      address_state: address.state || '',
      address_postal_code: address.postal_code || '',
      address_country: address.country || '',
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // cents
      currency: 'usd',
      receipt_email: email,
      metadata,
    });

    res.status(200).json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error('❌ PaymentIntent creation failed:', err);
    res.status(500).json({ error: 'PaymentIntent creation failed' });
  }
}
