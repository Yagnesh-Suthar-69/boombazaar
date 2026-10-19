'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    freeDeliveryThreshold,
    deliveryFee,
    calculatedTotal,
  } = useCart();

  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-2xl font-black text-slate-900">Your Cart is Empty</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You haven&apos;t added any fireworks yet. Check out our sparklers, sky shots, and Diwali gift boxes!
        </p>
        <Link
          href="/products"
          className="btn-firecracker px-6 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-yellow-200" />
          <span>Browse Fireworks</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
            Your Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Review your fireworks before heading to checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-500 hover:text-fire-600 transition-colors font-medium"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Delivery Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Truck className="w-4 h-4 text-orange-600" />
                {freeDeliveryRemaining === 0 ? (
                  <strong className="text-emerald-700 font-bold">🎉 Free Delivery Unlocked!</strong>
                ) : (
                  <span>
                    Add <strong className="text-fire-600">{formatCurrency(freeDeliveryRemaining)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
              <span className="text-slate-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-fire-500 via-flame-500 to-spark-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Table / List */}
          <div className="divide-y divide-slate-100 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {items.map((item) => {
              const unitPrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
              const lineTotal = unitPrice * item.quantity;

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link href={item.itemType === 'hamper' ? '/hampers' : `/products/${item.slug}`} className="hover:text-fire-600 transition-colors">
                        <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h3>
                      </Link>
                      <p className="text-[11px] text-slate-500">Code: {item.sku}</p>
                      {item.itemType === 'hamper' && item.includedProducts && (
                        <p className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 mt-0.5 line-clamp-1">
                          Combo: {item.includedProducts}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {formatCurrency(unitPrice)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <span className="font-heading font-extrabold text-sm text-slate-900 block">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-fire-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-fire-600 hover:text-fire-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm sticky top-24">
          <h2 className="font-heading font-bold text-base text-slate-900">Order Summary</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Tax (GST)</span>
              <span className="text-emerald-700 font-semibold">Included</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Total Payable</span>
              <span className="text-gradient-fire text-lg">{formatCurrency(calculatedTotal)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe Delivery</span>
            </div>
            <p className="text-emerald-700">
              Delivered safely in thick cartons. Confirmation sent directly to WhatsApp.
            </p>
          </div>

          <Link
            href="/checkout"
            className="btn-firecracker w-full py-3.5 px-6 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
