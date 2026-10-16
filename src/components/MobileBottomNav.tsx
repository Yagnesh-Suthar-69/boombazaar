'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Gift, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isProductsActive = pathname.startsWith('/products') || pathname.startsWith('/categories');
  const isHampersActive = pathname.startsWith('/hampers');
  const isTrackActive = pathname === '/track-order';
  const isCartActive = pathname === '/cart';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.07)] transition-all select-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="grid grid-cols-5 items-center justify-around h-14 max-w-lg mx-auto px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 relative group transition-transform active:scale-90 ${
            isHomeActive ? 'text-fire-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {isHomeActive && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-fire-600 to-spark-500" />
          )}
          <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 text-fire-600' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">Home</span>
        </Link>

        {/* 2. All Fireworks */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 relative group transition-transform active:scale-90 ${
            isProductsActive ? 'text-fire-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {isProductsActive && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-fire-600 to-spark-500" />
          )}
          <Sparkles className={`w-5 h-5 transition-transform ${isProductsActive ? 'scale-110 text-fire-600' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">Fireworks</span>
        </Link>

        {/* 3. Hampers (Featured) */}
        <Link
          href="/hampers"
          className={`flex flex-col items-center justify-center py-1 relative group transition-transform active:scale-90 ${
            isHampersActive ? 'text-fire-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {isHampersActive && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-fire-600 to-spark-500" />
          )}
          <div className="relative">
            <Gift className={`w-5 h-5 transition-transform ${isHampersActive ? 'scale-110 text-fire-600' : ''}`} />
            <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[8px] font-black rounded-full shadow-sm animate-pulse">
              HOT
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">Hampers</span>
        </Link>

        {/* 4. Track Order */}
        <Link
          href="/track-order"
          className={`flex flex-col items-center justify-center py-1 relative group transition-transform active:scale-90 ${
            isTrackActive ? 'text-fire-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {isTrackActive && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-fire-600 to-spark-500" />
          )}
          <Truck className={`w-5 h-5 transition-transform ${isTrackActive ? 'scale-110 text-fire-600' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">Track</span>
        </Link>

        {/* 5. Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center py-1 relative group transition-transform active:scale-90 ${
            isCartActive ? 'text-fire-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
          aria-label="Open Cart"
        >
          {isCartActive && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-fire-600 to-spark-500" />
          )}
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform ${isCartActive ? 'scale-110 text-fire-600' : ''}`} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-fire-600 to-spark-500 text-white font-black text-[9px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 border border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">Cart</span>
        </button>
      </div>
    </nav>
  );
}
