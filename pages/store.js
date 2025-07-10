// pages/store.js

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Store() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cpu: '',
    gpu: '',
    ram: '',
    storage: '',
    cooler: '',
    caseName: '',
    powerSupply: '',
    priceRange: [0, 3000],
    featuresMotherboard: [],
    featuresCase: [],
  });
  const [priceBounds, setPriceBounds] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const allProducts = data.products || [];

        setProducts(allProducts);

        const prices = allProducts.map(p => p.price).filter(p => typeof p === 'number');
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        setPriceBounds([minPrice, maxPrice]);
        setFilters((prev) => ({
          ...prev,
          priceRange: [minPrice, maxPrice],
        }));
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    })();
  }, []);

  const getUniqueOptions = (key) => [...new Set(products.map((p) => p[key]).filter(Boolean))];
  const cpuOptions = getUniqueOptions('cpu');
  const gpuOptions = getUniqueOptions('gpu');
  const ramOptions = getUniqueOptions('ram');
  const storageOptions = getUniqueOptions('storage');
  const coolerOptions = getUniqueOptions('cooler');
  const caseOptions = getUniqueOptions('case');
  const psuOptions = getUniqueOptions('powerSupply');

  const filteredProducts = products
    .filter((p) => {
      const query = searchQuery.toLowerCase();
      const price = p.price || 0;

      const matchesSearch =
        p.name?.toLowerCase().includes(query) ||
        p.cpu?.toLowerCase().includes(query) ||
        p.gpu?.toLowerCase().includes(query) ||
        p.motherboard?.toLowerCase().includes(query);

      const matchesField = (field) => {
        if (field === 'caseName') return !filters.caseName || p.case?.toLowerCase().includes(filters.caseName.toLowerCase());
        return !filters[field] || p[field]?.toLowerCase().includes(filters[field].toLowerCase());
      };

      const matchesPrice =
        price >= filters.priceRange[0] && price <= filters.priceRange[1];

      return (
        matchesSearch &&
        matchesField('cpu') &&
        matchesField('gpu') &&
        matchesField('ram') &&
        matchesField('storage') &&
        matchesField('cooler') &&
        matchesField('caseName') &&
        matchesField('powerSupply') &&
        matchesPrice
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <nav className="bg-[#1f2937] shadow z-20 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/img/Knighton_Tech_Full _White.png" alt="Knighton Tech" className="h-10 w-auto" />
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
          <button className="md:hidden focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0" style={{ backgroundImage: "url('/img/hero-background.jpg')" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold mb-10 text-center">Custom Builds</h1>
          <div className="bg-gray-900 p-4 rounded mb-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, CPU, GPU..."
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white mr-4"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    cpu: '',
                    gpu: '',
                    ram: '',
                    storage: '',
                    cooler: '',
                    caseName: '',
                    powerSupply: '',
                    priceRange: priceBounds,
                    featuresMotherboard: [],
                    featuresCase: [],
                  });
                  setSortBy('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[{ label: 'CPU', key: 'cpu', options: cpuOptions },
                { label: 'GPU', key: 'gpu', options: gpuOptions },
                { label: 'RAM', key: 'ram', options: ramOptions },
                { label: 'Storage', key: 'storage', options: storageOptions },
                { label: 'Cooler', key: 'cooler', options: coolerOptions },
                { label: 'Case', key: 'caseName', options: caseOptions },
                { label: 'Power Supply', key: 'powerSupply', options: psuOptions }].map(({ label, key, options }) => (
                <select
                  key={key}
                  value={filters[key]}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="">{label}</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-white text-sm font-medium block mb-2">
                Price Range: ${filters.priceRange[0]} – ${filters.priceRange[1]} (of ${priceBounds[0]}–${priceBounds[1]})
              </label>
              <Slider
                range
                min={priceBounds[0]}
                max={priceBounds[1]}
                step={50}
                value={filters.priceRange}
                onChange={(range) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: range,
                  }))
                }
                trackStyle={[{ backgroundColor: '#3b82f6' }]}
                handleStyle={[
                  { borderColor: '#3b82f6', backgroundColor: '#3b82f6' },
                  { borderColor: '#3b82f6', backgroundColor: '#3b82f6' },
                ]}
                railStyle={{ backgroundColor: '#4b5563' }}
              />
            </div>

            <div className="mt-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-full"
              >
                <option value="">Sort by...</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((p) => {
          const price = p.price;
          return (
            <div
              key={p._id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col"
            >
              <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="text-gray-300 text-sm">CPU: {p.cpu}</p>
                <p className="text-gray-300 text-sm">Motherboard: {p.motherboard}</p>
                {Array.isArray(p.featuresMotherboard) && p.featuresMotherboard.length > 0 && (
                  <p className="text-gray-400 text-xs">
                    MB Features: {p.featuresMotherboard.join(', ')}
                  </p>
                )}
                <p className="text-gray-300 text-sm">RAM: {p.ram}</p>
                <p className="text-gray-300 text-sm">Graphics: {p.gpu}</p>
                <p className="text-gray-300 text-sm">Storage: {p.storage}</p>
                <p className="text-gray-300 text-sm">Cooler: {p.cooler}</p>
                <p className="text-gray-300 text-sm">Case: {p.case}</p>
                {Array.isArray(p.featuresCase) && p.featuresCase.length > 0 && (
                  <p className="text-gray-400 text-xs">
                    Case Features: {p.featuresCase.join(', ')}
                  </p>
                )}
                <p className="text-gray-300 text-sm">Power Supply: {p.powerSupply}</p>
                <div className="mt-auto flex justify-between items-center pt-4">
                  <span className="text-lg font-bold">${price.toFixed(2)}</span>
                  <a
                    href={`/product/${p._id}`}
                    className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </div>
        <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400 z-10 relative">
          © 2025 Knighton Tech. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
