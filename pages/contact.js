// pages/contact.js

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';


export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Sending…');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('Message sent! Thank you.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact error:', err);
      setStatus('Failed to send. Please try again later.');
    }
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
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
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

      {/* Contact Section */}
      <main className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />
        <div className="relative z-10 max-w-lg mx-auto px-4 py-16 space-y-8">
          <h1 className="text-4xl font-bold text-center">Contact Us</h1>

          {/* Phone & Social */}
          <div className="text-center space-y-2">
            <p className="text-lg">Call or text anytime:</p>
            <a href="tel:+18017971570" className="text-2xl font-semibold hover:text-blue-400">
              +1 (801) 797-1570
            </a>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="https://x.com/knightontech" target="_blank" className="hover:text-blue-400 flex items-center space-x-1"><FaTwitter /> <span>Twitter</span></a>
              <a href="https://www.facebook.com/profile.php?id=61576236553377" target="_blank" className="hover:text-blue-400 flex items-center space-x-1"><FaFacebook /><span>Facebook</span></a>
              <a href="https://www.instagram.com/knighton_tech/" target="_blank" className="hover:text-blue-400 flex items-center space-x-1"><FaInstagram /> <span>Instagram</span></a>
              <a href="https://www.tiktok.com/@knightontech" target="_blank" className="hover:text-blue-400 flex items-center space-x-1"><FaTiktok /> <span>TikTok</span></a>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-xl"
          >
            <div>
              <label className="block mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-white font-semibold transition-colors"
            >
              Send Message
            </button>
            {status && <p className="text-center text-sm mt-2">{status}</p>}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
