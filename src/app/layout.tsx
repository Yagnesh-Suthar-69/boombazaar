import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import FireworksCanvas from '@/components/FireworksCanvas';
import FloatingWhatsAppConcierge from '@/components/FloatingWhatsAppConcierge';

export const metadata: Metadata = {
  title: 'Boom Bazaar — Premium Certified Fireworks & Sparklers',
  description:
    'Order premium green fireworks, sparkling aerial shots, multi-color anars, whistling rockets, and Diwali gift hampers online with direct WhatsApp ordering and safe doorstep delivery.',
  keywords: [
    'fireworks online',
    'buy crackers',
    'diwali crackers online',
    'boom bazaar',
    'aerial fireworks',
    'green crackers',
    'sparklers',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#fafafc] text-slate-900 flex flex-col antialiased selection:bg-fire-600 selection:text-white">
        <CartProvider>
          <FireworksCanvas />
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingWhatsAppConcierge />
        </CartProvider>
      </body>
    </html>
  );
}
