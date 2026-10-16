'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Sparkles, PhoneCall } from 'lucide-react';

export default function FloatingWhatsAppConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // Show gentle prompt bubble after 4 seconds
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 md:right-5 z-30 flex flex-col items-end gap-2.5 font-sans pointer-events-auto">
      {/* Speech Prompt Bubble */}
      {hasPrompted && !isOpen && (
        <div className="relative bg-white rounded-2xl p-3.5 shadow-xl border border-orange-200/90 max-w-xs animate-bounce-subtle text-left">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHasPrompted(false);
            }}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            aria-label="Dismiss chat prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
              🪔
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900 leading-tight">
                Namaste! Need Diwali Advice?
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Ask our firecracker specialists which boxes are best for your children & elders!
              </p>
              <a
                href="https://wa.me/8128627017?text=Namaste%20Boom%20Bazaar!%20I%20would%20love%20some%20guidance%20on%20choosing%20the%20best%20safe%20fireworks%20for%20my%20family%20this%20Diwali."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1"
              >
                <span>Chat on WhatsApp now</span>
                <span className="text-xs">→</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href="https://wa.me/8128627017?text=Namaste%20Boom%20Bazaar!%20I%20would%20love%20some%20guidance%20on%20choosing%20the%20best%20safe%20fireworks%20for%20my%20family%20this%20Diwali."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Boom Bazaar Support"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/60"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="font-heading font-black text-xs hidden sm:inline tracking-wide">
          Diwali Support Desk
        </span>
      </a>
    </div>
  );
}
