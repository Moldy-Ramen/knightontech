// pages/success.js

import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Success() {
  const { clearCart } = useCart();
  const router = useRouter();
  const { payment_intent } = router.query;


  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfStored, setPdfStored] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Clear cart once on mount
  useEffect(() => {
    clearCart();
  }, []);

  // Fetch Stripe session data and orderNumber
  useEffect(() => {
    if (!payment_intent) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1) Fetch receipt details from checkout-session
        const res = await fetch(`/api/payment-receipt?payment_intent=${payment_intent}`);

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Failed to load receipt');
        }
        const data = await res.json();
        setReceipt(data);

        // 2) Fetch order by payment_intent to get orderNumber
        const ordRes = await fetch(`/api/orders/${payment_intent}`);
        if (ordRes.ok) {
          const { order } = await ordRes.json();
          if (order?.orderNumber) {
            setOrderNumber(order.orderNumber);
            // 3) Generate PDF by orderNumber
            await fetch(`/api/get-receipt-pdf?orderNumber=${order.orderNumber}`);
            setPdfStored(true);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [payment_intent]);

  const downloadReceipt = () => {
    if (!orderNumber) return;
window.open(
  `/api/get-receipt-pdf?orderNumber=${orderNumber}&ts=${Date.now()}`,
  '_blank'
);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      {/* Navbar */}
      <nav className="bg-[#1f2937] shadow z-20 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="/img/Knighton_Tech_Full _White.png"
              alt="Knighton Tech"
              className="h-10 w-auto"
            />
          </a>
          <ul className="hidden md:flex space-x-6 text-sm font-medium items-center">
            <li><a href="/" className="hover:text-blue-400">Home</a></li>
            <li><a href="/services" className="hover:text-blue-400">Services</a></li>
            <li><a href="/store" className="hover:text-blue-400">Store</a></li>
            <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
            <li><a href="/cart" className="flex items-center hover:text-blue-400">
              🛒<span className="ml-1">Cart</span>
            </a></li>
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 space-y-6">
          {!payment_intent ? (
            <h1 className="text-4xl font-bold text-red-400 text-center">
              No payment reference found.
            </h1>
          ) : loading ? (
            <h1 className="text-4xl font-bold text-green-400 text-center">
              Loading your receipt…
            </h1>
          ) : error ? (
            <>
              <h1 className="text-4xl font-bold text-red-400 text-center">
                Something went wrong
              </h1>
              <p className="text-center text-gray-300">{error}</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-green-400 text-center">
                Thank you for your order!
              </h1>
              {orderNumber && (
                <p className="text-center text-gray-300">
                  <span className="font-semibold">Order #:</span> {orderNumber}
                </p>
              )}
              {orderNumber && (
                <div className="text-center mt-4">
                  <button
                    onClick={downloadReceipt}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-white font-semibold"
                  >
                    Download Receipt
                  </button>
                </div>
              )}
            </>
          )}

          {loading && (
            <p className="text-center text-gray-300">
              Please wait while we fetch your receipt.
            </p>
          )}

          {!loading && receipt && (
            <div className="bg-gray-900 p-6 rounded-lg space-y-6">
              {/* Customer Info */}
              <section className="space-y-2">
                <h2 className="text-2xl font-semibold">Order Receipt</h2>
                <p>
                  <span className="font-semibold">Name:</span>{' '}
                  {receipt.customer_name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  {receipt.customer_email}
                </p>
                {receipt.customer_phone && (
                  <p>
                    <span className="font-semibold">Phone:</span>{' '}
                    {receipt.customer_phone}
                  </p>
                )}
                <div>
                  <span className="font-semibold">Shipping Address:</span>
                  <p>
                    {receipt.shipping_address.line1}, {receipt.shipping_address.city},{' '}
                    {receipt.shipping_address.state}{' '}
                    {receipt.shipping_address.postal_code},{' '}
                    {receipt.shipping_address.country}
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  Order Date:{' '}
                  {new Date(receipt.created * 1000).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </section>

              {/* Line Items */}
              <section>
                <h3 className="text-xl font-semibold mb-2">Items</h3>
                <div className="divide-y divide-gray-700">
                  {receipt.line_items.map((li, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start py-2"
                    >
                      <div>
                        <p className="font-medium">{li.description}</p>
                        <p className="text-gray-400 text-sm">
                          Qty: {li.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${li.amount != null ? li.amount.toFixed(2) : '0.00'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tax / Shipping / Total */}
              <section className="space-y-2 pt-4 border-t border-gray-700">
                <div className="flex justify-between">
                  <p className="text-gray-400">Tax</p>
                  <p className="font-semibold">
                    ${receipt.tax != null ? receipt.tax.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-400">Shipping</p>
                  <p className="font-semibold">
                    ${receipt.shipping != null ? receipt.shipping.toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <p>Total</p>
                  <p>${receipt.total != null ? receipt.total.toFixed(2) : '0.00'}</p>
                </div>
              </section>

              {/* PDF Stored Confirmation */}
              {pdfStored && (
                <p className="text-green-400 text-sm text-center">
                  Your receipt will be E-Mailed to you shortly.
                </p>
              )}

              {/* Back to Store */}
              <div className="text-center pt-4">
                <a
                  href="/store"
                  className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-white font-semibold"
                >
                  Back to Store
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400 z-10 relative">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
