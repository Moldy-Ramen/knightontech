// pages/privacy.js

export default function PrivacyPolicy() {
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
            <li><a href="/privacy" className="hover:text-blue-400">Privacy Policy</a></li>
          </ul>
          {/* Optional mobile nav button */}
        </div>
      </nav>

      <main className="relative flex-1 overflow-hidden">
        {/* Hero background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

          <p className="mb-6">
            <strong>Knighton Tech</strong> (“we”, “our”, or “us”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or make a purchase through our store.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
          <div className="mb-6">
            <p>When you make a purchase or fill out a contact form, we may collect:</p>
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>Your name and email address</li>
              <li>Shipping and billing information</li>
              <li>Order details and preferences</li>
              <li>Any messages you submit via forms</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
          <div className="mb-6">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>Process and deliver orders</li>
              <li>Respond to inquiries or support requests</li>
              <li>Improve our website and customer experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-2">3. Sharing of Information</h2>
          <div className="mb-6">
            <p>We only share your information with trusted third parties when necessary to:</p>
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>Process payments (e.g. Stripe)</li>
              <li>Fulfill orders</li>
              <li>Maintain website infrastructure</li>
            </ul>
            <p className="mt-2">We never sell your information.</p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-2">4. Cookies and Analytics</h2>
          <p className="mb-6">
            Our website may use cookies to enhance site functionality. We may use analytics tools to understand how visitors interact with our website. These tools do not identify individuals.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">5. Data Security</h2>
          <p className="mb-6">
            We implement standard industry practices to protect your data. Sensitive information, such as payment details, is handled securely by trusted processors like Stripe.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">6. Your Rights</h2>
          <p className="mb-6">
            You may request access to, correction of, or deletion of your personal data by contacting us using the details below.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">7. Contact Us</h2>
          <p className="mb-8">
            If you have any questions about this Privacy Policy, you can reach us at:<br />
            <strong>support@knightontech.com</strong>
          </p>

          <p className="text-gray-400 mt-8 text-sm text-center">Last updated: June 6, 2025</p>
        </div>
      </main>

      <footer className="bg-[#1f2937] text-center py-4 text-sm text-gray-400">
        © 2025 Knighton Tech. All rights reserved.
      </footer>
    </div>
  );
}
