// pages/product/[id].js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { cart, addToCart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [product, setProduct] = useState(null);

  // Fetch the product
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const { product } = await res.json();
        setProduct(product);
      } catch (err) {
        console.error('Failed to load product:', err);
      }
    })();
  }, [id]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading…
      </div>
    );
  }

  const {
    _id,
    name,
    price,
    cpu,
    motherboard,
    featuresMotherboard = [],
    ram,
    gpu,
    storage,
    cooler,
    case: caseName,
    featuresCase = [],
    powerSupply,
    image
  } = product;

  const handleAdd = () => {
    const priceStr = `$${price.toFixed(2)}`;
    addToCart({ id: _id, name, price: priceStr, qty: 1 });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* NAV */}
      <nav className="bg-[#1f2937] shadow z-20 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img
              src="/img/Knighton_Tech_Full _White.png"
              alt="Knighton Tech"
              className="h-10 w-auto"
            />
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

          {/* Mobile Hamburger */}
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4">
            <ul className="flex flex-col space-y-2 text-sm font-medium">
              <li><a href="/" className="hover:text-blue-400">Home</a></li>
              <li><a href="/services" className="hover:text-blue-400">Services</a></li>
              <li><a href="/store" className="hover:text-blue-400">Store</a></li>
              <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
              <li><a href="/cart" className="hover:text-blue-400">
                Cart ({cart.length})
              </a></li>
            </ul>
          </div>
        )}
      </nav>

      {/* PRODUCT DETAIL WITH HERO BACKGROUND */}
      <main className="relative flex-grow overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
          <a href="../store">← Return To Store</a>
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row">
            <img
              src={image}
              alt={name}
              className="w-full md:w-1/2 h-64 md:h-auto object-cover"
            />
            <div className="p-6 flex flex-col flex-1 space-y-4">
              <h1 className="text-3xl font-bold">{name}</h1>
              <ul className="space-y-1">
                <li><strong>CPU:</strong> {cpu}</li>
                <li><strong>Motherboard:</strong> {motherboard}</li>
                {featuresMotherboard.length > 0 && (
                  <li><strong>MB Features:</strong> {featuresMotherboard.join(', ')}</li>
                )}
                <li><strong>RAM:</strong> {ram}</li>
                <li><strong>Graphics:</strong> {gpu}</li>
                <li><strong>Storage:</strong> {storage}</li>
                <li><strong>Cooler:</strong> {cooler}</li>
                <li><strong>Case:</strong> {caseName}</li>
                {featuresCase.length > 0 && (
                  <li><strong>Case Features:</strong> {featuresCase.join(', ')}</li>
                )}
                <li><strong>Power Supply:</strong> {powerSupply}</li>
              </ul>
              <div className="mt-auto flex justify-between items-center pt-4">
                <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-lg font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
