'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Gift,
  ShoppingBag,
  Check,
  PackageCheck,
  ExternalLink,
  Volume2,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Play
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { HamperItem } from './HamperCard';

interface HamperDetailModalProps {
  hamper: HamperItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HamperDetailModal({ hamper, isOpen, onClose }: HamperDetailModalProps) {
  const { addToCart } = useCart();
  const [addedHamper, setAddedHamper] = useState(false);
  const [addedRelatedId, setAddedRelatedId] = useState<string | null>(null);

  if (!isOpen || !hamper) return null;

  const effectivePrice = hamper.sale_price && hamper.sale_price > 0 ? hamper.sale_price : hamper.price;
  const hasDiscount = hamper.sale_price && hamper.sale_price > 0 && hamper.sale_price < hamper.price;
  const discountPercent = hasDiscount
    ? Math.round(((hamper.price - hamper.sale_price!) / hamper.price) * 100)
    : 0;

  const totalItemsCount = hamper.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;
  const retailTotal = (hamper as any).retail_total || (hamper.items?.reduce((acc, it) => {
    const p = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;
    return acc + (p * it.quantity);
  }, 0) || effectivePrice);

  const totalSavings = Math.max(0, retailTotal - effectivePrice);

  const handleAddHamper = (e?: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      window.dispatchEvent(new CustomEvent('boom:sparkle', { detail: { x, y } }));
    }

    const includedSummary = hamper.items?.map((i) => `${i.quantity}x ${i.product_name}`).join(', ');

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

    setAddedHamper(true);
    setTimeout(() => setAddedHamper(false), 1600);
  };

  const handleAddRelated = (prod: any, e?: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      window.dispatchEvent(new CustomEvent('boom:sparkle', { detail: { x, y } }));
    }

    addToCart({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku || `PRD-${prod.id}`,
      price: prod.price,
      salePrice: prod.sale_price,
      image: prod.image || (prod.images && prod.images[0]),
      categoryName: 'Individual Cracker',
      stock: 50,
      itemType: 'product',
    });

    setAddedRelatedId(prod.id);
    setTimeout(() => setAddedRelatedId(null), 1600);
  };

  const mainImage =
    (hamper.images && hamper.images[0]) ||
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-amber-50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-fire-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-fire-600 block">
                Diwali Special Family Assortments
              </span>
              <h2 className="font-heading font-black text-lg text-slate-900 leading-tight">
                {hamper.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* HAMPER OVERVIEW & SUMMARY CARD */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="md:col-span-5 relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-inner">
              <Image
                src={mainImage}
                alt={hamper.name}
                fill
                unoptimized
                className="object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm">
                  Save {discountPercent}% OFF
                </div>
              )}
            </div>

            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Certified Green Crackers Combo</span>
                </div>
                <h3 className="font-heading font-black text-xl text-slate-900">
                  {hamper.name}
                </h3>
                {hamper.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hamper.description}
                  </p>
                )}
              </div>

              {/* Price & Savings Breakdown */}
              <div className="p-3.5 rounded-xl bg-white border border-orange-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Separate Items Retail Value:</span>
                  <span className="text-slate-400 line-through font-bold">{formatCurrency(retailTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Combo Hamper Price:</span>
                  <span className="font-heading text-2xl font-black text-fire-600">
                    {formatCurrency(effectivePrice)}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-emerald-700">
                    <span>Your Combo Savings:</span>
                    <span>Save {formatCurrency(totalSavings)} ({discountPercent}% Discount)</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddHamper}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-black transition-all shadow-md ${
                    addedHamper
                      ? 'bg-emerald-600 text-white'
                      : 'btn-firecracker text-white hover:scale-[1.02]'
                  }`}
                >
                  {addedHamper ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added Hamper to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Complete Hamper to Cart ({formatCurrency(effectivePrice)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 1: ALL INCLUDED PRODUCTS WITH PHOTO, PRICE & QUANTITY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-fire-600" />
                  <span>All Products Included in This Hamper ({totalItemsCount} Total Items)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect the photo, exact quantity, and individual price of each firecracker inside this box.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hamper.items && hamper.items.length > 0 ? (
                hamper.items.map((it: any, idx) => {
                  const itemPhoto = it.image || (it.product_images && it.product_images[0]) || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80';
                  const itemUnitPrice = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;
                  const itemTotalValue = itemUnitPrice * it.quantity;

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-white border border-slate-200 hover:border-orange-300 p-3.5 shadow-sm transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          <Image
                            src={itemPhoto}
                            alt={it.product_name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <span className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-slate-900/80 text-white font-black text-[9px] rounded-tl-md">
                            {it.quantity}x
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-heading font-black text-xs text-slate-900 leading-snug line-clamp-2">
                            {it.product_name}
                          </h5>

                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xs font-black text-fire-600">
                              {formatCurrency(itemUnitPrice)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">/ box</span>
                          </div>

                          <div className="mt-1 text-[11px] font-bold text-slate-600">
                            Included: <span className="text-slate-900 font-extrabold">{it.quantity} Boxes</span>
                            <span className="text-slate-400 font-normal"> ({formatCurrency(itemTotalValue)} value)</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges & Link to Product Page */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          {it.sound_level && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {it.sound_level}
                            </span>
                          )}
                          {it.altitude && (
                            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-semibold text-[10px]">
                              {it.altitude}
                            </span>
                          )}
                        </div>

                        {it.product_slug && (
                          <Link
                            href={`/products/${it.product_slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-fire-600 hover:text-fire-700 font-bold hover:underline"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-slate-500">
                  Assorted premium celebration crackers included in this box.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: MORE RELATED PRODUCTS */}
          {hamper.related_products && hamper.related_products.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>More Related Fireworks You May Like</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Complement your celebration with these popular standalone crackers.
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-bold text-fire-600 hover:text-fire-700 flex items-center gap-1 transition-colors"
                >
                  <span>See Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {hamper.related_products.slice(0, 4).map((prod: any) => {
                  const prodImage = prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80';
                  const prodPrice = prod.sale_price && prod.sale_price > 0 ? prod.sale_price : prod.price;
                  const isAdded = addedRelatedId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      className="group/prod rounded-xl bg-white border border-slate-200 hover:border-fire-400 p-2.5 shadow-sm transition-all flex flex-col justify-between space-y-2 hover:-translate-y-0.5"
                    >
                      <Link href={`/products/${prod.slug}`} className="block relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <Image
                          src={prodImage}
                          alt={prod.name}
                          fill
                          unoptimized
                          className="object-cover group-hover/prod:scale-105 transition-transform"
                        />
                      </Link>

                      <div className="space-y-1">
                        <Link href={`/products/${prod.slug}`} className="block">
                          <h6 className="font-heading font-black text-xs text-slate-900 group-hover/prod:text-fire-600 transition-colors line-clamp-1">
                            {prod.name}
                          </h6>
                        </Link>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading font-black text-xs text-slate-900">
                            {formatCurrency(prodPrice)}
                          </span>
                          {prod.sale_price && prod.sale_price > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatCurrency(prod.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddRelated(prod)}
                        className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-200'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            🚚 Free standard delivery on orders above ₹2,500
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
