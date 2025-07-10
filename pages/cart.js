// pages/cart.js

import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [shippingEstimate, setShippingEstimate] = useState(null);
  const [shippingError, setShippingError] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [useLocalPickup, setUseLocalPickup] = useState(false);

  const TAX_RATE = 0.0725;

  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', '')) || 0;
    return sum + price * item.qty;
  }, 0).toFixed(2);

  const taxAmount = (parseFloat(subtotal) * TAX_RATE).toFixed(2);

  const shippingCost = shippingEstimate?.rate ? parseFloat(shippingEstimate.rate) : 0;

  const total = (parseFloat(subtotal) + parseFloat(taxAmount) + shippingCost).toFixed(2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.address) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const fetchShippingEstimate = async () => {
    setEstimating(true);
    setShippingError(null);
    setShippingOptions([]);
    setShippingEstimate(null);
    setSelectedRateId(null);

    const { name, phone, address } = formData;
    if (!name || !phone || !address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
      setShippingError('Please fill out all shipping fields.');
      setEstimating(false);
      return;
    }

    try {
      const res = await fetch('/api/shipping-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShippingError(data.error || 'Failed to get shipping estimate.');
      } else {
        const filtered = (data.rates || []).filter(r => r.carrier === 'USPS' || r.carrier.includes('FedEx'));
        setShippingOptions(filtered);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setShippingError('Network error while fetching shipping.');
    } finally {
      setEstimating(false);
    }
  };

  const handleRateSelect = (rateId) => {
    setSelectedRateId(rateId);
    const chosen = shippingOptions.find(opt => opt.id === rateId);
    setShippingEstimate(chosen);
  };

  const handleDirectPayment = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    const deliveryOption = useLocalPickup
      ? 'Local Pickup'
      : shippingEstimate
        ? `${formatCarrier(shippingEstimate.carrier)} – ${shippingEstimate.service}`
        : 'Unknown';

    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        shipping: useLocalPickup ? { method: 'Local Pickup' } : shippingEstimate,
        tax: taxAmount,
        total: total,
        deliveryOption,
      }),
    });

    const data = await res.json();
    if (!data.client_secret) {
      alert('Failed to initiate payment.');
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
      },
    });

    if (error) {
      alert(`Payment failed: ${error.message}`);
    } else if (paymentIntent.status === 'succeeded') {
      clearCart();
      window.location.href = `/success?payment_intent=${paymentIntent.id}`;
    }
  };

  const formatCarrier = (raw) => raw.replace(/Default$/, '');

  const formatDelivery = (opt) => {
    if (opt.delivery_days != null) {
      return `${opt.delivery_days} day${opt.delivery_days > 1 ? 's' : ''}`;
    }
    if (opt.estimated_delivery) {
      const d = new Date(opt.estimated_delivery);
      return d.toLocaleDateString();
    }
    return 'N/A';
  };

return (
  <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
    <nav className="bg-[#1f2937] shadow z-20 relative">
      <nav className="bg-[#1f2937] shadow z-20 relative">
  <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
    <a href="/" className="flex items-center">
      <img src="/img/Knighton_Tech_Full _White.png" alt="Knighton Tech" className="h-10 w-auto" />
    </a>

    {/* Desktop Nav */}
    <ul className="hidden md:flex space-x-6 text-sm font-medium items-center">
      <li><a href="/" className="hover:text-blue-400">Home</a></li>
      <li><a href="/services" className="hover:text-blue-400">Services</a></li>
      <li><a href="/store" className="hover:text-blue-400">Store</a></li>
      <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
      <li className="relative">
        <a href="/cart" className="flex items-center hover:text-blue-400">
          🛒<span className="ml-1">Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          )}
        </a>
      </li>
    </ul>

    {/* Hamburger for mobile */}
    <button
      className="md:hidden focus:outline-none"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="md:hidden px-4 pb-4">
      <ul className="flex flex-col space-y-2 text-sm font-medium">
        <li><a href="/" className="hover:text-blue-400">Home</a></li>
        <li><a href="/services" className="hover:text-blue-400">Services</a></li>
        <li><a href="/store" className="hover:text-blue-400">Store</a></li>
        <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
        <li><a href="/cart" className="hover:text-blue-400">Cart ({cart.length})</a></li>
      </ul>
    </div>
  )}
