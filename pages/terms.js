// pages/terms.js

export default function TermsOfService() {
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
            <li><a href="/terms" className="hover:text-blue-400">Terms of Service</a></li>
          </ul>
        </div>
      </nav>

      <main className="relative flex-1 overflow-hidden">
        {/* Hero background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-50 z-0"
          style={{ backgroundImage: "url('/img/hero-background.jpg')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>

          <p className="mb-6">
            These Terms of Service ("Terms") govern your use of the Knighton Tech website and services ("we", "our", or "us"). By accessing or using our website, you agree to these Terms in full.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">1. Use of the Website</h2>
          <p className="mb-6">
            You agree to use this website for lawful purposes only and not to violate any applicable laws or regulations. You may not engage in any behavior that disrupts or interferes with the security, accessibility, or functionality of the website.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">2. Product Information</h2>
          <p className="mb-6">
            We strive to display accurate information about our products, including descriptions and pricing. However, we reserve the right to correct any errors and to update or modify product details at any time without prior notice.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">3. Orders and Payments</h2>
          <p className="mb-6">
            By placing an order, you agree that all information provided is accurate and that you are authorized to use the chosen payment method. All payments are securely processed through Stripe. We reserve the right to cancel or refuse any order at our discretion.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">4. Shipping and Returns</h2>
          <p className="mb-6">
            Estimated shipping times and return policies will be clearly stated at checkout or on the relevant product pages. If you have issues with an order, please contact us at <strong>support@knightontech.com</strong>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">5. Intellectual Property</h2>
          <p className="mb-6">
            All content on this website—including logos, graphics, product designs, and written material—is the property of Knighton Tech or its content suppliers and is protected by intellectual property laws. You may not reuse or reproduce this content without permission.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">6. Limitation of Liability</h2>
          <p className="mb-6">
            We are not liable for any indirect, incidental, or consequential damages arising from your use of this website or any services purchased. Our liability is limited to the amount you paid for the product or service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">7. Changes to These Terms</h2>
          <p className="mb-6">
            We may update these Terms at any time. When we do, we will revise the "Last updated" date below. Your continued use of the website constitutes acceptance of any changes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-2">8. Contact Us</h2>
          <p className="mb-8">
            If you have questions about these Terms, you can reach us at:<br />
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
