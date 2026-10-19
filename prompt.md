# Project: Boom Bazaar — Fireworks E-commerce Platform

## Objective
Build a complete, production-oriented, mobile-first fireworks e-commerce website named **Boom Bazaar** using Next.js, TypeScript, Cloudflare Workers, Cloudflare D1 (SQLite), Tailwind CSS, and GSAP.

The application must include a customer storefront, shopping cart, WhatsApp order sharing, order management, product inventory, and an admin dashboard supporting both online and offline sales.

## 1. Technology Stack
- Next.js App Router and TypeScript.
- Cloudflare Workers deployment with a compatible Next.js adapter.
- Cloudflare D1 database using the existing database.
- Tailwind CSS for responsive styling.
- GSAP for smooth, performant animations.
- React Hook Form and Zod for form validation.
- Lucide icons.
- Cloudflare R2 or another compatible image-storage service for product images, if required.

## 2. Existing Cloudflare D1 Database
Use the existing database. Do not create a replacement database.

- Database name: `boom_bazaar`
- Database ID: `68376693-77c8-489e-9b66-349baf8b8755`
- Wrangler binding: `DB`

Configure the database in `wrangler.jsonc` or the appropriate Wrangler configuration file:

    {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "boom_bazaar",
          "database_id": "68376693-77c8-489e-9b66-349baf8b8755"
        }
      ]
    }

Inspect the existing database schema before making changes. Create versioned SQL migrations for missing tables, indexes, and schema updates. Never drop existing data or reset the production database.

Use prepared SQL statements, transactions or D1 batch operations where appropriate, server-side validation, and proper error handling.

## 3. Customer Storefront

Create the following routes:

- `/` — Homepage
- `/products` — Product catalogue
- `/products/[slug]` — Product details
- `/categories/[slug]` — Category listing
- `/cart` — Shopping cart
- `/checkout` — Customer and order details
- `/order/[orderId]` — Order confirmation and status
- `/track-order` — Order lookup

Homepage:
- Attractive fireworks-inspired hero section.
- Brand logo, navigation, search, category links, and cart icon.
- Featured products, popular categories, promotional banners, and best sellers.
- Product cards with image, name, price, stock status, and Add to Cart button.
- Footer with contact details, store policies, and legal information.

Product catalogue:
- Search products by name.
- Filter by category, availability, and price.
- Sort by price and popularity.
- Pagination or efficient loading for larger catalogues.
- Product details, image gallery, quantity selector, stock availability, and price.

Use realistic product layouts but do not invent real prices, stock, certifications, or safety claims. Provide an admin-controlled way to manage all product information.

## 4. Shopping Cart

Implement a fully functional cart.

- Add products and update quantities.
- Remove products and clear the cart.
- Display subtotal, applicable charges, and final total.
- Prevent quantities exceeding available stock.
- Preserve the cart across page refreshes.
- Show an empty-cart state and continue-shopping link.
- Display cart count throughout the storefront.
- Revalidate prices and stock on the server during order creation.

Never trust client-submitted product prices or totals.

## 5. Checkout and WhatsApp Integration

Collect:
- Customer name.
- Phone number.
- Delivery or pickup preference.
- Address when delivery is available.
- Optional customer notes.
- Required order and policy acknowledgements.

Order creation flow:
1. Validate customer details on the server.
2. Re-fetch products and prices from D1.
3. Validate product availability and quantities.
4. Calculate the final order total on the server.
5. Generate a unique, human-readable order number.
6. Save the order and its line items to D1.
7. Prevent duplicate order creation on repeated submissions.
8. Show an order confirmation page.
9. Provide a Share Order on WhatsApp button.

WhatsApp destination:
`https://wa.me/8128627017`

Format a URL-encoded, prefilled message containing:
- Boom Bazaar branding.
- Order number.
- Customer name and phone.
- Product names, quantities, and individual prices.
- Subtotal and final total.
- Delivery or pickup details.
- Order status and contact information.

Use the configured WhatsApp number in a centralized environment configuration. Verify its international-format requirements before production.

