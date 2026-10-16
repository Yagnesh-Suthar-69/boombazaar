'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Flame, Lock, User, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export const dynamic = 'force-dynamic';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  // Step 1: Login
  const [usernameOrEmail, setUsernameOrEmail] = useState('boom_admin');
  const [password, setPassword] = useState('BoomAdmin@2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Mandatory First-Login Password Change
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.must_change_password) {
        setMustChangePassword(true);
        setIsLoading(false);
        return;
      }

      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Login error');
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword === password) {
      setError('New password cannot be the same as the initial temporary password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: password,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setChangeSuccess(true);
      setTimeout(() => {
        router.push(redirectPath);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error updating password');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fire-600 via-flame-500 to-spark-400 flex items-center justify-center mx-auto shadow-md">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-black text-slate-900">
          Boom Bazaar Admin Portal
        </h1>
        <p className="text-xs text-slate-600">
          Secure store management, hampers, orders & counter POS
        </p>
      </div>

      {/* Card Box */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {changeSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Password updated! Redirecting to command dashboard...</span>
          </div>
        )}

        {!mustChangePassword ? (
          /* Step 1: Standard Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  placeholder="boom_admin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-firecracker w-full py-3 px-4 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Provisioned Username: <code className="font-bold text-fire-600">boom_admin</code>
              </span>
            </div>
          </form>
        ) : (
          /* Step 2: First-Login Password Change Form */
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Password Change Required</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                For security reasons, you must set a new private password on your first login before accessing the store management dashboard.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                New Password (minimum 8 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new strong password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-fire-600 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || changeSuccess}
              className="btn-firecracker w-full py-3 px-4 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Updating Password...' : 'Save New Password & Continue'}</span>
            </button>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs text-slate-500 hover:text-fire-600 font-semibold transition-colors">
          ← Return to Public Fireworks Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[300px] bg-fire-500/10 rounded-full blur-[100px] pointer-events-none" />
      <Suspense fallback={<div className="text-slate-600 text-xs">Loading portal...</div>}>
        <AdminLoginContent />
      </Suspense>
    </div>
  );
}
