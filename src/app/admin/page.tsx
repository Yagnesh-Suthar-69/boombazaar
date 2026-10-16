'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  ArrowRight,
  Flame,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-fire-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading Boom Bazaar analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const lowStock = data?.lowStockProducts || [];
  const topProducts = data?.topProducts || [];
  const recentTransactions = data?.recentTransactions || [];
  const categorySales = data?.categorySales || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-fire-600">
            Overview & Telemetry
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
            Boom Bazaar Management Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sales"
            className="btn-sparkler px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <Store className="w-4 h-4" />
            <span>Open Counter POS</span>
          </Link>

          <Link
            href="/admin/products"
            className="btn-firecracker px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-heading text-2xl font-black text-slate-900">
            {formatCurrency(metrics.totalRevenue || 0)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Today: {formatCurrency(metrics.todayRevenue || 0)}</span>
            <span className="text-orange-700 font-medium">This Month: {formatCurrency(metrics.monthRevenue || 0)}</span>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Channel Split</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-sm font-bold text-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-600" /> Online:
              </span>
              <span className="text-slate-900 font-mono">{formatCurrency(metrics.onlineRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Store className="w-3.5 h-3.5 text-amber-600" /> Counter POS:
              </span>
              <span className="text-slate-900 font-mono">{formatCurrency(metrics.offlineRevenue || 0)}</span>
            </div>
          </div>
        </div>

        {/* Orders Count & Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Orders Pipeline</span>
            <ShoppingBag className="w-4 h-4 text-fire-600" />
          </div>
          <div className="font-heading text-2xl font-black text-slate-900">
            {metrics.totalOrders || 0} Orders
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-amber-700 font-bold">{metrics.pendingOrders || 0} Pending</span>
            <span className="text-emerald-700 font-bold">{metrics.completedOrders || 0} Done</span>
            <span className="text-red-600">{metrics.cancelledOrders || 0} Cancelled</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Average Order Value</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-heading text-2xl font-black text-slate-900">
            {formatCurrency(metrics.averageOrderValue || 0)}
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Includes both online hampers & counter transactions
          </p>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStock.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low-Stock Fireworks Alert ({lowStock.length} items need restock)</span>
            </div>
            <Link href="/admin/products" className="text-xs text-amber-800 hover:text-fire-600 underline font-semibold">
              Restock in Products Tab →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {lowStock.slice(0, 4).map((p: any) => (
              <div key={p.id} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs flex justify-between items-center shadow-xs">
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-slate-900 block line-clamp-1">{p.name}</span>
                  <span className="text-[10px] text-slate-500">SKU: {p.sku}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-bold text-xs">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section: Recent Transactions & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-slate-900">Recent Transactions</h2>
            <Link href="/admin/orders" className="text-xs text-fire-600 hover:text-fire-700 font-semibold transition-colors">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-semibold">ID / Number</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Channel</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{tx.order_number}</td>
                    <td className="py-3 text-slate-700">
                      <div>{tx.customer_name}</div>
                      <div className="text-[10px] text-slate-500">{tx.customer_phone}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.channel === 'online'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {tx.channel}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-slate-900">{formatCurrency(tx.total_amount)}</td>
                    <td className="py-3">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {tx.order_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        href={tx.channel === 'online' ? `/admin/orders/${tx.id}` : '/admin/sales'}
                        className="text-xs text-fire-600 hover:text-fire-700 underline font-medium"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="font-heading font-bold text-base text-slate-900">Top Performing Fireworks</h2>

          <div className="space-y-3">
            {topProducts.map((p: any, idx: number) => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">{formatCurrency(p.price)}</span>
                  <span className="text-[10px] text-slate-500">{p.units_sold || 0} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
