'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  PhoneCall,
  Clock,
  Truck,
  Store,
  Share2,
  AlertCircle,
  Copy,
  Check,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function OrderConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderId as string;
  const tokenFromUrl = searchParams.get('token');

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Cancellation request state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Get token either from query param or session storage
  const [accessToken, setAccessToken] = useState<string>('');

  useEffect(() => {
    const token = tokenFromUrl || sessionStorage.getItem(`order_token_${orderNumber}`) || '';
    setAccessToken(token);

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrderData(data);

        // Fire festive celebratory fireworks confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF233C', '#FFB703', '#FB8500', '#F59E0B'],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) fetchOrder();
  }, [orderNumber, tokenFromUrl]);

  const handleCopyOrderNumber = () => {
    if (orderData?.order?.order_number) {
      navigator.clipboard.writeText(orderData.order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      setCancelFeedback({ success: false, message: 'Please provide a reason of at least 5 characters.' });
      return;
    }

    setIsCancelling(true);
    setCancelFeedback(null);

    try {
      const res = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: accessToken || orderData?.order?.access_token,
          reason: cancelReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request cancellation');

      setCancelFeedback({ success: true, message: data.message });
      // Reload order details to refresh status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setCancelFeedback({ success: false, message: err.message });
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-fire-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading festive order confirmation...</p>
      </div>
    );
  }

  if (!orderData?.order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">We could not locate this order number.</p>
        <Link href="/" className="btn-firecracker px-5 py-2.5 rounded-xl text-xs font-bold inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  const { order, items, history, cancellationRequest, whatsappUrl } = orderData;
  const isCancellable = ['Pending', 'Confirmed'].includes(order.order_status);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      {/* Top Celebratory Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200 p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-fire-600">
            Order Confirmed
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-black text-slate-900">
            Your Order Has Been Saved!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Your crackers are reserved in our warehouse. Please tap the green WhatsApp button below to confirm your delivery with our team.
          </p>
        </div>

        {/* Order Number Badge */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs shadow-sm">
          <span className="text-slate-500">Order ID:</span>
          <strong className="text-slate-900 font-mono text-sm">{order.order_number}</strong>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 rounded text-slate-400 hover:text-slate-900 transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* WhatsApp Call to Action (Section 5 Requirement) */}
        <div className="pt-2 max-w-md mx-auto space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md transition-transform hover:scale-102"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Send Order on WhatsApp (8128627017)</span>
          </a>
          <p className="text-[11px] text-slate-500">
            * Note: Sending the prefilled WhatsApp message alerts our packing team to verify your order immediately.
          </p>
        </div>
      </div>

      {/* Order Status & Tracking Timeline */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="font-heading font-bold text-base text-slate-900">Order Status</h2>
            <p className="text-xs text-slate-500">Track current status and fulfillment timeline</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.order_status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : order.order_status === 'Cancelled'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : order.order_status === 'Cancellation Requested'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-orange-50 text-orange-800 border border-orange-200'
              }`}
            >
              ● {order.order_status}
            </span>

            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Request Cancellation
              </button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        {history && history.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Fulfillment Audit Timeline</h3>
            <div className="space-y-3 relative pl-6 border-l-2 border-slate-200">
              {history.map((h: any, i: number) => (
                <div key={h.id || i} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{h.new_status}</span>
                    <span className="text-slate-500 ml-2 text-[11px]">
                      {new Date(h.created_at).toLocaleString()}
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{h.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Itemized Bill */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-base text-slate-900">Itemized Invoice Breakdown</h2>

        <div className="divide-y divide-slate-100">
          {items.map((item: any) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">{item.product_name}</p>
                <p className="text-[11px] text-slate-500">
                  SKU: {item.sku} &bull; Qty: {item.quantity} x {formatCurrency(item.unit_price)}
                </p>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(item.total_price)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee ({order.delivery_type})</span>
            <span>
              {order.delivery_fee === 0 ? (
                <span className="text-emerald-700 font-bold">FREE</span>
              ) : (
                <span className="font-semibold text-slate-900">{formatCurrency(order.delivery_fee)}</span>
              )}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
            <span>Total Amount</span>
            <span className="text-gradient-fire text-base">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Delivery / Customer Details */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Recipient</span>
            <strong className="text-slate-900">{order.customer_name}</strong>
            <p className="text-slate-600">{order.customer_phone}</p>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fulfillment Mode</span>
            {order.delivery_type === 'delivery' ? (
              <p className="text-slate-700">
                🚚 Delivery: {order.address || 'Address registered'}
              </p>
            ) : (
              <p className="text-orange-700 font-medium">
                🏬 Store Pickup: Boom Bazaar Central Fireworks Depot
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-slate-900">Request Order Cancellation</h3>
            <p className="text-xs text-slate-600">
              Please share the reason for cancellation. Once submitted, our team will review and approve within 1 business hour.
            </p>

            {cancelFeedback && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  cancelFeedback.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {cancelFeedback.message}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed celebration plan, ordered incorrect quantity..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-4 py-2 rounded-xl bg-fire-600 hover:bg-fire-700 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isCancelling ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-xs text-slate-400">Loading order confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
