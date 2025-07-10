import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black text-white font-sans">
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

      <main className="relative min-h-[100vh] overflow-hidden pt-16 sm:pt-24 px-4">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
             style={{ backgroundImage: "url('/img/hero-background.jpg')" }} />
        <div className="relative z-10 text-center max-w-xl mx-auto space-y-4 sm:space-y-6">
          <img src="/img/Knighton_Tech_White_Only.png" alt="Knighton Tech Logo"
               className="mx-auto w-24 sm:w-32 md:w-40" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Your One-Stop Tech Solution</h1>
          <p className="text-gray-300 text-base sm:text-lg">Fast. Reliable. Professional.</p>
          <a href="/services"
             className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded">
            View Our Services and Pricing
          </a>
        </div>
      </main>

      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400 z-10 relative">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
