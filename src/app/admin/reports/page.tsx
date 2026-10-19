'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Download, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/admin/analytics');
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportOrdersCSV = async () => {
    try {
      const res = await fetch('/api/admin/orders?limit=1000');
      const json = await res.json();
      const orders = json.orders || [];

      const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Mode', 'Channel', 'Subtotal', 'Delivery Fee', 'Total Amount', 'Status', 'Payment'];
      const rows = orders.map((o: any) => [
        o.order_number,
        o.created_at,
        `"${o.customer_name}"`,
        o.customer_phone,
        o.delivery_type,
        o.sales_channel,
        o.subtotal / 100,
        o.delivery_fee / 100,
        o.total_amount / 100,
        o.order_status,
        o.payment_status,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BoomBazaar_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export orders CSV');
    }
  };

  const exportSalesCSV = async () => {
    try {
      const res = await fetch('/api/admin/pos/sales?limit=1000');
      const json = await res.json();
      const sales = json.sales || [];

      const headers = ['Invoice Number', 'Date', 'Customer', 'Phone', 'Payment Method', 'Subtotal', 'Discount', 'Total Amount', 'Status'];
      const rows = sales.map((s: any) => [
        s.invoice_number,
        s.created_at,
        `"${s.customer_name}"`,
        s.customer_phone || '',
        s.payment_method,
        s.subtotal / 100,
        s.discount_amount / 100,
        s.total_amount / 100,
        s.status,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BoomBazaar_Counter_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export sales CSV');
    }
  };

  const metrics = data?.metrics || {};
  const categorySales = data?.categorySales || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Audit gross revenue, net revenue, channel distributions & export CSV audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportOrdersCSV}
            className="btn-sparkler px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={exportSalesCSV}
            className="btn-firecracker px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export POS Sales CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-500 font-semibold block">Combined Net Revenue</span>
          <div className="font-heading text-2xl font-black text-slate-900">
            {formatCurrency(metrics.totalRevenue || 0)}
          </div>
          <p className="text-slate-500 text-[11px]">Excludes cancelled and refunded transactions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-500 font-semibold block">Online Storefront Share</span>
          <div className="font-heading text-2xl font-black text-orange-600">
            {formatCurrency(metrics.onlineRevenue || 0)}
          </div>
          <p className="text-slate-500 text-[11px]">{metrics.totalOrders || 0} online web orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-slate-500 font-semibold block">Counter POS Share</span>
          <div className="font-heading text-2xl font-black text-amber-700">
            {formatCurrency(metrics.offlineRevenue || 0)}
          </div>
          <p className="text-slate-500 text-[11px]">{metrics.totalCounterSales || 0} counter sales</p>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-base text-slate-900">Revenue by Fireworks Category</h2>

        <div className="space-y-3">
          {categorySales.map((cat: any) => {
            const revPercent = metrics.totalRevenue > 0
              ? Math.min(100, Math.round((cat.revenue / metrics.totalRevenue) * 100))
              : 0;

            return (
              <div key={cat.category_name} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{cat.category_name}</span>
                  <span className="text-orange-700 font-bold">
                    {formatCurrency(cat.revenue)} ({cat.units} units sold)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-fire-600 via-orange-500 to-amber-500 h-2 rounded-full"
                    style={{ width: `${revPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
