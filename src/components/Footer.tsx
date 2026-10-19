'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, ShieldAlert, PhoneCall, Mail, MapPin, Sparkles, CheckCircle2, Gift } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const [storeLogo, setStoreLogo] = useState('');
  const [storeName, setStoreName] = useState('Boom Bazaar');
  const [storeAddress, setStoreAddress] = useState('Boom Bazaar Central Fireworks Depot, Main Highway Hub');
  const [whatsappPhone, setWhatsappPhone] = useState('8128627017');
  const [supportEmail, setSupportEmail] = useState('orders@boombazaar.com');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.store_logo) setStoreLogo(data.settings.store_logo);
        if (data.settings?.store_name) setStoreName(data.settings.store_name);
        if (data.settings?.store_address) setStoreAddress(data.settings.store_address);
        if (data.settings?.whatsapp_phone) setWhatsappPhone(data.settings.whatsapp_phone);
        if (data.settings?.support_email) setSupportEmail(data.settings.support_email);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="relative bg-slate-50 border-t border-slate-200 pt-14 pb-8 text-slate-600">
      <div className="container mx-auto px-4 space-y-12">
        {/* Compliance & Safety Warning Banner */}
        <div className="rounded-2xl bg-white border border-orange-200/90 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-black text-slate-900 text-sm">
                  100% Certified Safe Green Fireworks
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
                  All fireworks sold by Boom Bazaar are verified Green Crackers with low smoke emissions and safe decibel levels. Strictly for outdoor use by adults aged 18+. Always maintain a safe perimeter, keep water handy, and supervise children.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PESO Certified
              </span>
            </div>
          </div>
        </div>

        {/* 4 Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info with Logo */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              {storeLogo ? (
                <div className="h-10 max-w-[160px] relative flex items-center">
                  <Image
                    src={storeLogo}
                    alt={storeName}
                    width={150}
                    height={40}
                    unoptimized
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fire-600 via-flame-500 to-spark-500 flex items-center justify-center shadow-sm">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-heading text-xl font-black tracking-tight text-slate-900">
                    BOOM<span className="text-gradient-fire">BAZAAR</span>
                  </span>
                </div>
              )}
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed">
              India&apos;s trusted certified fireworks destination. Celebrating Diwali, New Year, weddings, and grand festivities with vibrant sky bursts, sparkling novelties, and safe family memories.
            </p>

            <div className="pt-1">
              <a
                href={`https://wa.me/${whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Desk: {whatsappPhone}</span>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h5 className="font-heading font-black text-slate-900 text-xs tracking-wider uppercase">
              Popular Categories
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/hampers" className="hover:text-fire-600 font-medium transition-colors flex items-center gap-1.5 text-fire-600">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Diwali Gift Hampers (Combo Boxes)</span>
                </Link>
              </li>
              <li>
                <Link href="/categories/sparklers" className="hover:text-fire-600 font-medium transition-colors">
                  Golden & Wire Sparklers
                </Link>
              </li>
              <li>
                <Link href="/categories/aerial-shots" className="hover:text-fire-600 font-medium transition-colors">
                  Aerial Cakes & Sky Thunder
                </Link>
              </li>
              <li>
                <Link href="/categories/flower-pots" className="hover:text-fire-600 font-medium transition-colors">
                  Royal Flower Pots & Anars
                </Link>
              </li>
              <li>
                <Link href="/categories/rockets" className="hover:text-fire-600 font-medium transition-colors">
                  Sonic Rockets & Whistlers
                </Link>
              </li>
              <li>
                <Link href="/categories/ground-spinners" className="hover:text-fire-600 font-medium transition-colors">
                  Solar Ground Chakkars
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h5 className="font-heading font-black text-slate-900 text-xs tracking-wider uppercase">
              Customer Services
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/track-order" className="hover:text-fire-600 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-fire-600 transition-colors">
                  Cancellation & Decisions
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-fire-600 transition-colors">
                  Browse Full Price Catalogue
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-fire-600 transition-colors font-medium">
                  Store Administration & POS
                </Link>
              </li>
            </ul>
          </div>

          {/* Storeyard & Contact Details */}
          <div className="space-y-3">
            <h5 className="font-heading font-black text-slate-900 text-xs tracking-wider uppercase">
              Yard & Depot Address
            </h5>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-fire-600 flex-shrink-0 mt-0.5" />
                <span>{storeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hotline: +91 {whatsappPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Safe & bright festival fireworks</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
