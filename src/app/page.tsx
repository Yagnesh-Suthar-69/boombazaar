'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import {
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Truck,
  PhoneCall,
  CheckCircle2,
  PackageCheck,
  Zap,
  Gift,
} from 'lucide-react';
import ProductCard, { ProductItem } from '@/components/ProductCard';
import HamperCard, { HamperItem } from '@/components/HamperCard';
import HumanizedFamilyStories from '@/components/HumanizedFamilyStories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const badgesRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hampers, setHampers] = useState<HamperItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, hamRes] = await Promise.all([
          fetch('/api/products?limit=8'),
          fetch('/api/categories'),
          fetch('/api/hampers'),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const hamData = await hamRes.json();

        if (prodData.products) setFeaturedProducts(prodData.products);
        if (catData.categories) setCategories(catData.categories);
        if (hamData.hampers) setHampers(hamData.hampers);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // GSAP Hero entrance animations with accessibility reduced-motion check
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from(badgesRef.current, {
        y: -15,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from(headlineRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: 'power3.out',
      });

      gsap.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-16 pb-20 overflow-hidden">
      {/* HERO SECTION - Light Mode, Simple English */}
      <section
        ref={heroRef}
        className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-orange-50/25 to-[#fafafc] border-b border-slate-200/80"
      >
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-6">
          {/* Shimmer Badge */}
          <div
            ref={badgesRef}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Diwali Fireworks Sale 2026 is Live!
            </span>
          </div>

          {/* Simple Headline */}
          <h1
            ref={headlineRef}
            className="font-heading text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            Buy Safe & Bright Diwali{' '}
            <span className="text-gradient-fire block sm:inline">
              Fireworks Online.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Order certified green sparklers, high sky shots, flower pots, rockets, and family gift hampers. Enjoy fast home delivery, real video demonstrations, and easy WhatsApp ordering.
          </p>

          {/* Action Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <Link
              href="/products"
              className="btn-firecracker w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-black text-sm flex items-center justify-center gap-2 shadow-md text-white"
            >
              <Flame className="w-5 h-5 text-yellow-200" />
              <span>See All Fireworks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/hampers"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-heading font-black text-sm bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Gift className="w-4 h-4 text-fire-600" />
              <span>Diwali Gift Hampers</span>
            </Link>

            <a
              href="https://wa.me/8128627017"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-heading font-bold text-sm bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Order on WhatsApp</span>
            </a>
          </div>

          {/* Simple Value Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Safe Green Crackers</h4>
                <p className="text-[11px] text-slate-500">Low smoke & certified</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <Truck className="w-6 h-6 text-fire-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Free Home Delivery</h4>
                <p className="text-[11px] text-slate-500">On all orders above ₹2,500</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Guaranteed to Fire</h4>
                <p className="text-[11px] text-slate-500">Every cracker bursts properly</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <PackageCheck className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Store Self-Pickup</h4>
                <p className="text-[11px] text-slate-500">Pick up from our yard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIWALI GIFT HAMPERS SECTION */}
      {hampers.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-black uppercase tracking-wider mb-2">
                <Gift className="w-3.5 h-3.5 text-fire-600" /> Complete Celebration Packs
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                Diwali Special Family Assortments
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                All-in-one family combo boxes. Click any hamper to inspect all included products, photos, individual prices, and related fireworks!
              </p>
            </div>
            <Link
              href="/hampers"
              className="text-xs font-bold text-fire-600 hover:text-fire-700 flex items-center gap-1 transition-colors"
            >
              <span>View All Hampers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hampers.map((hamper) => (
              <HamperCard key={hamper.id} hamper={hamper} />
            ))}
          </div>
        </section>
      )}

      {/* POPULAR CATEGORIES */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-fire-600 block mb-1">
              Browse by Type
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
              Shop by Cracker Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-fire-600 hover:text-fire-700 flex items-center gap-1 transition-colors"
          >
            <span>See All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-2xl bg-white border border-slate-200 p-3 hover:border-fire-400 transition-all hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center shadow-sm hover:shadow-md"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100 border border-slate-100">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading font-black text-xs text-slate-900 group-hover:text-fire-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                {cat.product_count || 0} Items
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED BESTSELLERS */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-fire-600" /> Top Selling Crackers
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
              Most Popular Fireworks
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-fire-600 hover:text-fire-700 flex items-center gap-1 transition-colors"
          >
            <span>See Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading fireworks...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4 SIMPLE SAFETY RULES */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 block">
              Enjoy Fireworks Responsibly
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
              4 Simple Rules for Safe Fireworks
            </h2>
            <p className="text-xs text-slate-600">
              Follow these simple guidelines to make your Diwali celebration safe, peaceful, and joy-filled.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-fire-600 flex items-center justify-center mx-auto text-lg font-black">
                1
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">Keep Safe Distance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Light sparklers at arm length. Keep minimum 15 to 25 meters distance from aerial sky cakes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-lg font-black">
                2
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">Keep Water Ready</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Always keep a bucket of water and sand nearby to quickly cool spent sparkler wires and flower pot cones.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg font-black">
                3
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">Light Outside Only</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never light crackers indoors or on crowded balconies. Use clear open grounds away from parked cars.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-lg font-black">
                4
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900">Adult Supervision</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Children must always be guided and accompanied by an adult when lighting festive sparklers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HUMANIZED SIVAKASI ARTISAN PROMISE & VERIFIED FAMILY REVIEWS */}
      <HumanizedFamilyStories />
    </div>
  );
}
