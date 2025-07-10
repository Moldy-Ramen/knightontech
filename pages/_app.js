import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe only once
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </CartProvider>
  );
}
