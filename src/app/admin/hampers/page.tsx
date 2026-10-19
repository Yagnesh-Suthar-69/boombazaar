'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Upload,
  Video,
  X,
  Star,
  CheckCircle2,
  Film,
  Package,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface IncludedProduct {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
}

interface Hamper {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number; // in paise
  sale_price?: number | null;
  images: string[];
  video?: string | null;
  is_featured: number | boolean;
  is_active: number | boolean;
  items?: Array<{
    id: string;
    product_id: string;
    product_name: string;
    sku: string;
    price: number;
    quantity: number;
  }>;
}

export default function AdminHampersPage() {
  const [hampers, setHampers] = useState<Hamper[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHamper, setEditingHamper] = useState<Hamper | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [salePriceRupees, setSalePriceRupees] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Included Items Builder
  const [includedItems, setIncludedItems] = useState<IncludedProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');

  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, pRes] = await Promise.all([
        fetch('/api/admin/hampers'),
        fetch('/api/admin/products'),
      ]);
      const hData = await hRes.json();
      const pData = await pRes.json();
      if (hData.hampers) setHampers(hData.hampers);
      if (pData.products) setProducts(pData.products.filter((p: any) => p.is_active));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingHamper(null);
    setName('');
    setSlug('');
    setDescription('Curated celebration hamper with best-selling assorted Diwali fireworks.');
    setPriceRupees('1999');
    setSalePriceRupees('');
    setImages([]);
    setVideo('');
    setIsFeatured(true);
    setIsActive(true);

    // Default select first product if available
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setSelectedQuantity('1');
      setIncludedItems([
        {
          productId: products[0].id,
          productName: products[0].name,
          sku: products[0].sku,
          price: products[0].price,
          quantity: 2,
        },
      ]);
    } else {
      setIncludedItems([]);
    }

    setModalOpen(true);
  };

  const openEditModal = (h: Hamper) => {
    setEditingHamper(h);
    setName(h.name);
    setSlug(h.slug);
    setDescription(h.description || '');
    setPriceRupees((h.price / 100).toString());
    setSalePriceRupees(h.sale_price ? (h.sale_price / 100).toString() : '');
    setImages(Array.isArray(h.images) ? [...h.images] : []);
    setVideo(h.video || '');
    setIsFeatured(Boolean(h.is_featured));
    setIsActive(Boolean(h.is_active));

    if (h.items) {
      setIncludedItems(
        h.items.map((it) => ({
          productId: it.product_id,
          productName: it.product_name,
          sku: it.sku,
          price: it.price,
          quantity: it.quantity,
        }))
      );
    } else {
      setIncludedItems([]);
    }

    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setSelectedQuantity('1');
    }

    setModalOpen(true);
  };

  const handleAddProductToHamper = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const qty = Math.max(1, parseInt(selectedQuantity) || 1);

    setIncludedItems((prev) => {
      const existsIndex = prev.findIndex((item) => item.productId === selectedProductId);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            price: prod.price,
            quantity: qty,
          },
        ];
      }
    });
  };

  const removeIncludedItem = (productId: string) => {
    setIncludedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateIncludedItemQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeIncludedItem(productId);
      return;
    }
    setIncludedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImages((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => {
      if (index === 0 || index >= prev.length) return prev;
      const reordered = [...prev];
      const [selected] = reordered.splice(index, 1);
      reordered.unshift(selected);
      return reordered;
    });
  };

  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setVideo(base64);
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (includedItems.length === 0) {
      alert('Please add at least one firework product to the hamper.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || null,
        priceRupees: Number(priceRupees),
        salePriceRupees: salePriceRupees ? Number(salePriceRupees) : null,
        images,
        video: video.trim() || null,
        isFeatured,
        isActive,
        items: includedItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      };

      const url = editingHamper ? `/api/admin/hampers/${editingHamper.id}` : '/api/admin/hampers';
      const method = editingHamper ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save hamper');

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, hamperName: string) => {
    if (!confirm(`Are you sure you want to delete or archive hamper "${hamperName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/hampers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      alert(data.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calculate sum of individual items in hamper
  const totalItemsCombinedValue = includedItems.reduce(
    (acc, it) => acc + (it.price / 100) * it.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900">
            Diwali Gift Hampers Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Create combo boxes, select bundled fireworks, specify quantities, upload media & publish.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-firecracker px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Hamper</span>
        </button>
      </div>

      {/* Hampers Grid */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading hampers...</div>
        ) : hampers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No hampers created yet. Click &quot;Create New Hamper&quot; to build a combo box!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-bold">
                  <th className="p-3.5">Hamper</th>
                  <th className="p-3.5">Included Fireworks</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Media</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hampers.map((h) => {
                  const primaryImg = h.images && h.images[0] ? h.images[0] : null;
                  const totalProductsCount = h.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {primaryImg ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                              <Image
                                src={primaryImg}
                                alt={h.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 text-orange-600">
                              <Gift className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{h.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono">/{h.slug}</span>
                            {h.is_featured ? (
                              <span className="text-[10px] text-amber-600 font-bold block">★ Featured Hamper</span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">
                            {totalProductsCount} total cracker(s) inside
                          </span>
                          <div className="text-[11px] text-slate-500 line-clamp-2">
                            {h.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {h.sale_price ? (
                          <div>
                            <span>{formatCurrency(h.sale_price)}</span>
                            <span className="text-[10px] text-slate-400 line-through block">
                              {formatCurrency(h.price)}
                            </span>
                          </div>
                        ) : (
                          formatCurrency(h.price)
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span>{h.images?.length || 0} photo(s)</span>
                          {h.video && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[10px] flex items-center gap-1">
                              <Film className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {h.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-[10px]">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-1.5 text-slate-500 hover:text-fire-600 transition-colors"
                          title="Edit Hamper"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete / Archive Hamper"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create / Edit Hamper Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 p-6 space-y-5 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-heading font-black text-lg text-slate-900">
                {editingHamper ? 'Edit Diwali Gift Hamper' : 'Create New Diwali Gift Hamper'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs text-slate-700">
              {/* Hamper Basics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Hamper Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Family Mega Celebration Hamper"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingHamper) {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Hamper Price in Rupees (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="1999"
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-7 pr-3 text-slate-900 font-bold font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Discounted Sale Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional discounted price"
                      value={salePriceRupees}
                      onChange={(e) => setSalePriceRupees(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-7 pr-3 text-slate-900 font-bold font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Hamper Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
              </div>

              {/* Included Products Selector */}
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-900 font-bold text-sm">
                      Included Firecracker Products & Quantities
                    </label>
                    <p className="text-[11px] text-slate-600">
                      Select which crackers are packed inside this hamper and their quantities.
                    </p>
                  </div>
                  {totalItemsCombinedValue > 0 && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Combined Value:</span>
                      <span className="font-black text-slate-900 text-sm">₹{totalItemsCombinedValue.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — ₹{(p.price / 100).toFixed(0)}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(e.target.value)}
                      className="w-20 bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold font-mono text-center focus:outline-none focus:border-fire-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddProductToHamper}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Hamper</span>
                    </button>
                  </div>
                </div>

                {/* Included Products List */}
                {includedItems.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-orange-300/80 rounded-xl text-center text-slate-500">
                    No crackers added to this hamper yet. Add items above.
                  </div>
                ) : (
                  <div className="divide-y divide-orange-200 bg-white rounded-xl border border-orange-200 overflow-hidden">
                    {includedItems.map((item) => (
                      <div key={item.productId} className="p-3 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.productName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            SKU: {item.sku} • ₹{(item.price / 100).toFixed(0)} each
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateIncludedItemQty(item.productId, item.quantity - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono font-bold text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateIncludedItemQty(item.productId, item.quantity + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-slate-900 w-20 text-right">
                            ₹{((item.price / 100) * item.quantity).toFixed(0)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeIncludedItem(item.productId)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos Upload & Primary Selector */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-900 font-bold">Hamper Photos</label>
                    <p className="text-[11px] text-slate-500">
                      Upload multiple hamper photos. The first image is the primary storefront photo.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotosUpload}
                      className="hidden"
                      id="hamper-photos-input"
                    />
                    <label
                      htmlFor="hamper-photos-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-fire-600" />
                      <span>Upload Photos</span>
                    </label>
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                    No hamper photos uploaded. Click &quot;Upload Photos&quot; to add pictures.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border ${
                          idx === 0 ? 'border-2 border-fire-600 ring-2 ring-fire-100' : 'border-slate-200'
                        } bg-white group aspect-square flex items-center justify-center`}
                      >
                        <Image
                          src={img}
                          alt={`Hamper preview ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-fire-600 text-white font-black text-[9px] shadow-sm flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-white" /> Primary
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 backdrop-blur-sm flex items-center justify-between opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(idx)}
                              className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px]"
                            >
                              Set Primary
                            </button>
                          ) : (
                            <span className="text-[10px] text-white font-semibold">Primary</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="p-1 rounded bg-red-600 text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload & Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-900 font-bold">Hamper Showcase Video</label>
                    <p className="text-[11px] text-slate-500">
                      Upload an MP4 video demonstration showing the fireworks included in the hamper.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4, video/webm"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="hamper-video-input"
                    />
                    <label
                      htmlFor="hamper-video-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5 text-fire-600" />
                      <span>{video ? 'Replace Video' : 'Upload Video'}</span>
                    </label>
                  </div>
                </div>

                {video ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-48 relative">
                    <video src={video} controls className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setVideo('')}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700"
                      title="Remove Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                    No video demo uploaded yet.
                  </div>
                )}
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-fire-600 border-slate-300 focus:ring-fire-500"
                  />
                  <span>Featured on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Publish Hamper (Visible to Customers)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-firecracker px-5 py-2 rounded-xl font-bold shadow-sm text-white"
                >
                  {saving ? 'Saving...' : 'Save Hamper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
