'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Gift,
  ShoppingBag,
  Check,
  PackageCheck,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  PhoneCall,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { HamperItem } from '@/components/HamperCard';

export default function HamperDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [hamper, setHamper] = useState<HamperItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [addedRelatedId, setAddedRelatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/hampers/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Hamper not found');
        return res.json();
      })
      .then((data) => {
        if (data.hamper) setHamper(data.hamper);
        else setError('Hamper not found');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-xs text-slate-500 font-medium">
        Loading festive hamper details...
      </div>
    );
  }

  if (error || !hamper) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Hamper Not Found</h2>
        <p className="text-xs text-slate-500">The requested celebration assortment does not exist or has been archived.</p>
        <Link
          href="/hampers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fire-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Hampers</span>
        </Link>
      </div>
    );
  }

  const effectivePrice = hamper.sale_price && hamper.sale_price > 0 ? hamper.sale_price : hamper.price;
  const hasDiscount = hamper.sale_price && hamper.sale_price > 0 && hamper.sale_price < hamper.price;
  const discountPercent = hasDiscount
    ? Math.round(((hamper.price - hamper.sale_price!) / hamper.price) * 100)
    : 0;

  const totalItemsCount = hamper.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;
  const retailTotal = hamper.retail_total || (hamper.items?.reduce((acc, it) => {
    const p = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;
    return acc + (p * it.quantity);
  }, 0) || effectivePrice);

  const totalSavings = Math.max(0, retailTotal - effectivePrice);

  const handleAddHamper = () => {
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

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleAddRelated = (prod: any) => {
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
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/hampers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-fire-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Assortments</span>
        </Link>
        <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-200">
          💥 Free Home Delivery on ₹2,500+
        </span>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            <Image
              src={mainImage}
              alt={hamper.name}
              fill
              unoptimized
              className="object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                Save {discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-fire-50 border border-fire-200 text-fire-700 text-xs font-black uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              <span>Diwali Special Family Assortments</span>
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 leading-tight">
              {hamper.name}
            </h1>

            {hamper.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {hamper.description}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-fire-600" />
                <span>{totalItemsCount} Total Fireworks Inside</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Certified Green Crackers</span>
              </span>
            </div>
          </div>

          {/* Pricing & Savings Box */}
          <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Individual Items Retail Total:</span>
              <span className="line-through font-bold text-slate-400">{formatCurrency(retailTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Combo Box Offer Price:</span>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-black text-slate-900">
                  {formatCurrency(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(hamper.price)}
                  </span>
                )}
              </div>
            </div>

            {totalSavings > 0 && (
              <div className="pt-2 border-t border-orange-200/80 flex items-center justify-between text-xs font-black text-emerald-700">
                <span>Total Guaranteed Savings:</span>
                <span>Save {formatCurrency(totalSavings)} ({discountPercent}% OFF)</span>
              </div>
            )}

            <button
              onClick={handleAddHamper}
              className={`w-full py-3.5 px-6 rounded-xl font-heading font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'btn-firecracker text-white hover:scale-[1.02]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Cart as 1 Item!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add Hamper to Cart ({formatCurrency(effectivePrice)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ALL INCLUDED PRODUCTS IN THIS HAMPER */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-black uppercase tracking-wider mb-1">
            <PackageCheck className="w-3.5 h-3.5 text-fire-600" /> Box Contents
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
            All Products Included in This Hamper ({totalItemsCount} Total Items)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed breakdown of individual firecrackers, their photos, quantities, and individual store prices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hamper.items && hamper.items.length > 0 ? (
            hamper.items.map((it: any, idx) => {
              const itemPhoto = it.image || (it.product_images && it.product_images[0]) || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80';
              const itemUnitPrice = it.sale_price && it.sale_price > 0 ? it.sale_price : it.price;
              const itemTotalValue = itemUnitPrice * it.quantity;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200 hover:border-orange-300 p-4 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <Image
                        src={itemPhoto}
                        alt={it.product_name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute bottom-0 right-0 px-2 py-0.5 bg-slate-900/80 text-white font-black text-[10px] rounded-tl-md">
                        {it.quantity}x
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-heading font-black text-sm text-slate-900 leading-snug line-clamp-2">
                        {it.product_name}
                      </h4>

                      <div className="flex items-baseline gap-1 text-xs">
                        <span className="font-black text-fire-600">{formatCurrency(itemUnitPrice)}</span>
                        <span className="text-slate-500 text-[10px]">/ box</span>
                      </div>

                      <div className="text-[11px] font-bold text-slate-600">
                        In this hamper: <span className="text-slate-900 font-extrabold">{it.quantity} Boxes</span>
                        <span className="text-slate-400 font-normal"> ({formatCurrency(itemTotalValue)} value)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
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
                        className="inline-flex items-center gap-1 text-fire-600 hover:text-fire-700 font-bold hover:underline"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-slate-500">
              Assorted celebration crackers included in this box.
            </div>
          )}
        </div>
      </section>

      {/* MORE RELATED PRODUCTS SECTION */}
      {hamper.related_products && hamper.related_products.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> More Crackers
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                More Related Fireworks You May Like
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Popular standalone crackers and novelties to complement your Diwali celebration.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-fire-600 hover:text-fire-700 flex items-center gap-1 transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {hamper.related_products.map((prod: any) => {
              const prodImage = prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80';
              const prodPrice = prod.sale_price && prod.sale_price > 0 ? prod.sale_price : prod.price;
              const isAdded = addedRelatedId === prod.id;

              return (
                <div
                  key={prod.id}
                  className="group/prod rounded-2xl bg-white border border-slate-200 hover:border-fire-400 p-3 shadow-sm transition-all flex flex-col justify-between space-y-2 hover:-translate-y-1"
                >
                  <Link href={`/products/${prod.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <Image
                      src={prodImage}
                      alt={prod.name}
                      fill
                      unoptimized
                      className="object-cover group-hover/prod:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="space-y-1">
                    <Link href={`/products/${prod.slug}`} className="block">
                      <h5 className="font-heading font-black text-xs text-slate-900 group-hover/prod:text-fire-600 transition-colors line-clamp-1">
                        {prod.name}
                      </h5>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading font-black text-sm text-slate-900">
                        {formatCurrency(prodPrice)}
                      </span>
                      {prod.sale_price && prod.sale_price > 0 && (
                        <span className="text-[11px] text-slate-400 line-through">
                          {formatCurrency(prod.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddRelated(prod)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-200'
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
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
