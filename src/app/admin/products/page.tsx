'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Video,
  X,
  Star,
  CheckCircle2,
  Film,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  low_stock_threshold: number;
  sound_level: string;
  altitude: string;
  burst_effect?: string;
  safety_instructions?: string;
  images: string[];
  video?: string | null;
  is_featured: number | boolean;
  is_active: number | boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    sku: '',
    priceRupees: '',
    salePriceRupees: '',
    stock: '25',
    lowStockThreshold: '10',
    soundLevel: 'Medium',
    altitude: 'Ground',
    burstEffect: '',
    safetyInstructions: '',
    images: [] as string[],
    video: '' as string,
    isFeatured: false,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      if (pData.products) setProducts(pData.products);
      if (cData.categories) setCategories(cData.categories);
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
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      priceRupees: '250',
      salePriceRupees: '',
      stock: '50',
      lowStockThreshold: '10',
      soundLevel: 'Medium',
      altitude: 'Ground',
      burstEffect: 'Golden glitter sparkles',
      safetyInstructions: 'Outdoor use only. Maintain 15m safe distance.',
      images: [],
      video: '',
      isFeatured: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      categoryId: p.category_id,
      sku: p.sku,
      priceRupees: (p.price / 100).toString(),
      salePriceRupees: p.sale_price ? (p.sale_price / 100).toString() : '',
      stock: p.stock.toString(),
      lowStockThreshold: p.low_stock_threshold.toString(),
      soundLevel: p.sound_level || 'Medium',
      altitude: p.altitude || 'Ground',
      burstEffect: p.burst_effect || '',
      safetyInstructions: p.safety_instructions || '',
      images: Array.isArray(p.images) ? [...p.images] : [],
      video: p.video || '',
      isFeatured: Boolean(p.is_featured),
      isActive: Boolean(p.is_active),
    });
    setModalOpen(true);
  };

  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64],
        }));
      };
      reader.readAsDataURL(file);
    });

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const setPrimaryImage = (index: number) => {
    setFormData((prev) => {
      if (index === 0 || index >= prev.images.length) return prev;
      const reordered = [...prev.images];
      const [selected] = reordered.splice(index, 1);
      reordered.unshift(selected);
      return { ...prev, images: reordered };
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Video file size should be under 15MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, video: base64 }));
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeVideo = () => {
    setFormData((prev) => ({ ...prev, video: '' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        categoryId: formData.categoryId,
        sku: formData.sku.trim().toUpperCase(),
        price: Math.round(Number(formData.priceRupees) * 100),
        salePrice: formData.salePriceRupees ? Math.round(Number(formData.salePriceRupees) * 100) : null,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        soundLevel: formData.soundLevel,
        altitude: formData.altitude,
        burstEffect: formData.burstEffect.trim() || null,
        safetyInstructions: formData.safetyInstructions.trim() || null,
        images: formData.images,
        video: formData.video.trim() || null,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save product');

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or archive "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      alert(data.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900">
            Product Catalogue Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Upload multiple photos, video burst demos, manage primary images, prices & inventory.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-firecracker px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Firework</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search products by title or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-600"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading fireworks catalogue...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 font-bold">
                  <th className="p-3.5">Firework</th>
                  <th className="p-3.5">Media</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Featured</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.low_stock_threshold;
                  const primaryImg = p.images && p.images[0] ? p.images[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {primaryImg ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                              <Image
                                src={primaryImg}
                                alt={p.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                            <span className="text-[10px] text-slate-500">/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span>{p.images?.length || 0} photo(s)</span>
                          {p.video && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[10px] flex items-center gap-1">
                              <Film className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700">{p.category_name || 'Fireworks'}</td>
                      <td className="p-3.5 font-mono text-fire-700 font-semibold">{p.sku}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.sale_price ? (
                          <div>
                            <span>{formatCurrency(p.sale_price)}</span>
                            <span className="text-[10px] text-slate-400 line-through block">
                              {formatCurrency(p.price)}
                            </span>
                          </div>
                        ) : (
                          formatCurrency(p.price)
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            p.stock <= 0
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3.5">
                        {p.is_featured ? (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-slate-400">Regular</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {p.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-[10px]">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-fire-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete / Archive Product"
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

      {/* Add / Edit Product Modal with Multi-Media & Primary Image Setting */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 p-6 space-y-5 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-heading font-black text-lg text-slate-900">
                {editingProduct ? 'Edit Fireworks Product' : 'Add New Fireworks Product'}
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
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono uppercase focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.priceRupees}
                    onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Sale Discounted Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional sale price"
                    value={formData.salePriceRupees}
                    onChange={(e) => setFormData({ ...formData, salePriceRupees: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Current Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Low Stock Warning Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Sound Decibel Level</label>
                  <select
                    value={formData.soundLevel}
                    onChange={(e) => setFormData({ ...formData, soundLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                  >
                    <option value="Mild">Low & Gentle (Mild)</option>
                    <option value="Medium">Normal Pop (Medium)</option>
                    <option value="High">Loud Thunder (High)</option>
                    <option value="Extreme Thunder">Extreme Thunder (1000-Wala)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Burst Altitude</label>
                  <select
                    value={formData.altitude}
                    onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                  >
                    <option value="Ground">Ground Level (Chakkars/Pots)</option>
                    <option value="Handheld">Handheld (Sparklers)</option>
                    <option value="15ft Fountain">15ft Fountain (Anar)</option>
                    <option value="50ft">50ft Low Aerial</option>
                    <option value="150ft">150ft Sky Rocket</option>
                    <option value="200ft+">200ft+ High Sky Shots</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Burst Effect Description</label>
                <input
                  type="text"
                  placeholder="e.g. Golden brocade crown with ruby crackling stars"
                  value={formData.burstEffect}
                  onChange={(e) => setFormData({ ...formData, burstEffect: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
              </div>

              {/* Multiple Photos Upload, Media Preview & Set Primary Image */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-900 font-bold">Product Photos Gallery</label>
                    <p className="text-[11px] text-slate-500">
                      Upload multiple photos. The first photo is your primary storefront image.
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
                      id="product-photos-input"
                    />
                    <label
                      htmlFor="product-photos-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-fire-600" />
                      <span>Upload Photos</span>
                    </label>
                  </div>
                </div>

                {formData.images.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                    No photos uploaded yet. Click &quot;Upload Photos&quot; to add product images.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border ${
                          idx === 0 ? 'border-2 border-fire-600 ring-2 ring-fire-100' : 'border-slate-200'
                        } bg-white group aspect-square flex items-center justify-center`}
                      >
                        <Image
                          src={img}
                          alt={`Product preview ${idx + 1}`}
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
                              className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px] hover:bg-amber-400"
                            >
                              Set Primary
                            </button>
                          ) : (
                            <span className="text-[10px] text-white font-semibold">Primary</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                            title="Remove Photo"
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
                    <label className="block text-slate-900 font-bold">Product Burst Demonstration Video</label>
                    <p className="text-[11px] text-slate-500">
                      Upload an MP4 video or video demo so customers can watch the actual burst effect before ordering.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4, video/webm"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="product-video-input"
                    />
                    <label
                      htmlFor="product-video-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5 text-fire-600" />
                      <span>{formData.video ? 'Replace Video' : 'Upload Video'}</span>
                    </label>
                    {formData.video && (
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="p-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        title="Remove Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {formData.video ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-56">
                    <video
                      src={formData.video}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                    No video demo uploaded yet.
                  </div>
                )}
              </div>

              {/* Safety Instructions */}
              <div>
                <label className="block text-slate-900 font-bold mb-1">Safety Protocols & Instructions</label>
                <textarea
                  rows={2}
                  value={formData.safetyInstructions}
                  onChange={(e) => setFormData({ ...formData, safetyInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-fire-600 border-slate-300 focus:ring-fire-500"
                  />
                  <span>Mark as Featured Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Product Active on Storefront</span>
                </label>
              </div>

              {/* Actions */}
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
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
