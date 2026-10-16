'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Flame, Menu, X, PhoneCall, ShieldCheck, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import FestiveCountdownBar from './FestiveCountdownBar';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeLogo, setStoreLogo] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('Boom Bazaar');

  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.store_logo) setStoreLogo(data.settings.store_logo);
        if (data.settings?.store_name) setStoreName(data.settings.store_name);
      })
      .catch(() => {});
  }, []);

  if (isAdminRoute) {
    return null; // Admin has dedicated sidebar
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Fireworks', href: '/products' },
    { label: 'Diwali Hampers', href: '/hampers', badge: 'Offers' },
    { label: 'Sky Shots', href: '/categories/aerial-shots' },
    { label: 'Sparklers', href: '/categories/sparklers' },
    { label: 'Track Order', href: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 border-b border-slate-200/80 transition-all shadow-sm">
      <FestiveCountdownBar />
      {/* Top Banner with Simple English */}
      <div className="bg-gradient-to-r from-fire-600 via-flame-600 to-spark-500 py-1.5 px-4 text-xs font-semibold text-white tracking-wide shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-yellow-300 animate-ping" />
            <span>💥 DIWALI FIREWORKS SALE: Up to 50% OFF + Free Home Delivery on ₹2,500+</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-amber-100">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" /> 100% Safe Green Crackers
            </span>
            <a
              href="https://wa.me/8128627017"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors underline font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5" /> WhatsApp: 8128627017
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo with Uploaded Logo Support */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {storeLogo ? (
            <div className="h-10 max-w-[150px] relative flex items-center">
              <Image
                src={storeLogo}
                alt={storeName}
                width={140}
                height={40}
                unoptimized
                className="max-h-10 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fire-600 via-flame-500 to-spark-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-2xl font-black tracking-tight text-slate-900">
                    BOOM<span className="text-gradient-fire">BAZAAR</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  Buy Diwali Fireworks Online
                </p>
              </div>
            </div>
          )}
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search sparklers, sky shots, rockets, gift boxes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500 focus:bg-white focus:ring-1 focus:ring-fire-500 transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 px-3.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
          >
            Search
          </button>
        </form>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold transition-colors flex items-center gap-1 py-1 ${
                  isActive
                    ? 'text-fire-600 font-bold border-b-2 border-fire-600'
                    : 'text-slate-700 hover:text-fire-600'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-fire-100 text-fire-700 font-bold text-[9px]">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* WhatsApp Direct Order Button */}
          <a
            href="https://wa.me/8128627017"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
            title="Chat on WhatsApp"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>8128627017</span>
          </a>

          {/* Cart Button */}
          <button
            id="nav-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-fire-500 hover:text-fire-600 transition-all shadow-sm"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-fire-600 to-flame-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {/* Admin Login Link */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <span>Admin</span>
          </Link>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search fireworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col gap-1 pt-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  pathname === link.href ? 'bg-orange-50 text-fire-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-fire-100 text-fire-700 text-[9px] font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-between mt-2 pt-2 border-t border-slate-100"
            >
              <span>Admin Management</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
