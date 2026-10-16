'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Check, Sparkles, Volume2, Flame, Play } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  sound_level?: string;
  altitude?: string;
  burst_effect?: string;
  images?: string[];
  primary_image?: string;
  video?: string | null;
  category_name?: string;
  is_featured?: number | boolean;
}

export default function ProductCard({ product }: { product: ProductItem }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const effectivePrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
  const hasDiscount = product.sale_price && product.sale_price > 0 && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;

    if (typeof window !== 'undefined') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('boom:sparkle', {
          detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        })
      );
    }

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      salePrice: product.sale_price,
      image: product.primary_image || (product.images && product.images[0]),
      categoryName: product.category_name,
      stock: product.stock,
      itemType: 'product',
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const imageSrc =
    product.primary_image ||
    (product.images && product.images[0]) ||
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-fire-400 transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
      {/* Top Image Box */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.is_featured ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-fire-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3 h-3 text-yellow-300" /> Bestseller
            </span>
          ) : null}

          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] shadow-sm">
              {discountPercent}% OFF
            </span>
          )}

          {/* Video Available Badge */}
          {product.video && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] shadow-sm">
              <Play className="w-2.5 h-2.5 fill-white" /> Video Demo
            </span>
          )}
        </div>

        {/* Sound / Height Badges */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium z-10">
          {product.sound_level && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 shadow-sm font-semibold">
              <Volume2 className="w-3 h-3 text-amber-600" />
              <span>{product.sound_level}</span>
            </span>
          )}
          {product.altitude && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 shadow-sm font-semibold">
              <Flame className="w-3 h-3 text-orange-600" />
              <span>{product.altitude}</span>
            </span>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category_name && (
            <p className="text-[10px] uppercase tracking-wider text-fire-600 font-bold mb-1">
              {product.category_name}
            </p>
          )}

          <Link href={`/products/${product.slug}`} className="hover:text-fire-600 transition-colors">
            <h3 className="font-heading font-black text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {product.burst_effect && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
              ✨ {product.burst_effect}
            </p>
          )}
        </div>

        {/* Price and Add Button */}
        <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-black text-slate-900">
                {formatCurrency(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold block">
              {product.stock > 0 ? (
                product.stock <= 10 ? (
                  <span className="text-amber-600 font-bold">⚡ Only {product.stock} left</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">● In Stock</span>
                )
              ) : (
                <span className="text-red-600 font-bold">Sold Out</span>
              )}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'btn-firecracker text-white'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
