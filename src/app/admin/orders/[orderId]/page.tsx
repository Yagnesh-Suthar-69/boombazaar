'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Truck,
  Store,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [newPayment, setNewPayment] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [cancelNotes, setCancelNotes] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error('Order not found');
      const orderData = await res.json();
      setData(orderData);
      setNewStatus(orderData.order.order_status);
      setNewPayment(orderData.order.payment_status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: newPayment,
          comment: statusComment.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update order');

      setActionMessage('Order status updated successfully');
      setStatusComment('');
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancellationAction = async (action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this cancellation request?`)) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancellationAction: action,
          cancellationNotes: cancelNotes.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Action failed');

      alert(resData.message);
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading order details...
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-heading text-xl font-bold text-white">Order Not Found</h2>
        <Link href="/admin/orders" className="btn-firecracker px-4 py-2 rounded-xl text-xs font-bold inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  const { order, items, history, cancellationRequest } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {order.order_number}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-fire-700">
                {order.sales_channel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          {actionMessage}
        </div>
      )}

      {/* Pending Cancellation Review Banner if any */}
      {cancellationRequest && cancellationRequest.status === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Customer Cancellation Request Pending Review</span>
          </div>
          <p className="text-xs text-slate-700">
            <strong>Customer Reason:</strong> &ldquo;{cancellationRequest.customer_reason}&rdquo;
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              placeholder="Admin notes (optional)"
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={() => handleCancellationAction('approve')}
              disabled={isUpdating}
              className="px-4 py-1.5 rounded-xl bg-fire-600 hover:bg-fire-700 text-xs font-bold text-white shadow-sm"
            >
              Approve & Restore Stock
            </button>
            <button
              onClick={() => handleCancellationAction('reject')}
              disabled={isUpdating}
              className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              Reject Request
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Items & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items breakdown */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-sm text-slate-900">Ordered Items ({items.length})</h2>

            <div className="divide-y divide-slate-100">
              {items.map((it: any) => (
                <div key={it.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{it.product_name}</h4>
                    <span className="text-[11px] text-slate-500">
                      SKU: {it.sku} &bull; {it.quantity} units x {formatCurrency(it.unit_price)}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(it.total_price)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-200">
                <span>Order Total</span>
                <span className="text-gradient-fire text-lg">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Fulfillment Info */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Customer</span>
              <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
              <p className="text-slate-700 flex items-center gap-1.5 pt-1">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <a href={`https://wa.me/${order.customer_phone}`} target="_blank" className="hover:underline">
                  {order.customer_phone}
                </a>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Fulfillment Mode</span>
              <p className="font-bold text-slate-900 text-sm capitalize">
                {order.delivery_type === 'delivery' ? '🚚 Home Delivery' : '🏬 Counter Pickup Yard'}
              </p>
              {order.address && (
                <p className="text-slate-600 text-[11px] pt-1">{order.address}</p>
              )}
            </div>

            {order.notes && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100 text-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Notes</span>
                <p className="italic text-[11px]">&ldquo;{order.notes}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-heading font-bold text-sm text-slate-900">Status Audit Trail</h2>
            <div className="space-y-3 pl-4 border-l-2 border-slate-200 text-xs">
              {history.map((h: any, i: number) => (
                <div key={h.id || i} className="relative">
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="font-bold text-slate-900">{h.new_status}</span>
                  <span className="text-slate-500 ml-2 text-[10px]">
                    {new Date(h.created_at).toLocaleString()} ({h.changed_by || 'Admin'})
                  </span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{h.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Update Controls */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-5 sticky top-6 shadow-sm">
          <h2 className="font-heading font-bold text-sm text-slate-900">Order Control Panel</h2>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fulfillment Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing / Packed</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled (Restores Stock)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Status
              </label>
              <select
                value={newPayment}
                onChange={(e) => setNewPayment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Audit Note / Status Comment
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Dispatched via courier tracking #12345"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="btn-firecracker w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs shadow-sm disabled:opacity-50"
            >
              {isUpdating ? 'Saving Changes...' : 'Update Status & Log History'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
