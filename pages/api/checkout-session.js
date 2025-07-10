// pages/api/checkout-session.js

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).end('Method not allowed');
  }
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product'],
    });

    // Retrieve line items separately if not expanded:
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id, {
      limit: 100,
    });

    // Format the fields we care about:
    const receipt = {
      customer_name: session.metadata?.name || session.customer_details?.name || '',
      customer_email: session.customer_details?.email || '',
      customer_phone: session.metadata?.phone || session.customer_details?.phone || '',
      shipping_address: {
        line1: session.metadata?.address_line1 || '',
        city: session.metadata?.address_city || '',
        state: session.metadata?.address_state || '',
        postal_code: session.metadata?.address_postal_code || '',
        country: session.metadata?.address_country || '',
      },
      line_items: lineItems.data.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        amount: (li.amount_subtotal ?? li.amount_total) / 100,
      })),
      // Extract tax, shipping, and total from the session object:
      tax: (session.amount_subtotal - session.amount_total + session.amount_tax - session.total_details?.amount_shipping) !== 0
        ? session.amount_tax / 100
        : session.amount_tax / 100,
      shipping: session.total_details?.amount_shipping / 100,
      total: session.amount_total / 100,
      payment_status: session.payment_status,
      created: session.created,
    };

    res.status(200).json(receipt);
  } catch (err) {
    console.error('❌ Error fetching checkout session:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