Important: WhatsApp sharing must not be the mechanism that creates or saves an order. Persist the order before opening WhatsApp. Display a clear confirmation that the order is recorded and that the customer must send the WhatsApp message manually.

Do not mark an order as paid or confirmed merely because WhatsApp opened.

## 6. Admin Authentication

Create secure admin authentication.

Routes:
- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/orders/[orderId]`
- `/admin/inventory`
- `/admin/sales`
- `/admin/customers`
- `/admin/reports`
- `/admin/settings`

Requirements:
- Unauthenticated users must be redirected to the admin login.
- Use secure password hashing and server-validated sessions.
- Use HttpOnly, Secure-in-production, SameSite cookies.
- Add CSRF protection where applicable, login rate limiting, and session expiration.
- Never expose admin credentials or session secrets in client-side code.
- Public registration must not grant admin privileges.
- Provide a secure, documented initial admin provisioning process.

## 7. Product and Category Management

Admin can:
- Add, edit, archive, and delete eligible products.
- Manage product name, slug, description, images, category, SKU, price, sale price, stock, and active status.
- Manage category names, descriptions, images, and ordering.
- Mark products as featured.
- Set stock thresholds and receive low-stock warnings.
- Upload, replace, and remove product images.
- Preview products before publishing.
- Search and filter the product inventory.

Protect referenced products and historical order records. Prefer archiving products rather than deleting products that appear in existing orders.

## 8. Online Order Management

Admin can:
- View all orders and order details.
- Search by order ID, customer name, phone, date, channel, and status.
- Filter by date range, payment status, and order status.
- Update order status with a recorded history.
- View customer details, item quantities, totals, and notes.
- Record payment method and payment status.
- Cancel eligible orders and record the reason.
- Record refunds separately from cancellations.
- View orders shared through the WhatsApp workflow.
- Print an order invoice or receipt.

Suggested order statuses:
- Pending
- Confirmed
- Processing
- Ready for Pickup
- Shipped, where delivery is supported
- Completed
- Cancellation Requested
- Cancelled

Use validated status transitions. Record timestamps and the admin responsible for each change.

## 9. Customer Order Cancellation

Allow customers to request cancellation from their order tracking page.

- Verify order ownership using a secure order-access token or equivalent mechanism.
- Never allow cancellation based solely on a predictable order ID.
- Allow cancellation only when permitted by the order's current status and store policy.
- Record cancellation requests, decisions, reasons, and timestamps.
- Notify the admin dashboard about pending requests.
- Allow authorized admins to approve or reject requests.
- Restore stock only when cancellation is approved and the stock has not already been restored.
- Make cancellation and stock restoration idempotent.

## 10. Offline / Counter Sales

Add a dedicated admin POS page.

Admin can:
- Search or scan a product SKU.
- Add multiple products to a sale.
- Change quantities.
- Apply authorized discounts.
- Calculate the total.
- Record payment method, including cash and supported digital methods.
- Optionally record customer details.
- Complete a sale and generate a printable receipt.
- View and search historical counter sales.
- Handle eligible offline-sale returns with an audit trail.

Store offline sales in the same sales and order data model, with a clear `sales_channel` value such as `online` or `offline`.

Online and offline sales must appear in the same reporting dashboard, with filters to view either channel or both.

Use an atomic stock update or conditional inventory update to prevent selling unavailable stock. Store immutable product-name, SKU, and unit-price snapshots in sale line items.

## 11. Admin Dashboard Analytics

Show:
- Total sales.
- Today's sales.
- This month's sales.
- Online revenue.
- Offline revenue.
- Total orders.
- Pending orders.
- Completed orders.
- Cancelled orders.
- Average order value.
- Top-selling products.
- Low-stock products.
- Recent transactions.
- Sales trend chart.
- Sales by channel.
- Best-performing categories.

Define revenue consistently. Exclude cancelled orders and uncompleted transactions according to configurable reporting rules. Separate gross sales, discounts, refunds, and net sales instead of mixing them into a single figure.

Provide date filters and CSV exports.

## 12. Database Design

Inspect the current schema first. Reuse compatible tables where possible and create migrations for missing structures.

Required logical entities:
- `admins`
- `products`
- `categories`
- `customers`
- `orders`
- `order_items`
- `inventory_movements`
- `sales` or a compatible unified order model
- `sale_items` or a compatible unified line-item model
- `order_status_history`
- `cancellation_requests`
- `payments`
- `settings`

Use appropriate primary keys, foreign keys, uniqueness constraints, status constraints, timestamps, and indexes.

Ensure online orders and offline sales can be distinguished reliably. Store historical product details in line items so that subsequent catalogue edits do not alter old receipts.

Use integer minor units for monetary values where practical, with a documented currency configuration. Do not calculate financial totals using floating-point arithmetic.

## 13. Design and User Experience

Visual direction:
- Premium, modern, energetic, and trustworthy.
- Deep navy or near-black backgrounds paired with warm gold, vivid orange, and restrained festive accents.
- Clean product cards, strong typography, generous spacing, and clear calls to action.
- Mobile-first layouts that work on phones, tablets, and desktop screens.
- Responsive navigation, mobile cart access, and touch-friendly controls.
- Consistent buttons, forms, dialogs, badges, tables, and empty states.
- Admin sidebar on desktop and a mobile-friendly navigation drawer.

Use GSAP for:
- Hero headline entrances.
- Subtle product reveal animations.
- Banner transitions.
- Cart feedback.
- Lightweight page transitions where compatible.

Use `gsap.context()` or appropriate cleanup in React effects. Respect reduced-motion preferences. Avoid heavy continuous particle effects, excessive scroll animations, and anything that delays checkout.

Do not animate every element or compromise usability for visual effects.

## 14. Fireworks Safety and Legal Compliance

This store sells regulated products. Build a configurable compliance layer before enabling real purchases.

- Display only products and categories authorized for the applicable jurisdiction.
- Support applicable age verification and customer eligibility requirements.
- Configure delivery and pickup restrictions by location.
- Display required safety warnings and legal notices.
- Do not offer prohibited products or restricted delivery options.
- Keep the checkout disabled for unsupported locations or unverified compliance settings.
- Do not claim that a product is legally approved unless verified by the administrator.

Require the store owner to verify local licensing, sales restrictions, age requirements, storage requirements, and delivery rules before launch.

## 15. Security and Performance

- Use server-side authorization on every admin mutation.
- Validate request bodies and path parameters with Zod.
- Use parameterized D1 statements.
- Add pagination and indexed search queries.
- Avoid exposing personal customer data in public APIs.
- Add request limits, error boundaries, and useful loading states.
- Avoid storing payment card details.
- Integrate a payment provider only if explicitly configured and required.
- Never represent a manual payment or WhatsApp message as verified payment.
- Add structured logs without passwords, session tokens, or unnecessary personal data.
- Test stock consistency and duplicate order submissions.

## 16. Deliverables

Provide:
1. Complete Next.js project source.
2. Responsive customer storefront.
3. Secure admin dashboard.
4. Cloudflare D1 schema and versioned migrations.
5. Wrangler configuration for the existing database.
6. Product, cart, checkout, order, and POS APIs.
7. WhatsApp message-generation integration.
8. Sample seed data for development only.
9. Environment variable example without real secrets.
10. README with installation, local development, database migration, admin provisioning, and deployment instructions.
11. Tests for cart calculations, order creation, cancellation, stock updates, authentication, and offline sales.

## 17. Development Workflow

First inspect the existing repository and D1 schema. Then establish the application architecture, migrations, and authentication. Implement the customer storefront, order workflow, admin inventory, and offline POS in manageable stages.

Run type checks, linting, automated tests, and a production build. Resolve errors before declaring completion.

Do not use mock data as a substitute for functional database operations. Do not leave buttons non-functional, hardcode admin credentials, or claim deployment succeeded without verifying it.

Deliver a working application connected to the specified Cloudflare D1 database, with clear setup instructions and no destructive production database changes.