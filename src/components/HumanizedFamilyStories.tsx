'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';

export default function HumanizedFamilyStories() {
  const reviews = [
    {
      name: 'Neeta & Hemant Parekh',
      location: 'Joint Family, Vastrapur, Ahmedabad',
      event: 'Diwali Terrace Party with 16 Family Members',
      rating: 5,
      avatar: '🪔',
      quote:
        'With elderly parents and 3 young grandkids in the house, we were very particular about safety and smoke. Every single piece in the Family Joy Hamper lit smoothly on the first strike. The 50cm golden sparklers burned for over a full minute without any choking smell. Truly grandma-approved!',
    },
    {
      name: 'Dr. Vikram Patel',
      location: 'Alkapuri, Vadodara',
      event: 'Verified Home Delivery Buyer',
      rating: 5,
      avatar: '✨',
      quote:
        'I was honestly hesitant about buying crackers online. But Boom Bazaar’s WhatsApp team verified my order in minutes and delivered in heavy-duty waterproof packaging. The 50-shot aerial cake was spectacular — the entire neighborhood came out on their balconies to watch!',
    },
    {
      name: 'Sunita Deshmukh',
      location: 'Vesu, Surat',
      event: 'Apartment Society Diwali Celebration',
      rating: 5,
      avatar: '🎆',
      quote:
        'Ordered 4 Diwali Assortment Boxes for our wing. Zero duds, zero duds! Every child received their own box of flower pots and ground chakkars. Will never buy from overpriced roadside stalls again.',
    },
  ];

  return (
    <section className="container mx-auto px-4 space-y-12">
      {/* OUR ARTISAN FAMILY PROMISE */}
      <div className="relative rounded-3xl bg-white border border-orange-200/90 p-8 sm:p-12 shadow-sm overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 text-orange-950 text-xs font-black uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-fire-600" />
            <span>The Boom Bazaar Heart & Heritage</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            Handcrafted with Care in Sivakasi, Delivered with Family Pride.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We started Boom Bazaar because we grew tired of overpriced, damp street crackers that fizzled out or filled living rooms with harsh chemical smoke. We partner directly with licensed third-generation artisan families in Sivakasi to bring you fresh, certified green fireworks.
          </p>

          {/* 3 Pillars of Trust */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-fire-700 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-fire-600 flex-shrink-0" />
                <span>Zero Duds Guarantee</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If any firecracker fails to light properly, send us a WhatsApp photo. We will refund or replace it immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>CSIR-NEERI Green Certified</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Formulated with low-smoke, barium-free nitrates. 35% reduced particulate emissions for cleaner neighborhood air.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Fresh Season Batch</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero old stock. Every box is fresh from this year’s manufacturing cycle, guaranteeing crisp, instantaneous sparks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIED FAMILY TESTIMONIALS */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-fire-600 block">
            Real Celebrations, Real Smiles
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
            Stories from Families Who Celebrated With Us
          </h3>
          <p className="text-xs text-slate-600">
            Over 14,200 households across Gujarat and India lit up their Diwali night with Boom Bazaar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 hover:border-orange-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                  {rev.avatar}
                </div>
                <div className="min-w-0">
                  <h5 className="font-heading font-black text-xs text-slate-900 truncate">
                    {rev.name}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {rev.location}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                    ✓ Verified Customer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
