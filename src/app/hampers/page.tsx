'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, Sparkles, ArrowLeft, ShieldCheck, Truck, PhoneCall } from 'lucide-react';
import HamperCard, { HamperItem } from '@/components/HamperCard';

export default function HampersPage() {
  const [hampers, setHampers] = useState<HamperItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hampers')
      .then((res) => res.json())
      .then((data) => {
        if (data.hampers) setHampers(data.hampers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-fire-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-200">
          💥 Free Home Delivery on ₹2,500+
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-fire-50 border border-fire-200 text-fire-700 text-xs font-black uppercase tracking-wider shadow-sm">
          <Gift className="w-4 h-4" />
          <span>Diwali Special Family Assortments</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Curated Diwali Gift Hampers & Combo Boxes
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Every hamper includes an assorted mix of sparklers, flower pots, sky shots, and novelty fireworks at massive combo savings. Treated as one item in your cart to guarantee zero duplicate charges.
        </p>
      </div>

      {/* Hampers Listing */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 font-medium">
          Loading festive gift hampers...
        </div>
      ) : hampers.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-500">
          No hampers are currently published. Check back soon for festive combo launches!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hampers.map((hamper) => (
            <HamperCard key={hamper.id} hamper={hamper} />
          ))}
        </div>
      )}

      {/* Value Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-black text-slate-900 text-sm">
              Custom Corporate & Society Bulk Hampers
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Need 20+ hampers for family gifting, offices, or residential communities? Contact our direct desk.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/8128627017?text=Hi%20Boom%20Bazaar,%20I%20am%20interested%20in%20custom%20bulk%20Diwali%20gift%20hampers."
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Inquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
