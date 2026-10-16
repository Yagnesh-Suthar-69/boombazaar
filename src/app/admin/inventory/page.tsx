'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, Plus, AlertTriangle, ArrowUpDown, History, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Restock / Adjust Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'restock' | 'adjustment' | 'damaged' | 'writeoff'>('restock');
  const [quantity, setQuantity] = useState('20');
  const [reason, setReason] = useState('New shipment delivery received');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.movements) setMovements(data.movements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAdjust = (prod: any) => {
    setSelectedProduct(prod);
    setQuantity('25');
    setAdjustmentType('restock');
    setReason('Shipment replenishment from Sivakasi factory');
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      const qtyNum = Number(quantity);
      const effectiveQty = adjustmentType === 'damaged' || adjustmentType === 'writeoff'
        ? -Math.abs(qtyNum)
        : qtyNum;

      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          adjustmentType,
          quantity: effectiveQty,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Adjustment failed');

      setModalOpen(false);
      loadInventory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border/70 pb-4 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-white">
            Inventory & Stock Movements
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time warehouse stock levels, execute restocks & audit movement logs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Products Stock Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-brand-surface border border-brand-border overflow-hidden p-5 space-y-4">
          <h2 className="font-heading font-bold text-sm text-white">Current Warehouse Stock</h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading stock levels...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-slate-400">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 font-semibold">Stock</th>
                    <th className="pb-3 font-semibold">Threshold</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {products.map((p) => {
                    const isLow = p.stock <= p.low_stock_threshold;
                    return (
                      <tr key={p.id} className="hover:bg-brand-dark/40">
                        <td className="py-3 font-bold text-white line-clamp-1">{p.name}</td>
                        <td className="py-3 font-mono text-spark-400 font-semibold">{p.sku}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              p.stock <= 0
                                ? 'bg-fire-600/20 text-fire-400 border border-fire-500/30'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">{p.low_stock_threshold}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => openAdjust(p)}
                            className="btn-sparkler px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adjust / Restock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Movements Log (1 col) */}
        <div className="rounded-2xl bg-brand-surface border border-brand-border p-5 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-spark-400" />
            <h2 className="font-heading font-bold text-sm text-white">Movement Audit Log</h2>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {movements.map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-brand-dark border border-brand-border text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white line-clamp-1">{m.product_name || m.product_id}</span>
                  <span
                    className={`font-mono font-bold ${
                      m.quantity > 0 ? 'text-emerald-400' : 'text-fire-400'
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic">&ldquo;{m.reason}&rdquo;</p>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-brand-border/40">
                  <span className="capitalize">{m.movement_type}</span>
                  <span>{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-brand-smoke border border-brand-border p-6 space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-white">
              Inventory Adjustment: {selectedProduct.name}
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e: any) => setAdjustmentType(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl p-2 text-white"
                >
                  <option value="restock">Restock (+ Addition)</option>
                  <option value="adjustment">Count Adjustment (+/-)</option>
                  <option value="damaged">Damaged Goods (- Deduction)</option>
                  <option value="writeoff">Write-off / Expired (- Deduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factory stock delivery invoice #104"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-firecracker px-5 py-2 rounded-xl font-bold shadow-glow-fire"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
