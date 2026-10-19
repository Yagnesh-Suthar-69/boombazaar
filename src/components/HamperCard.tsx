'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gift, ShoppingBag, Check, Sparkles, Play, PackageCheck, Eye, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import HamperDetailModal from './HamperDetailModal';

export interface HamperItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  images?: string[];
  video?: string | null;
  is_featured?: number | boolean;
  retail_total?: number;
  related_products?: any[];
  items?: Array<{
    quantity: number;
    product_id: string;
    product_name: string;
    product_slug?: string;
    sku?: string;
    price: number;
    sale_price?: number | null;
    sound_level?: string;
    altitude?: string;
    image?: string;
    product_images?: string[];
  }>;
}

export default function HamperCard({ hamper }: { hamper: HamperItem }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const effectivePrice = hamper.sale_price && hamper.sale_price > 0 ? hamper.sale_price : hamper.price;
  const hasDiscount = hamper.sale_price && hamper.sale_price > 0 && hamper.sale_price < hamper.price;
  const discountPercent = hasDiscount
    ? Math.round(((hamper.price - hamper.sale_price!) / hamper.price) * 100)
    : 0;

  const totalItemsCount = hamper.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window !== 'undefined') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('boom:sparkle', {
          detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        })
      );
    }

    const includedSummary = hamper.items?.map((i) => `${i.quantity}x ${i.product_name}`).join(', ');

    // Treat each hamper as ONE cart item to prevent duplicate charges!
    addToCart({
      id: hamper.id,
      name: hamper.name,
      slug: hamper.slug,
      sku: `HMP-${hamper.slug.substring(0, 8).toUpperCase()}`,
      price: hamper.price,
      salePrice: hamper.sale_price,
      image: hamper.images && hamper.images[0] ? hamper.images[0] : undefined,
      categoryName: 'Gift Hamper',
      stock: 50,
      itemType: 'hamper',
      includedProducts: includedSummary,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const imageSrc =
    (hamper.images && hamper.images[0]) ||
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80';

  return (
    <>
      <div className="group relative rounded-2xl bg-white border-2 border-orange-200/90 hover:border-fire-500 transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
        {/* Top Media Area */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer"
        >
          <Image
            src={imageSrc}
            alt={hamper.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-fire-600 via-flame-600 to-spark-500 text-white font-black text-[11px] tracking-wide uppercase shadow-md">
              <Gift className="w-3.5 h-3.5" /> Diwali Family Combo
            </span>

            {hasDiscount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] shadow-sm">
                Save {discountPercent}% OFF
              </span>
            )}

            {hamper.video && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm">
                <Play className="w-2.5 h-2.5 fill-white" /> Video Demo
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 font-extrabold text-[11px] shadow-sm flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-fire-600" />
              <span>{totalItemsCount} Fireworks Inside</span>
            </span>
          </div>
        </div>

        {/* Hamper Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div 
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer"
            >
              <h3 className="font-heading font-black text-slate-900 text-lg leading-tight group-hover:text-fire-600 transition-colors">
                {hamper.name}
              </h3>

              {hamper.description && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {hamper.description}
                </p>
              )}
            </div>

            {/* Included Products List with Photos, Quantities & Unit Prices */}
            <div className="mt-3.5 p-3 rounded-2xl bg-orange-50/80 border border-orange-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
                  <span>📦 Products in this Hamper ({totalItemsCount} items):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[11px] font-bold text-fire-600 hover:text-fire-700 flex items-center gap-0.5"
                >
                  <span>Photos & Prices</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {hamper.items && hamper.items.length > 0 ? (
                  hamper.items.slice(0, 3).map((it, idx) => {
                    const itemThumb = it.image || (it.product_images && it.product_images[0]) || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80';
                    const unitPrice = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;

                    return (
                      <div
                        key={idx}
                        onClick={() => setIsModalOpen(true)}
                        className="p-1.5 rounded-xl bg-white border border-orange-100 hover:border-orange-300 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <Image
                              src={itemThumb}
                              alt={it.product_name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              <span className="text-fire-600 font-black mr-1">{it.quantity}x</span>
                              {it.product_name}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-black text-slate-700 flex-shrink-0">
                          {formatCurrency(unitPrice)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500">Assorted celebration crackers included</p>
                )}

                {hamper.items && hamper.items.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full text-center text-[10px] font-extrabold text-fire-700 hover:underline pt-0.5 block"
                  >
                    + {hamper.items.length - 3} more items inside this box... Click to inspect
                  </button>
                )}
              </div>
            </div>

            {/* Action to show all product photos, prices and related products */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2.5 w-full py-2 px-3 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-slate-800 hover:text-fire-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-fire-600" />
              <span>Show All Products, Photos & Related Fireworks</span>
            </button>
          </div>

          {/* Pricing and 1-Item Cart Add */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                Combo Price (1 Box)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-xl font-black text-slate-900">
                  {formatCurrency(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(hamper.price)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'btn-firecracker text-white hover:scale-105'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <HamperDetailModal
        hamper={hamper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
