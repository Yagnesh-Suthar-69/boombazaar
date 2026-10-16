'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Sparkles, Flame, Gift, ArrowRight, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function FestiveCelebrationQuiz() {
  const [activeTab, setActiveTab] = useState<'family' | 'sky' | 'gifting'>('family');
  const { addToCart } = useCart();
  const [addedKey, setAddedKey] = useState<string | null>(null);

  const handleQuickAdd = (item: any, key: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('boom:sparkle', {
          detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        })
      );
    }

    addToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      sku: item.sku || `REC-${item.id}`,
      price: item.price,
      salePrice: item.salePrice,
      image: item.image,
      categoryName: item.categoryName,
      stock: 50,
      itemType: item.itemType || 'product',
      includedProducts: item.includedProducts,
    });

    setAddedKey(key);
    setTimeout(() => setAddedKey(null), 1600);
  };

  const recommendations = {
    family: {
      title: 'Gentle, Safe & Low-Smoke for Children & Grandparents',
      subtitle: 'Soft sound levels that do not frighten pets or sensitive ears, with long-lasting dazzling golden showers.',
      badge: '👶 Kid & Elder Approved',
      items: [
        {
          id: 'prod_01',
          name: 'Golden Glittering Sparklers (50cm)',
          slug: 'golden-glittering-sparklers-50cm',
          price: 25000,
          salePrice: 19900,
          categoryName: 'Sparklers',
          image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
          perk: 'Burns for 90+ seconds, zero toxic barium',
        },
        {
          id: 'prod_03',
          name: 'Giant Deluxe Flower Pot Anars (Pack of 5)',
          slug: 'giant-flower-pot-anar-pack-of-5',
          price: 45000,
          salePrice: 38000,
          categoryName: 'Flower Pots',
          image: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=400&q=80',
          perk: '15-foot sparkling fountain of gold sparks',
        },
        {
          id: 'prod_05',
          name: 'Special Ground Wheel Chakkars (Pack of 10)',
          slug: 'ground-wheel-chakkars-pack-of-10',
          price: 32000,
          salePrice: 26000,
          categoryName: 'Ground Spinners',
          image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
          perk: 'High-speed spinning wheels of golden sparks',
        },
      ],
    },
    sky: {
      title: 'Spectacular Night Sky Aerial Bursts & High Cakes',
      subtitle: 'Engineered for rooftop and open ground parties. Dazzling multi-shot cakes and whistling rockets.',
      badge: '🚀 Rooftop & Party Favorite',
      items: [
        {
          id: 'prod_02',
          name: '50 Sky Shots Big Celebration Cake',
          slug: '50-sky-shots-big-celebration-cake',
          price: 189900,
          salePrice: 149900,
          categoryName: 'Aerial Shots',
          image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80',
          perk: '50 continuous multi-colour floral bursts at 50m',
        },
        {
          id: 'prod_04',
          name: 'Whistling Sky Rockets (Pack of 5)',
          slug: 'whistling-sky-rockets-pack-of-5',
          price: 55000,
          salePrice: 44000,
          categoryName: 'Rockets',
          image: 'https://images.unsplash.com/photo-1576400883215-7083980b619f?auto=format&fit=crop&w=400&q=80',
          perk: 'High-thrust screaming rockets with gold bursts',
        },
      ],
    },
    gifting: {
      title: 'Complete All-in-One Family Assortment Hampers',
      subtitle: 'Everything you need in one heavy festive combo box. Saves you up to 35% compared to individual boxes.',
      badge: '🎁 Best Value Diwali Gift',
      items: [
        {
          id: 'hmp_diwali_family_box',
          name: 'Diwali Family Royal Celebration Hamper',
          slug: 'diwali-family-royal-celebration-hamper',
          price: 299900,
          salePrice: 249900,
          categoryName: 'Family Hamper',
          image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80',
          itemType: 'hamper',
          perk: 'Assorted 50 Sky Shots, Sparklers & Flower Pots',
        },
        {
          id: 'hmp_royal_sky_02',
          name: 'Royal Grand Aerial Sky Hamper',
          slug: 'royal-grand-aerial-sky-hamper',
          price: 599900,
          salePrice: 489900,
          categoryName: 'Grand Hamper',
          image: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80',
          itemType: 'hamper',
          perk: 'Showstopper aerial collection with cakes & rockets',
        },
      ],
    },
  };

  const currentTab = recommendations[activeTab];

  return (
    <section className="container mx-auto px-4">
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 border border-orange-200/80 p-6 sm:p-10 shadow-sm overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-orange-200 text-orange-900 text-xs font-black uppercase tracking-wider shadow-2xs mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Diwali Family Matchmaker</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Which Crackers Are Right For Your Celebration?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-1">
              Select your celebration style and our Diwali team will recommend the safest, most enjoyable assortment for your home.
            </p>
          </div>

          {/* Interactive Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-inner max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab('family')}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'family'
                  ? 'bg-gradient-to-r from-fire-600 to-flame-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>Kids & Grandparents</span>
            </button>

            <button
              onClick={() => setActiveTab('sky')}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'sky'
                  ? 'bg-gradient-to-r from-fire-600 to-flame-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🎆</span>
              <span>Sky Bursts & Rooftops</span>
            </button>

            <button
              onClick={() => setActiveTab('gifting')}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'gifting'
                  ? 'bg-gradient-to-r from-fire-600 to-flame-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🎁</span>
              <span>All-In-One Hampers</span>
            </button>
          </div>

          {/* Tab Description */}
          <div className="text-center space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full bg-orange-100 text-orange-900 font-extrabold text-[11px]">
              {currentTab.badge}
            </span>
            <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg">
              {currentTab.title}
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              {currentTab.subtitle}
            </p>
          </div>

          {/* Recommended Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left pt-2">
            {currentTab.items.map((item, idx) => {
              const effectivePrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
              const isAdded = addedKey === `${activeTab}_${item.id}`;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-orange-200/80 hover:border-fire-400 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-fire-600 block">
                        {item.categoryName}
                      </span>
                      <h4 className="font-heading font-black text-xs text-slate-900 line-clamp-2 leading-tight mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                        ✨ {item.perk}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-heading font-black text-sm text-slate-900">
                        {formatCurrency(effectivePrice)}
                      </span>
                      {item.salePrice && item.salePrice > 0 && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(item, `${activeTab}_${item.id}`, e)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'btn-firecracker text-white hover:scale-105'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Quick Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href={activeTab === 'gifting' ? '/hampers' : '/products'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-fire-600 hover:text-fire-700 hover:underline"
            >
              <span>Explore more choices for this celebration style</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
