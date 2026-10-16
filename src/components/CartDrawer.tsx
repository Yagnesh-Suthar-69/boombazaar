'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
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
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-fire-600" />
              <h2 className="font-heading text-lg font-black text-slate-900">Your Shopping Cart</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Indicator */}
          <div className="bg-orange-50/70 p-3.5 border-b border-orange-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Truck className="w-4 h-4 text-fire-600" />
                {freeDeliveryRemaining === 0 ? (
                  <span className="text-emerald-700 font-bold">🎉 Free Delivery Unlocked!</span>
                ) : (
                  <span>
                    Add <strong className="text-fire-600 font-bold">{formatCurrency(freeDeliveryRemaining)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
              <span className="text-slate-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-orange-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-fire-600 via-flame-500 to-spark-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Add fireworks, sparklers, sky shots, and combo gift hampers to your cart!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-firecracker px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
                >
                  Browse Fireworks
                </button>
              </div>
            ) : (
              items.map((item) => {
                const unitPrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
                const isHamper = item.itemType === 'hamper';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl bg-white border ${
                      isHamper ? 'border-orange-300 bg-orange-50/20' : 'border-slate-200'
                    } flex gap-3 group hover:border-fire-400 transition-all shadow-sm`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            {isHamper && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-fire-700 bg-fire-50 px-1.5 py-0.2 rounded border border-fire-200 mb-0.5">
                                <Gift className="w-2.5 h-2.5" /> Combo Box
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">Code: {item.sku}</p>
                        {item.includedProducts && (
                          <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                            Includes: {item.includedProducts}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-black text-slate-900">
                          {formatCurrency(unitPrice * item.quantity)}
                        </span>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-5 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Calculations */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Home Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-fire-600 text-base">{formatCurrency(calculatedTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Safe packing with instant WhatsApp receipt!</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Clear
                </button>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 btn-firecracker py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white shadow-sm"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
