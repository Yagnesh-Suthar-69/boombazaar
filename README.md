# Boom Bazaar — Fireworks E-commerce Platform 🎆

**Boom Bazaar** is a modern, mobile-first fireworks e-commerce platform and store management solution built with Next.js, TypeScript, Cloudflare D1 (SQLite), Tailwind CSS, and GSAP.

It features a festive firecracker color palette, customer storefront, shopping cart, WhatsApp order sharing, customer order tracking & cancellation, online order fulfillment, stock movement tracking, and an offline Counter POS terminal.

---

## 🎨 Firecracker Color Palette & Visual Theme
- **Explosive Crimson & Ruby Red** (`#d90429`, `#ef233c`, `#b50422`) — Festive high-energy fireworks branding.
- **Sparkler Gold & Amber** (`#f59e0b`, `#fbbf24`, `#ffb703`) — Dazzling golden sparks and ember highlights.
- **Flame Saffron & Orange** (`#f97316`, `#ea580c`, `#ff5400`) — Rocket thrust, glowing anar fountains.
- **Gunpowder Smoke & Midnight Sky** (`#080a11`, `#0f1422`, `#171e31`, `#131929`) — Deep high-contrast backdrop with ambient fireworks sparkles.

---

## 🚀 Key Features

### 🛒 1. Customer Storefront
- **Festive Homepage (`/`)**: Hero section with GSAP headline entrances, ambient fireworks canvas particle backdrop, category links, featured bestsellers, promotional family gift box banner, and 4 safety golden rules.
- **Product Catalogue (`/products`)**: Filter by category, price ranges, in-stock only, and sort by price/popularity.
- **Product Details (`/products/[slug]`)**: High-res image gallery, sound decibel indicators, altitude badges, burst effect details, stock status, safety protocols, quantity incrementor, and instant WhatsApp inquiry.
- **Category Listing (`/categories/[slug]`)**: Dedicated category banner with filtered products.
- **Interactive Shopping Cart (`/cart` & Sliding Drawer)**: Free delivery progress meter (free safe delivery above ₹2,500), quantity bounds, subtotal, and continue shopping.
- **Checkout & Compliance (`/checkout`)**: Customer name, phone, delivery vs counter pickup, complete address, statutory age (18+) verification checkbox, and fireworks safety declaration.
- **Order Confirmation (`/order/[orderId]`)**: Generates unique order number (e.g. `BB-20261015-XXXX`), itemized bill, audit timeline, confetti celebration, and direct **Share Order on WhatsApp** button.
- **Track Order (`/track-order`)**: Instant lookup by order number and customer cancellation request capability.

### 📱 2. WhatsApp Integration
- Formatted prefilled message to destination: `https://wa.me/8128627017`
- Persists order and decrements inventory in the database **before** launching WhatsApp.
- URL-encoded receipt with order ID, customer details, line items, pricing, delivery mode, and status.

### 🛡️ 3. Admin Dashboard & Portal
- **Secure Authentication (`/admin/login`)**:
  - Default Admin: `admin@boombazaar.com`
  - Default Password: `BoomAdmin@2026!`
  - HttpOnly SameSite cookie session management with JWT validation and route protection.
- **Dashboard Overview (`/admin`)**: Total gross sales, online vs offline POS revenue, order status pipeline, average order value, low-stock warnings, and top-selling products.
- **Counter POS Terminal (`/admin/sales`)**: Offline counter sales, barcode SKU quick search, discount adjustments, cash/UPI/card tender selection, instant printable thermal cash memo/receipt, and refund/return handling with stock restoration.
- **Online Orders (`/admin/orders` & `/admin/orders/[id]`)**: Search by customer or order number, update fulfillment status (Pending, Confirmed, Processing, Ready for Pickup, Shipped, Completed, Cancelled), approve/reject customer cancellations with idempotent stock restoration, and print invoices.
- **Product Management (`/admin/products`)**: Add, edit, archive, and delete products with SKU, prices, stock, sound levels, and altitudes.
- **Category Taxonomy (`/admin/categories`)**: Create and organize product categories.
- **Stock Movements & Inventory (`/admin/inventory`)**: Real-time warehouse quantities, restock operations, write-offs, and movement audit logs.
- **Customer Directory (`/admin/customers`)**: Lifetime spend (LTV), total order history, and direct WhatsApp chat links.
- **Financial Reports & CSV Export (`/admin/reports`)**: Net revenue analysis and one-click CSV export for orders and POS sales.
- **Store Settings (`/admin/settings`)**: Configure central WhatsApp phone (`8128627017`), store name, address, delivery fees, and statutory legal disclaimers.

---

## 🗄️ Database Architecture (Cloudflare D1 & SQLite)
- **Database Name**: `boom_bazaar`
- **Database ID**: `68376693-77c8-489e-9b66-349baf8b8755`
- **Wrangler Binding**: `DB`

### Tables
- `admins`
- `categories`
- `products`
- `customers`
- `orders`
- `order_items`
- `sales` (Dedicated Counter POS)
- `sale_items`
- `inventory_movements`
- `order_status_history`
- `cancellation_requests`
- `payments`
- `settings`

---

## 🛠️ Installation & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Local Database & Seed Data**:
   ```bash
   npm run db:migrate
   ```

3. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Credentials
- **URL**: `http://localhost:3000/admin` (redirects to `/admin/login`)
- **Email**: `admin@boombazaar.com`
- **Password**: `BoomAdmin@2026!`

---

## 🌐 Cloudflare D1 Deployment

Apply migrations remotely to the Cloudflare D1 database:
```bash
npx wrangler d1 migrations apply boom_bazaar --remote
```

Build and deploy to Cloudflare Workers / Pages:
```bash
npm run build
npx wrangler deploy
```

---

## 📜 Compliance & Safety (PESO Guidelines)
Boom Bazaar enforces statutory fireworks compliance:
1. All crackers are certified Green Fireworks with reduced decibel and emission levels.
2. Orders require mandatory confirmation of 18+ age eligibility.
3. Fireworks are strictly for outdoor use with open clearance.
