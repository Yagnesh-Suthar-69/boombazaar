'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Store,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, calculatedTotal, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
        <h1 className="font-heading text-2xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-xs text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="btn-firecracker px-5 py-2.5 rounded-xl text-xs font-bold inline-block">
          See Fireworks
        </Link>
      </div>
    );
  }

  const effectiveDeliveryFee = deliveryType === 'delivery' ? deliveryFee : 0;
  const grandTotal = subtotal + effectiveDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMessage('Please enter your 10-digit mobile number for WhatsApp delivery confirmation.');
      return;
    }

    if (deliveryType === 'delivery' && (!address.trim() || address.trim().length < 10)) {
      setErrorMessage('Please enter your full address (street, city, pincode) for delivery.');
      return;
    }

    if (!ageConfirmed) {
      setErrorMessage('You must confirm you are at least 18 years old to buy fireworks.');
      return;
    }

    if (!safetyAcknowledged) {
      setErrorMessage('Please agree to follow fireworks safety rules.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        address: deliveryType === 'delivery' ? address.trim() : null,
        notes: notes.trim() || null,
        ageConfirmed: true,
        safetyAcknowledged: true,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          itemType: i.itemType || 'product',
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      sessionStorage.setItem(`order_token_${data.order.orderNumber}`, data.order.accessToken);
      router.push(`/order/${data.order.orderNumber}?token=${data.order.accessToken}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while placing order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-heading text-3xl font-black text-slate-900">
          Complete Your Order
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Enter your details and place your order. You can confirm via WhatsApp right after.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Please check:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Mode */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-sm text-slate-900">
              1. Choose Delivery or Store Pickup
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-orange-50/60 border-orange-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={deliveryType === 'delivery'}
                  onChange={() => setDeliveryType('delivery')}
                  className="mt-1 text-fire-600 focus:ring-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span>Home Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Safe delivery in strong cartons right to your home address.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-amber-50/60 border-amber-500 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={deliveryType === 'pickup'}
                  onChange={() => setDeliveryType('pickup')}
                  className="mt-1 text-amber-600 focus:ring-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Store Self-Pickup</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pick up your box directly from our fireworks yard. Free.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Customer Info */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-sm text-slate-900">
              2. Your Name and Phone Number
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Full Name <span className="text-fire-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number (WhatsApp) <span className="text-fire-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
                />
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Home Delivery Address <span className="text-fire-600">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="House number, Street, Landmark, Area, City, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required={deliveryType === 'delivery'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please call before arriving"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
              />
            </div>
          </div>

          {/* 3. Safety Agreement */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>3. Age & Safety Agreement</span>
            </h2>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  required
                  className="mt-0.5 rounded bg-slate-100 border-slate-300 text-fire-600 focus:ring-0"
                />
                <span>
                  I confirm that I am <strong>18 years of age or older</strong>.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyAcknowledged}
                  onChange={(e) => setSafetyAcknowledged(e.target.checked)}
                  required
                  className="mt-0.5 rounded bg-slate-100 border-slate-300 text-fire-600 focus:ring-0"
                />
                <span>
                  I agree to light fireworks in open outdoor spaces and supervise children at all times.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 sticky top-24 shadow-sm">
          <h2 className="font-heading font-bold text-base text-slate-900">Review Order</h2>

          {/* Items Preview */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1 border-b border-slate-100 pb-3">
            {items.map((item) => {
              const unitPrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
              return (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    <span className="text-[10px] text-slate-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {formatCurrency(unitPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>
                {effectiveDeliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">{formatCurrency(effectiveDeliveryFee)}</span>
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Final Total</span>
              <span className="text-gradient-fire text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
            <p className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Confirmation
            </p>
            <p className="text-emerald-700">
              Your order is recorded directly in our warehouse system. On the next screen, you can send the receipt directly to our WhatsApp number (<strong>8128627017</strong>).
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-firecracker w-full py-3.5 px-6 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Order...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span>Place Order & Open WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
