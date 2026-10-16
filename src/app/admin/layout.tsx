'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Flame,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Store,
  Gift,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeLogo, setStoreLogo] = useState<string>('');

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.store_logo) setStoreLogo(data.settings.store_logo);
      })
      .catch(() => {});
  }, []);

  // If on login page, render plain without sidebar
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Counter POS', href: '/admin/sales', icon: Store, badge: 'POS' },
    { label: 'Online Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Hampers', href: '/admin/hampers', icon: Gift },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reports & Export', href: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fire-600 to-flame-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-black text-slate-900 text-base">
            BOOM<span className="text-gradient-fire">ADMIN</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-100 border border-slate-200"
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              {storeLogo ? (
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 overflow-hidden shadow-sm">
                  <img src={storeLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fire-600 via-flame-500 to-spark-500 flex items-center justify-center shadow-sm">
                  <Flame className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <span className="font-heading text-lg font-black tracking-tight text-slate-900 block">
                  BOOM<span className="text-gradient-fire">ADMIN</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                  Command Center
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-fire-700 hover:text-fire-800 hover:bg-orange-50/50 transition-colors"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-50 text-fire-600 border border-orange-200 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-fire-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
