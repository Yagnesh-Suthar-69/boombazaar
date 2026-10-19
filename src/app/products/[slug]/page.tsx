'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  Flame,
  Volume2,
  ShieldAlert,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  PhoneCall,
  Play,
  Camera,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import ProductCard, { ProductItem } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

function ProductDetailContent() {
  const params = useParams();
  const slug = params.slug as string;

  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'video'>('photo');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data.product);
        setSelectedImage(data.product.primary_image || (data.product.images && data.product.images[0]) || '');
        setRelated(data.related || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-fire-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading firecracker details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Fireworks Item Not Found</h2>
        <p className="text-xs text-slate-500">This product is no longer available.</p>
        <Link href="/products" className="btn-firecracker px-5 py-2.5 rounded-xl text-xs font-bold inline-block">
          See All Fireworks
        </Link>
      </div>
    );
  }

  const effectivePrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
  const hasDiscount = product.sale_price && product.sale_price > 0 && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        salePrice: product.sale_price,
        image: selectedImage,
        categoryName: product.category_name,
        stock: product.stock,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartOpen(true);
  };

  const whatsappInquiryUrl = `https://wa.me/8128627017?text=${encodeURIComponent(
    `Hello Boom Bazaar! I want to order "${product.name}" (SKU: ${product.sku}). Is it in stock?`
  )}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-fire-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fireworks List</span>
      </Link>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Media Gallery with Photo & Base64 Video Toggle */}
        <div className="space-y-4">
          {/* Media Switcher Tabs */}
          {product.video && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
              <button
                onClick={() => setActiveMediaTab('photo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMediaTab === 'photo'
                    ? 'bg-fire-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Product Photo</span>
              </button>
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMediaTab === 'video'
                    ? 'bg-gradient-to-r from-fire-600 to-flame-500 text-white shadow-sm'
                    : 'text-amber-700 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Burst Video Preview</span>
              </button>
            </div>
          )}

          {/* Media Display Box */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md">
            {activeMediaTab === 'video' && product.video ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={product.video}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-md">
                  ▶ Live Cracker Video Loop
                </span>
              </div>
            ) : (
              <>
                <Image
                  src={selectedImage || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* Photo Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img);
                    setActiveMediaTab('photo');
                  }}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === img && activeMediaTab === 'photo'
                      ? 'border-fire-500 scale-105 shadow-sm'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price & Simple English Specs */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-bold uppercase tracking-wider">
                {product.category_name || 'Fireworks'}
              </span>
              <span className="text-xs text-slate-500 font-mono">Code: {product.sku}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {product.burst_effect && (
              <p className="text-sm text-amber-700 font-medium mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Effect: {product.burst_effect}</span>
              </p>
            )}
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-baseline gap-3">
            <span className="font-heading text-3xl font-black text-slate-900">
              {formatCurrency(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold ml-auto">
              All Taxes Included
            </span>
          </div>

          {/* Simple English Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Sound Level</span>
                <strong className="text-slate-900">{product.sound_level || 'Normal'}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-orange-600" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Height in Air</span>
                <strong className="text-slate-900">{product.altitude || 'On Ground'}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-sm text-slate-900">About This Cracker</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Stock & Quantity */}
          <div className="pt-2 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> In Stock ({product.stock} boxes ready to ship)
                  </span>
                ) : (
                  <span className="text-fire-600 font-semibold">Currently Out of Stock</span>
                )}
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-900 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  product.stock <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'btn-firecracker text-white shadow-md'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-2xl font-heading font-bold text-xs btn-sparkler flex items-center justify-center gap-2"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* WhatsApp Quick Link */}
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Ask on WhatsApp (8128627017)</span>
            </a>
          </div>

          {/* Simple Safety Instructions */}
          {product.safety_instructions && (
            <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>How to Use Safely</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">{product.safety_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
            More Fireworks You May Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-xs text-slate-400">Loading product...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