</nav>
    </nav>

    <main className="relative flex-1 overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
        style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 space-y-8">
        <h1 className="text-3xl font-bold text-center">Shopping Cart</h1>

        {cart.length === 0 ? (
          <p className="text-center text-gray-400">Your cart is empty.</p>
        ) : (
          <>
            {/* ─── Cart Items ─── */}
<div className="space-y-4">
  {cart.map((item) => (
    <div
      key={item.id}
      className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
    >
      <div>
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p className="text-gray-400 text-sm">{item.specs}</p>
        <p className="text-sm mt-1">Quantity: {item.qty}</p>
      </div>
      <div className="text-right">
        <p className="text-green-400 font-bold">{item.price}</p>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-400 hover:text-red-300 text-sm mt-2"
        >
          Remove
        </button>
      </div>
    </div>
  ))}
</div>

            {/* ─── Shipping Information Card ─── */}
<div className="bg-gray-900 p-6 rounded-lg">
  <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">
    Shipping Information
  </h2>

  {/* Local Pickup Checkbox */}
  <div className="flex items-center space-x-2 mb-4">
    <input
      id="localPickup"
      type="checkbox"
      checked={useLocalPickup}
      onChange={() => setUseLocalPickup(!useLocalPickup)}
      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 focus:ring-blue-500"
    />
    <label htmlFor="localPickup" className="text-white text-sm">
      I want to pick this up locally (no shipping)
    </label>
  </div>

  {/* Form Inputs */}
  <div className="space-y-4">
    <input
      type="text"
      name="name"
      placeholder="Full Name"
      value={formData.name}
      onChange={handleChange}
      className="w-full h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleChange}
      className="w-full h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="tel"
      name="phone"
      placeholder="Phone Number"
      value={formData.phone}
      onChange={handleChange}
      className="w-full h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="text"
      name="line1"
      placeholder="Street Address"
      value={formData.address.line1}
      onChange={handleChange}
      className="w-full h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="text"
      name="city"
      placeholder="City"
      value={formData.address.city}
      onChange={handleChange}
      className="w-full h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
    />
    <div className="flex gap-4">
      <input
        type="text"
        name="state"
        placeholder="State (e.g. UT)"
        value={formData.address.state}
        onChange={handleChange}
        className="w-1/2 h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        name="postal_code"
        placeholder="ZIP Code"
        value={formData.address.postal_code}
        onChange={handleChange}
        className="w-1/2 h-10 px-3 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <input type="hidden" name="country" value={formData.address.country} />

    {!useLocalPickup && (
      <div className="flex items-center gap-4">
        <button
          onClick={fetchShippingEstimate}
          disabled={estimating}
          className={`${
            estimating
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500'
          } px-4 py-2 rounded text-white font-medium transition-colors`}
        >
          {estimating ? 'Estimating…' : 'Get Shipping Estimate'}
        </button>
        {shippingError && (
          <p className="text-red-400 text-sm">{shippingError}</p>
        )}
      </div>
    )}
  </div>

  {/* ─── Shipping Rate Options ─── */}
  {!useLocalPickup &&
    Array.isArray(shippingOptions) &&
    shippingOptions.length > 0 && (
      <div className="mt-6 bg-gray-800 p-4 rounded-lg text-sm w-full max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-3 text-white">
          Select Shipping Option
        </h3>
        <div className="space-y-2">
          {shippingOptions.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center justify-between bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer ${
                selectedRateId === opt.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="shippingRate"
                  value={opt.id}
                  checked={selectedRateId === opt.id}
                  onChange={() => handleRateSelect(opt.id)}
                  className="form-radio h-5 w-5 text-indigo-500 mt-1"
                />
                <div className="flex flex-col">
                  <p className="font-semibold text-white">
                    {formatCarrier(opt.carrier)} &ndash; {opt.service}
                  </p>
                  <p className="text-xs text-gray-300">
                    Delivery: {formatDelivery(opt)}
                  </p>
                </div>
              </div>
              <div className="text-white font-semibold">
                ${parseFloat(opt.rate).toFixed(2)}
              </div>
            </label>
          ))}
        </div>
      </div>
    )}

  {/* ─── Selected Shipping Summary ─── */}
  {!useLocalPickup && shippingEstimate && (
    <div className="mt-4 bg-green-700 px-3 py-2 rounded-lg text-sm w-full">
      <p className="font-semibold">
        {formatCarrier(shippingEstimate.carrier)} &ndash;{' '}
        {shippingEstimate.service} &ndash; $
        {parseFloat(shippingEstimate.rate).toFixed(2)}
      </p>
      {shippingEstimate.delivery_days != null && (
        <p className="text-xs">
          ETA: {shippingEstimate.delivery_days} day
          {shippingEstimate.delivery_days !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )}
</div>

            {/* ─── Card Payment Section ─── */}
<div className="bg-gray-900 p-6 rounded-lg mt-6">
  <h2 className="text-xl font-semibold mb-4">Card Information</h2>

  <div className="p-4 bg-gray-800 rounded text-white">
    <CardElement
      options={{
        style: {
          base: {
            fontSize: '16px',
            color: '#ffffff',
            '::placeholder': {
              color: '#888',
            },
          },
          invalid: {
            color: '#e5424d',
          },
        },
      }}
    />
  </div>
</div>

            {/* ─── Subtotal / Tax / Shipping / Total & Checkout ─── */}
<div className="flex justify-between items-start mt-8 border-t border-gray-600 pt-4">
  <div className="space-y-1">
    <p className="text-lg">
      Subtotal: <span className="font-semibold">${subtotal}</span>
    </p>
    <p className="text-lg">
      Tax (7.25%): <span className="font-semibold">${taxAmount}</span>
    </p>
    {!useLocalPickup && shippingEstimate && (
      <p className="text-lg">
        Shipping:{' '}
        <span className="font-semibold">${shippingCost.toFixed(2)}</span>
      </p>
    )}
    <p className="text-xl font-semibold mt-1">
      Total: <span>${total}</span>
    </p>
  </div>

  <div className="flex flex-col gap-4">
    <button
      onClick={clearCart}
      className="text-red-400 hover:text-red-300 text-sm"
    >
      Clear Cart
    </button>
    <button
      onClick={handleDirectPayment}
      disabled={
        !stripe ||
        cart.length === 0 ||
        (!useLocalPickup && !shippingEstimate)
      }
      className={`${
        !stripe ||
        cart.length === 0 ||
        (!useLocalPickup && !shippingEstimate)
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-500'
      } px-4 py-2 rounded text-white font-medium transition-colors`}
    >
      Checkout
    </button>
  </div>
</div>

          </>
        )}
      </div>
    </main>

    <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400 z-10 relative">
      © 2025 Knighton Tech. All rights reserved.
    </footer>
  </div>
);

}
