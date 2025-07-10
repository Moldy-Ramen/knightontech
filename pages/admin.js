// pages/admin.js

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Auth State for httpOnly cookie flow ---
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Orders & Products ---
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Views ---
  const [view, setView] = useState('orders');

  // --- Product Form State ---
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    discount: 0,
    cpu: '',
    motherboard: '',
    featuresMotherboard: '',
    ram: '',
    gpu: '',
    storage: '',
    cooler: '',
    case: '',
    featuresCase: '',
    powerSupply: '',
    image: '',
    file: null,
  });

  // --- Auth Check and Data Fetch ---
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.status === 200) {
          setIsAuthorized(true);
          setAuthChecked(true);
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setIsAuthorized(false);
          setAuthChecked(true);
        }
      } catch (err) {
        setIsAuthorized(false);
        setAuthChecked(true);
      }
    };
    checkAuthAndFetch();
  }, []);

  // --- Fetch Orders/Products only after auth ---
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.status === 200) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else if (res.status === 401) {
        setIsAuthorized(false);
      }
    } catch (e) {
      setIsAuthorized(false);
      console.error('Failed to load orders', e);
    }
  };
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.status === 200) {
        const data = await res.json();
        setProducts(data.products || []);
      } else if (res.status === 401) {
        setIsAuthorized(false);
      }
    } catch (e) {
      setIsAuthorized(false);
      console.error('Failed to load products', e);
    }
  };

  // --- Login Handler ---
  const handleLogin = async e => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setLoginError('Incorrect password');
    }
  };

  // --- Filter Orders on Search Change ---
  useEffect(() => {
    setFilteredOrders(
      orders.filter(o =>
        JSON.stringify(o).toLowerCase().includes(search.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [search, orders]);

  // --- Product Form Handlers ---
  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleFile = e => {
    setForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  // --- Save Product ---
  const saveProduct = async () => {
    try {
      let imageUrl = form.image;
      if (form.file) {
        const data = new FormData();
        data.append('file', form.file);
        const up = await fetch('/api/upload', { method: 'POST', body: data });
        const json = await up.json();
        imageUrl = json.url;
      }
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        cpu: form.cpu,
        motherboard: form.motherboard,
        featuresMotherboard: form.featuresMotherboard
          .split(',')
          .map(f => f.trim()),
        ram: form.ram,
        gpu: form.gpu,
        storage: form.storage,
        cooler: form.cooler,
        case: form.case,
        featuresCase: form.featuresCase
          .split(',')
          .map(f => f.trim()),
        powerSupply: form.powerSupply,
        image: imageUrl,
      };

      const method = editing ? 'PUT' : 'POST';
      const endpoint = editing
        ? `/api/products/${editing._id}`
        : '/api/products';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      await fetchProducts();
      setForm({
        name: '',
        price: '',
        cpu: '',
        motherboard: '',
        featuresMotherboard: '',
        ram: '',
        gpu: '',
        storage: '',
        cooler: '',
        case: '',
        featuresCase: '',
        powerSupply: '',
        image: '',
        file: null,
      });
      setEditing(null);
      setFormVisible(false);
    } catch (err) {
      alert('Error saving product');
      console.error(err);
    }
  };

  const startEdit = product => {
    setEditing(product);
    setForm({ ...product, price: product.price.toString(), file: null });
    setFormVisible(true);
  };
  const deleteProduct = async id => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  // --- Pagination for Orders ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const pageSlice = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Update Order Status ---
  const updateStatus = async (idKey, newStatus) => {
    const res = await fetch(`/api/orders/${idKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      fetchOrders();
    } else {
      console.error('Failed to update status:', await res.text());
    }
  };

  // --- Fetch products when switching to products view (after login) ---
  useEffect(() => {
    if (isAuthorized && view === 'products') {
      fetchProducts();
    }
  }, [isAuthorized, view]);

  // --- Fetch orders when switching to orders view (after login) ---
  useEffect(() => {
    if (isAuthorized && view === 'orders') {
      fetchOrders();
    }
  }, [isAuthorized, view]);

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
          <ul className="hidden md:flex space-x-6 text-sm font-medium items-center">
            <li><a href="/" className="hover:text-blue-400">Home</a></li>
            <li><a href="/services" className="hover:text-blue-400">Services</a></li>
            <li><a href="/store" className="hover:text-blue-400">Store</a></li>
            <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
            <li><a href="/admin" className="text-blue-400 font-bold">Admin</a></li>
          </ul>
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
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
              <li><a href="/admin" className="text-blue-400 font-bold">Admin</a></li>
            </ul>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          {!authChecked ? (
            <div>Loading...</div>
          ) : !isAuthorized ? (
            <div className="max-w-xs mx-auto bg-gray-900 p-6 rounded shadow space-y-4">
              <p className="text-red-500 text-center">Not authorized</p>
              <form onSubmit={handleLogin} className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Admin Password"
                  className="w-full p-2 rounded bg-gray-800"
                />
                {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                <button className="w-full bg-blue-600 py-2 rounded" type="submit">
                  Login
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setView('orders')}
                  className={view === 'orders' ? 'font-bold text-white' : 'text-gray-400'}
                >
                  Orders
                </button>
                <button
                  onClick={() => setView('products')}
                  className={view === 'products' ? 'font-bold text-white' : 'text-gray-400'}
                >
                  Products
                </button>
              </div>

              {/* ORDERS VIEW */}
              {view === 'orders' && (
                <div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="mb-4 p-2 w-full bg-gray-800 rounded"
                  />

                  <div className="space-y-4">
                    {pageSlice.length === 0 && (
                      <div className="text-center text-gray-400 py-8">No orders found.</div>
                    )}
                    {pageSlice.map(order => {
                      const keyId = order.orderNumber || order._id;
                      return (
                        <div
                          key={keyId}
                          className="bg-gray-800 p-4 rounded space-y-2"
                        >
                          <p><strong>Order #:</strong> {order.orderNumber || order._id}</p>
                          <p><strong>Name:</strong> {order.name}</p>
                          <p><strong>Email:</strong> {order.email}</p>
                          <p><strong>Phone:</strong> {order.phone}</p>
                          <p>
                            <strong>Address:</strong>{' '}
                            {order.address.line1}, {order.address.city}, {order.address.state}{' '}
                            {order.address.postal_code}, {order.address.country}
                          </p>
                          <div>
                            <strong>Items:</strong>
                            <ul className="ml-4 list-disc list-inside">
                              {order.items.map((item, i) => (
                                <li key={i}>{item.name} ×{item.qty} @ {item.price}</li>
                              ))}
                            </ul>
                          </div>
                          <p>
                            <strong>Shipping:</strong>{' '}
                            {order.shipping?.carrier ?? 'N/A'} – $
                            {(order.shipping?.rate != null
                              ? order.shipping.rate.toFixed(2)
                              : '0.00')}{' '}
                            {order.shipping?.delivery_days != null
                              ? `(${order.shipping.delivery_days} days)`
                              : order.shipping?.estimated_delivery
                                ? `(${order.shipping.estimated_delivery})`
                                : ''}
                          </p>
                          <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                          <p>
                            <strong>Created:</strong>{' '}
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <label className="font-semibold">Status:</label>
                            <select
                              value={order.status}
                              onChange={e => updateStatus(keyId, e.target.value)}
                              className="bg-gray-700 text-white rounded p-1"
                            >
                              {['Pending', 'Accepted', 'In Progress', 'Completed'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <a
                            href={`/api/get-receipt-pdf?session_id=${order.sessionId}`}
                            target="_blank"
                            className="inline-block mt-2 bg-blue-600 px-3 py-1 rounded"
                          >
                            Receipt
                          </a>
                        </div>
                      );
                    })}
                  </div>
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${currentPage === 1
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                    >
                      Prev
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded ${currentPage === totalPages
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* PRODUCTS VIEW */}
              {view === 'products' && (
                <div>
                  <button
                    onClick={() => { setFormVisible(true); setEditing(null); }}
                    className="mb-4 bg-green-600 px-3 py-1 rounded"
                  >
                    Add Product
                  </button>
                  <div className="space-y-4">
                    {products.length === 0 && (
                      <div className="text-center text-gray-400 py-8">No products found.</div>
                    )}
                    {products.map(p => (
                      <div
                        key={p._id}
                        className="bg-gray-800 p-4 rounded flex items-center justify-between"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                        <div className="flex-1 ml-4">
                          <h2 className="text-lg font-semibold">{p.name}</h2>
                          <p className="text-sm text-gray-300">{p.specs}</p>
                          <p>
                            ${p.price.toFixed(2)}
                            {p.discount > 0 && (
                              <span className="ml-2 text-red-500">−{p.discount}%</span>
                            )}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="px-2 py-1 bg-blue-600 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p._id)}
                            className="px-2 py-1 bg-red-600 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Modal Form */}
                  {formVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-gray-900 p-6 rounded-lg w-96 space-y-3 overflow-auto max-h-full">
                        <h3 className="text-xl mb-4">
                          {editing ? 'Edit' : 'Add'} Product
                        </h3>
                        <input
                          placeholder="Name"
                          value={form.name}
                          onChange={e => handleFormChange('name', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Price"
                          value={form.price}
                          onChange={e => handleFormChange('price', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="CPU"
                          value={form.cpu}
                          onChange={e => handleFormChange('cpu', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Motherboard"
                          value={form.motherboard}
                          onChange={e => handleFormChange('motherboard', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <textarea
                          placeholder="Motherboard Features (comma-separated)"
                          value={form.featuresMotherboard}
                          onChange={e => handleFormChange('featuresMotherboard', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded h-20"
                        />
                        <input
                          placeholder="RAM"
                          value={form.ram}
                          onChange={e => handleFormChange('ram', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Graphics Card"
                          value={form.gpu}
                          onChange={e => handleFormChange('gpu', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Storage"
                          value={form.storage}
                          onChange={e => handleFormChange('storage', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Cooler"
                          value={form.cooler}
                          onChange={e => handleFormChange('cooler', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Case"
                          value={form.case}
                          onChange={e => handleFormChange('case', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <textarea
                          placeholder="Case Features (comma-separated)"
                          value={form.featuresCase}
                          onChange={e => handleFormChange('featuresCase', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded h-20"
                        />
                        <input
                          placeholder="Power Supply"
                          value={form.powerSupply}
                          onChange={e => handleFormChange('powerSupply', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <input
                          placeholder="Image URL (https://...)"
                          value={form.image}
                          onChange={e => handleFormChange('image', e.target.value)}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => { setFormVisible(false); setEditing(null); }}
                            className="px-3 py-1 bg-gray-700 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveProduct}
                            className="px-3 py-1 bg-green-600 rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
