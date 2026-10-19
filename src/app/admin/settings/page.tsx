'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Save, CheckCircle2, PhoneCall, Upload, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: 'Boom Bazaar Fireworks Co.',
    store_logo: '',
    whatsapp_phone: '8128627017',
    support_email: 'orders@boombazaar.com',
    store_address: 'Boom Bazaar Yard, Fireworks Hub, Festival Road, City Central',
    delivery_fee_rupees: '150',
    free_delivery_threshold_rupees: '2500',
    legal_disclaimer: 'All fireworks sold are compliant with regional sound and emission safety standards.',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.settings) {
          // If delivery_fee_rupees doesn't exist yet but delivery_fee (paise) does, calculate rupees
          const feeRupees = data.settings.delivery_fee_rupees || 
            (data.settings.delivery_fee ? String(Math.round(Number(data.settings.delivery_fee) / 100)) : '150');
          const threshRupees = data.settings.free_delivery_threshold_rupees || 
            (data.settings.free_delivery_threshold ? String(Math.round(Number(data.settings.free_delivery_threshold) / 100)) : '2500');

          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            delivery_fee_rupees: feeRupees,
            free_delivery_threshold_rupees: threshRupees,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings(prev => ({ ...prev, store_logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, store_logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...settings,
        // Sync paise equivalents for backward compatibility
        delivery_fee: String(Math.round(Number(settings.delivery_fee_rupees || 150) * 100)),
        free_delivery_threshold: String(Math.round(Number(settings.free_delivery_threshold_rupees || 2500) * 100)),
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setMessage('Store settings and logo saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-heading text-2xl font-black text-slate-900">Store Configuration</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Upload store brand logo, configure delivery fees in Rupees (₹), desk WhatsApp & safety disclaimers.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700">
        
        {/* Store Logo Upload Section */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <label className="block text-slate-900 font-bold">
            Store Brand Logo
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Upload your official logo. It will be displayed in the storefront navigation, footer, admin portal, and order receipts.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {settings.store_logo ? (
              <div className="relative group w-32 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                <Image
                  src={settings.store_logo}
                  alt="Store Logo"
                  width={120}
                  height={60}
                  unoptimized
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  title="Remove logo"
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">No Logo Set</span>
              </div>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload-input"
              />
              <label
                htmlFor="logo-upload-input"
                className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-fire-600" />
                <span>{settings.store_logo ? 'Change Logo' : 'Upload Store Logo'}</span>
              </label>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, SVG or WebP (Max 2MB)</p>
            </div>
          </div>
        </div>

        {/* Store Name */}
        <div>
          <label className="block text-slate-900 font-bold mb-1">Store / Business Name</label>
          <input
            type="text"
            value={settings.store_name}
            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-500 focus:bg-white"
          />
        </div>

        {/* WhatsApp & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              WhatsApp Desk Number (URL Target) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.whatsapp_phone}
                onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-fire-500 focus:bg-white"
              />
              <PhoneCall className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Orders sent to: wa.me/8128627017</p>
          </div>

          <div>
            <label className="block text-slate-900 font-bold mb-1">Customer Support Email</label>
            <input
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Physical Address */}
        <div>
          <label className="block text-slate-900 font-bold mb-1">Depot / Yard Physical Address</label>
          <input
            type="text"
            value={settings.store_address}
            onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-fire-500 focus:bg-white"
          />
        </div>

        {/* Standard Delivery Fee & Free Delivery Threshold in Rupees (₹) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-orange-50/60 border border-orange-200">
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Standard Delivery Fee in Rupees (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="150"
                value={settings.delivery_fee_rupees}
                onChange={(e) => setSettings({ ...settings, delivery_fee_rupees: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-7 pr-3 text-slate-900 font-bold font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Charged on orders below the free delivery threshold</p>
          </div>

          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Free Delivery Threshold in Rupees (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="2500"
                value={settings.free_delivery_threshold_rupees}
                onChange={(e) => setSettings({ ...settings, free_delivery_threshold_rupees: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-7 pr-3 text-slate-900 font-bold font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Orders at or above this rupee amount get 100% free delivery</p>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div>
          <label className="block text-slate-900 font-bold mb-1">
            Statutory Legal Compliance & Safety Disclaimer
          </label>
          <textarea
            rows={3}
            value={settings.legal_disclaimer}
            onChange={(e) => setSettings({ ...settings, legal_disclaimer: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed focus:outline-none focus:border-fire-500 focus:bg-white"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-firecracker px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm text-white"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
