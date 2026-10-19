import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format minor currency units (paise) to display format (e.g. ₹1,499.00)
 */
export function formatCurrency(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Generate human-readable unique order number: BB-2026-XXXX
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BB-${dateStr}-${randomSuffix}`;
}

/**
 * Generate secure random order access token for tracking and cancellation authorization
 */
export function generateAccessToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Build WhatsApp prefilled message URL as required in prompt.md section 5
 */
export function buildWhatsAppOrderUrl(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: string;
  address?: string | null;
  items: Array<{ productName: string; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal: number;
  taxAmount?: number;
  deliveryFee?: number;
  discountAmount?: number;
  totalAmount: number;
  orderStatus: string;
  whatsappPhone?: string;
}): string {
  const phone = order.whatsappPhone || '8128627017';
  
  const itemsText = order.items
    .map((item, idx) => `  ${idx + 1}. *${item.productName}* x${item.quantity} — ${formatCurrency(item.totalPrice)}`)
    .join('\n');

  const deliveryInfo = order.deliveryType === 'delivery' 
    ? `🚚 *Delivery Address:*\n${order.address || 'Address on file'}` 
    : `🏬 *Pickup Mode:* In-Store Counter Pickup at Boom Bazaar Yard`;

  const message = `✨ *BOOM BAZAAR — FESTIVE FIREWORKS ORDER* ✨
━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* ${order.orderNumber}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}

🛒 *ORDERED ITEMS:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* ${formatCurrency(order.subtotal)}
${order.deliveryFee ? `🚚 *Delivery Fee:* ${formatCurrency(order.deliveryFee)}\n` : ''}${order.discountAmount ? `🏷️ *Discount:* -${formatCurrency(order.discountAmount)}\n` : ''}💥 *FINAL TOTAL:* ${formatCurrency(order.totalAmount)}
━━━━━━━━━━━━━━━━━━━━
${deliveryInfo}
📋 *Current Status:* ${order.orderStatus}

⚡ _Please confirm my order and share estimated dispatch / pickup readiness. Thank you!_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
