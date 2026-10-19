'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Store,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Printer,
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface POSItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock: number;
}

interface CartItem extends POSItem {
  quantity: number;
}

export default function AdminPOSPage() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');

  // Terminal state
  const [catalog, setCatalog] = useState<POSItem[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountRupees, setDiscountRupees] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  // Completed receipt modal
  const [completedSale, setCompletedSale] = useState<any>(null);

  // History state
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returningSaleId, setReturningSaleId] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.products) setCatalog(data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/admin/pos/sales');
      const data = await res.json();
      if (data.sales) setSalesHistory(data.sales);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const addToCart = (product: POSItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const clamped = Math.min(qty, i.stock);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const filteredCatalog = catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => {
    const price = item.sale_price && item.sale_price > 0 ? item.sale_price : item.price;
    return sum + price * item.quantity;
  }, 0);

  const discountPaise = Math.min(subtotal, Math.max(0, Math.floor(Number(discountRupees || 0) * 100)));
  const total = Math.max(0, subtotal - discountPaise);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      const payload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || null,
        paymentMethod,
        discountAmount: discountPaise,
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      };

      const res = await fetch('/api/admin/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete sale');

      // Trigger celebratory confetti
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

      setCompletedSale(data.sale);
      setCart([]);
      setDiscountRupees('0');
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      loadProducts(); // refresh inventory counts
    } catch (err: any) {
      setFeedback({ error: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessReturn = async (saleId: string) => {
    try {
      const res = await fetch('/api/admin/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, reason: returnReason || 'Counter customer return' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Return failed');

      setReturningSaleId(null);
      setReturnReason('');
      loadHistory();
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-600" />
            <h1 className="font-heading text-2xl font-black text-slate-900">
              Boom Bazaar Counter POS
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Offline counter sales, barcode SKU scanning, cash/UPI receipt generation
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'terminal'
                ? 'bg-fire-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Terminal
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales History & Returns
          </button>
        </div>
      </div>

      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Catalog / SKU Scanner (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Scan SKU barcode or search cracker name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredCatalog.map((product) => {
                const effPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
                const isOutOfStock = product.stock <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isOutOfStock
                        ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-fire-500 hover:-translate-y-0.5 shadow-xs'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-fire-600 font-bold block">{product.sku}</span>
                      <h4 className="font-heading font-bold text-xs text-slate-900 line-clamp-2 mt-0.5">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{formatCurrency(effPrice)}</span>
                      <span className={`text-[10px] font-semibold ${product.stock <= 5 ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active POS Ticket (1 col) */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-heading font-bold text-sm text-slate-900">Current Ticket</h2>
              <button
                onClick={() => setCart([])}
                className="text-xs text-slate-500 hover:text-fire-600 transition-colors font-medium"
              >
                Clear
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Ticket empty. Scan SKU or tap fireworks to add.
                </div>
              ) : (
                cart.map((item) => {
                  const effPrice = item.sale_price && item.sale_price > 0 ? item.sale_price : item.price;
                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {formatCurrency(effPrice)} &bull; Max: {item.stock}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 w-16 text-right">
                        {formatCurrency(effPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Customer Details Form */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <input
                type="text"
                placeholder="Customer Name (e.g. Walk-in)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
              />
              <input
                type="tel"
                placeholder="Phone (Optional for digital receipt)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">Tender Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span>Card</span>
                </button>
              </div>
            </div>

            {/* Calculations & Discount */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(e.target.value)}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-right text-xs text-slate-900 focus:outline-none focus:border-fire-500"
                />
              </div>

              <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-200">
                <span>Final Tender</span>
                <span className="text-gradient-fire text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            {feedback?.error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                {feedback.error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              className="btn-firecracker w-full py-3 px-4 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{isProcessing ? 'Processing Sale...' : 'Complete POS Sale & Print Bill'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* History & Returns Tab */
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="font-heading font-bold text-base text-slate-900">Historical Counter Sales & Refunds</h2>

          {historyLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading sales records...</div>
          ) : salesHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No counter sales recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="p-3 font-semibold">Invoice #</th>
                    <th className="p-3 font-semibold">Date & Time</th>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">Tender</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesHistory.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{s.invoice_number}</td>
                      <td className="p-3 text-slate-500">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="p-3 text-slate-700">{s.customer_name}</td>
                      <td className="p-3 uppercase font-semibold text-fire-700">{s.payment_method}</td>
                      <td className="p-3 font-bold text-slate-900">{formatCurrency(s.total_amount)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {s.status === 'completed' ? (
                          <button
                            onClick={() => setReturningSaleId(s.id)}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Return / Refund
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Return Confirmation Modal */}
      {returningSaleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base text-slate-900">Process Counter Sale Return</h3>
            <p className="text-xs text-slate-600">
              Confirm return of goods and refund to customer. This will atomically restore inventory for all sale items.
            </p>

            <textarea
              rows={2}
              placeholder="Reason for return (e.g. Unopened box returned, customer refund)"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-500"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReturningSaleId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessReturn(returningSaleId)}
                className="px-4 py-2 rounded-xl bg-fire-600 hover:bg-fire-700 text-xs font-bold text-white shadow-sm"
              >
                Confirm Return & Restore Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white text-slate-900 p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="text-center space-y-1 border-b pb-3">
              <h3 className="font-black text-base uppercase">BOOM BAZAAR FIREWORKS</h3>
              <p className="text-[10px] text-slate-600">Central Fireworks Yard, Main Depot</p>
              <p className="text-[10px] text-slate-600">WhatsApp: +91 8128627017</p>
              <p className="text-[10px] font-bold text-slate-800">TAX INVOICE / CASH MEMO</p>
            </div>

            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <strong>{completedSale.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(completedSale.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{completedSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Tender Mode:</span>
                <span className="uppercase font-bold">{completedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-b py-2 space-y-1.5">
              {completedSale.items.map((it: any, i: number) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span>
                    {it.productName} x{it.quantity}
                  </span>
                  <strong>{formatCurrency(it.totalPrice)}</strong>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right text-[11px]">
              <div>Subtotal: {formatCurrency(completedSale.subtotal)}</div>
              {completedSale.discountAmount > 0 && (
                <div className="text-red-600">Discount: -{formatCurrency(completedSale.discountAmount)}</div>
              )}
              <div className="text-sm font-black border-t pt-1">
                TOTAL: {formatCurrency(completedSale.totalAmount)}
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 border-t">
              Thank you for celebrating with Boom Bazaar!
              <br />
              Happy & Safe Diwali!
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
