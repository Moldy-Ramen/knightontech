import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Services() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();

  const services = [
    { service: "Basic Diagnostics", features: "PC Diagnosis and Evaluation", price: "Always Free!!" },
    { service: "Virus & Malware Removal", features: "Full Removal of Malware & Viruses", price: "$80–$150" },
    { service: "OS Installation & Repair", features: "New Install & Windows Repair", price: "$50–$120" },
    { service: "Hardware Repairs", features: "Component Installations & Upgrades", price: "$30–$100" },
    { service: "Basic Data Recovery", features: "Accidental Deletion Recovery", price: "$100–$300" },
    { service: "Data Destruction", features: "Permanent Data Removal", price: "$100–$300" },
    { service: "Screen Replacement", features: "New Laptop Screen Install", price: "$100–$250" },
    {
      service: "Bring Your Own Parts Build",
      features: (
        <>
          Full PC Assembly (You supply the parts)
          <br />
          <a
            href="/store"
            className="inline-block mt-2 text-blue-600 font-semibold underline hover:text-blue-500"
          >
            Or view our store
          </a>
        </>
      ),
      price: "$100–$200 (labor only)"
    },
    { service: "Networking Setup", features: "New Router & Equipment Setup", price: "$80–$200" },
    { service: "Software Installation", features: "Software Copy or Installation", price: "$20–$50" },
    { service: "Urgent Remote Support", features: "Remote PC Assistance", price: "$50–$100" },
    { service: "Preventative Maintenance", features: "PC Hardware Cleaning/Re-Pasting", price: "$50–$150" },
{
  service: "Web Development",
  features: "Full web page design and development for portfolios or e-commerce.",
  price: (
    <>
      <a
        href="/contact"
        className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Call or Text for Pricing
      </a>
    </>
  )
}
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
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

      <main className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center mb-10">Our Services</h1>
          <div className="overflow-auto rounded-xl shadow-lg">
            <table className="min-w-full table-auto bg-white text-black text-sm sm:text-base">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Features</th>
                  <th className="px-4 py-3 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="px-4 py-3">{item.service}</td>
                    <td className="px-4 py-3">{item.features}</td>
                    <td className="px-4 py-3">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400 z-10 relative">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
