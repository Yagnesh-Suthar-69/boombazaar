'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (channelFilter !== 'all') params.set('channel', channelFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, channelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900">
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Process online customer orders, update statuses, handle delivery logistics & cancellations
          </p>
        </div>

        <div className="text-xs text-slate-600">
          Total: <strong className="text-slate-900">{orders.length}</strong> orders
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search by order number, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 rounded-lg bg-fire-600 text-[11px] font-bold text-white hover:bg-fire-500"
          >
            Search
          </button>
        </form>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing / Packed</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
            <option value="Cancellation Requested">Cancellation Requested</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sales Channel */}
        <div>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-fire-500"
          >
            <option value="all">All Channels</option>
            <option value="online">Online Orders</option>
            <option value="offline">Counter Sales</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">No orders found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3.5 font-semibold">Order Number</th>
                  <th className="p-3.5 font-semibold">Date</th>
                  <th className="p-3.5 font-semibold">Customer</th>
                  <th className="p-3.5 font-semibold">Mode</th>
                  <th className="p-3.5 font-semibold">Total Amount</th>
                  <th className="p-3.5 font-semibold">Payment</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-fire-600">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div>{order.customer_name}</div>
                      <div className="text-[10px] text-slate-500">{order.customer_phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize text-slate-700 font-medium">
                        {order.delivery_type === 'delivery' ? '🚚 Delivery' : '🏬 Pickup'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.order_status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.order_status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : order.order_status === 'Cancellation Requested'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : 'bg-orange-50 text-orange-800 border border-orange-200'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="btn-sparkler px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
