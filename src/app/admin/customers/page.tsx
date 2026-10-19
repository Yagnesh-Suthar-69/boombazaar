'use client';

import React, { useEffect, useState } from 'react';
import { Users, PhoneCall, ShoppingBag, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/admin/customers');
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900">
            Customer Directory & LTV
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Registered buyers, order frequencies, lifetime spend & WhatsApp links
          </p>
        </div>

        <div className="text-xs text-slate-600">
          Total: <strong className="text-slate-900">{customers.length}</strong> buyers
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading buyers...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">No customer records found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3.5 font-semibold">Customer Name</th>
                  <th className="p-3.5 font-semibold">Mobile Number</th>
                  <th className="p-3.5 font-semibold">Delivery Address</th>
                  <th className="p-3.5 font-semibold">Total Orders</th>
                  <th className="p-3.5 font-semibold">Lifetime Spend</th>
                  <th className="p-3.5 font-semibold">WhatsApp Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3.5 font-mono text-slate-700">{c.phone}</td>
                    <td className="p-3.5 text-slate-600 line-clamp-1 max-w-xs">{c.address || 'In-store pickup'}</td>
                    <td className="p-3.5 font-bold text-slate-900">{c.total_orders} orders</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{formatCurrency(c.lifetime_spend)}</td>
                    <td className="p-3.5">
                      <a
                        href={`https://wa.me/${c.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat</span>
                      </a>
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
