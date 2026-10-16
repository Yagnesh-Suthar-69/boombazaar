'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanQuery = orderQuery.trim();
    if (!cleanQuery) {
      setError('Please enter your Order Number (e.g. BB-261015-1234)');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        setError('No order found matching this number. Please verify and try again.');
        setIsSearching(false);
        return;
      }

      router.push(`/order/${data.order.order_number}`);
    } catch {
      setError('Failed to search order. Please try again.');
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-widest text-fire-600">
          Order Status
        </span>
        <h1 className="font-heading text-3xl font-black text-slate-900">
          Track Your Fireworks Order
        </h1>
        <p className="text-xs text-slate-600">
          Enter your Order Number to see where your delivery is and check your bill.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Order ID / Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. BB-261015-1234"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="btn-firecracker w-full py-3 px-4 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>{isSearching ? 'Locating Order...' : 'Track Order Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-500">
            Need urgent assistance? Chat with our team on WhatsApp at{' '}
            <a
              href="https://wa.me/8128627017"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline font-semibold"
            >
              8128627017
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
