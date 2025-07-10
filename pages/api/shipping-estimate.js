// pages/api/shipping-estimate.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn('⚠️  Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🛰️  Received POST /api/shipping-estimate with:', JSON.stringify(req.body, null, 2));
  const { name, phone, address } = req.body;

  // 1) Validate required address fields
  if (
    !address?.line1 ||
    !address?.postal_code ||
    !address?.city ||
    !address?.state ||
    !address?.country
  ) {
    console.error('❌ Missing required address fields:', JSON.stringify(address, null, 2));
    return res.status(400).json({ error: 'Missing required address fields' });
  }

  // 2) Ensure API key is loaded
  const apiKey = process.env.EASYPOST_API_KEY;
  console.log('🔑 Loaded EASYPOST_API_KEY:', apiKey ? '(exists)' : '(undefined)');
  if (!apiKey) {
    console.error('❌ EASYPOST_API_KEY is undefined or empty');
    return res.status(500).json({ error: 'Server misconfiguration: missing EASYPOST_API_KEY' });
  }

  // 3) Build the EasyPost payload (wrapped inside "shipment")
  const easyPostBody = {
    shipment: {
      to_address: {
        name:    name || '',
        phone:   phone || '',
        street1: address.line1,
        city:    address.city,
        state:   address.state,
        zip:     address.postal_code,
        country: address.country,
      },
      from_address: {
        name:    'Knighton Tech',
        street1: '3182 S Buena Verde Ln',
        city:    'Magna',
        state:   'UT',
        zip:     '84044',
        country: 'US',
        phone:   '8017971570',
      },
      parcel: {
        length: 22.5,
        width:  12,
        height: 22.5,
        weight: 640, // ounces (40 lbs = 640 oz)
      },
      options: {
        currency: 'USD',
      },
    },
  };

  console.log('📤 Sending to EasyPost:', JSON.stringify(easyPostBody, null, 2));

  try {
    // 4) Call EasyPost
    const shipmentResponse = await fetch('https://api.easypost.com/v2/shipments', {
      method:  'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(easyPostBody),
    });

    // 5) Parse JSON from EasyPost
    const shipment = await shipmentResponse.json();
    console.log(
      `📥 EasyPost responded (status ${shipmentResponse.status}):`,
      JSON.stringify(shipment, null, 2)
    );

    // 6) If EasyPost returned an error, forward as 400
    if (shipment.error) {
      let message = '';
      if (typeof shipment.error === 'object') {
        message = shipment.error.message || JSON.stringify(shipment.error);
      } else {
        message = shipment.error;
      }
      console.error('❌ EasyPost validation error:', message);
      return res.status(400).json({ error: message });
    }

    // 7) Ensure there are rates
    if (!shipment.rates || shipment.rates.length === 0) {
      console.error('❌ No rates array returned from EasyPost');
      return res.status(404).json({ error: 'No shipping rates found' });
    }

    // 8) Map each rate to only the fields we need
    const options = shipment.rates.map((rate) => ({
      id:                 rate.id,               // unique ID for front-end selection
      service:            rate.service,          // e.g. "SMART_POST"
      carrier:            rate.carrier,          // e.g. "FedExDefault" or "USPS"
      rate:               rate.rate,             // string, e.g. "29.68"
      delivery_days:      rate.delivery_days,    // number or null
      estimated_delivery: rate.est_delivery_date // string or null
    }));

    console.log('✅ Returning rates:', JSON.stringify(options, null, 2));
    return res.status(200).json({ rates: options });
  } catch (err) {
    console.error('❌ Shipping estimate internal error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
