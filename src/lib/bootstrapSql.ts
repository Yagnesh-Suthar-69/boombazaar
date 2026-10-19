// Embedded schema and seed data for Boom Bazaar
// Used for zero-filesystem bootstrapping of Cloudflare D1 or in-memory SQLite

export const BOOTSTRAP_SCHEMA_SQL = `
-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    must_change_password INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    sound_level TEXT DEFAULT 'Medium',
    altitude TEXT DEFAULT 'Ground',
    burst_effect TEXT,
    safety_instructions TEXT,
    images TEXT,
    video TEXT,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    total_orders INTEGER DEFAULT 0,
    lifetime_spend INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL DEFAULT 'delivery',
    address TEXT,
    notes TEXT,
    subtotal INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    delivery_fee INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cash_on_delivery',
    order_status TEXT NOT NULL DEFAULT 'Pending',
    sales_channel TEXT NOT NULL DEFAULT 'online',
    access_token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    item_type TEXT DEFAULT 'product',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 7. Hampers Table
CREATE TABLE IF NOT EXISTS hampers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    images TEXT,
    video TEXT,
    is_featured INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Hamper Items Table
CREATE TABLE IF NOT EXISTS hamper_items (
    id TEXT PRIMARY KEY,
    hamper_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hamper_id) REFERENCES hampers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_hamper_items_hamper ON hamper_items(hamper_id);
CREATE INDEX IF NOT EXISTS idx_hamper_items_product ON hamper_items(product_id);

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Inventory Movements Table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    change_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id TEXT,
    notes TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
`;

export const BOOTSTRAP_SEEDS_SQL = `
-- Default store settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('store_name', 'Boom Bazaar');
INSERT OR IGNORE INTO settings (key, value) VALUES ('store_logo', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('delivery_fee_rupees', '150');
INSERT OR IGNORE INTO settings (key, value) VALUES ('free_delivery_threshold_rupees', '2500');

-- Default admin user: boom_admin (initial password: BoomAdmin@2026!, must change password on first login)
INSERT OR IGNORE INTO admins (id, name, email, username, password_hash, role, must_change_password)
VALUES (
    'admin_boom',
    'Boom Administrator',
    'boom_admin@boombazaar.com',
    'boom_admin',
    '3c475aa87c7c15428ecc0ae1d22e37d843b837483a46a366823de7b0016405ec',
    'superadmin',
    1
);

-- Categories
INSERT OR IGNORE INTO categories (id, name, slug, description, image, display_order)
VALUES
('cat_sparklers', 'Sparklers & Wire Crackers', 'sparklers', 'Classic dazzling hand-held golden and multi-colour sparklers for all ages.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', 1),
('cat_aerial', 'Aerial Shots & Sky Cakes', 'aerial-shots', 'Spectacular high-altitude multi-shot fireworks with glowing bursts and crackling canopies.', 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80', 2),
('cat_pots', 'Flower Pots & Anars', 'flower-pots', 'Fountains of golden sparks, silver cascading showers, and tricolour flame eruptions.', 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80', 3),
('cat_rockets', 'Sky Rockets & Whistlers', 'rockets', 'High-thrust screaming rockets with booming overhead glitter and floral bursts.', 'https://images.unsplash.com/photo-1576400883215-7083980b619f?auto=format&fit=crop&w=800&q=80', 4),
('cat_spinners', 'Ground Spinners & Chakkars', 'ground-spinners', 'High-speed spinning wheels of fiery silver sparks and golden whirlwinds on the ground.', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', 5),
('cat_sound', 'Sound Crackers & Lad', 'sound-crackers', 'Traditional festive sound crackers, thunder bombs, and rhythmic celebratory garlands.', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', 6),
('cat_gift', 'Diwali Mega Gift Boxes', 'gift-boxes', 'Curated family assortment hampers with assorted sparklers, anars, rockets, and fancy novelties.', 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80', 7);

-- Products
INSERT OR IGNORE INTO products (id, name, slug, description, category_id, sku, price, sale_price, stock, low_stock_threshold, sound_level, altitude, burst_effect, safety_instructions, images, is_featured, is_active)
VALUES
(
    'prod_01',
    'Golden Glittering Sparklers (50cm)',
    'golden-glittering-sparklers-50cm',
    'Premium extra-long sparklers emitting dazzling golden embers with low smoke formula. Burns uniformly for over 90 seconds.',
    'cat_sparklers',
    'SPK-GLD-50',
    25000,
    19900,
    120,
    15,
    'Mild',
    'Handheld',
    'Golden Starburst Spray with Warm Embers',
    'Light holding at arm length. Do not touch glowing tip. Submerge spent wire in water.',
    '["https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_02',
    'Boom Thunder 50-Shot Sky Cake',
    'boom-thunder-50-shot-sky-cake',
    'Showstopper professional-grade aerial fireworks with 50 rapid-fire shots of ruby red peonies, golden brocade crowns, and titanium salutes.',
    'cat_aerial',
    'AER-50-THD',
    350000,
    299900,
    35,
    5,
    'High',
    '200ft+',
    '50-Shot Continuous Peony, Willow & Titanium Salute Finale',
    'Place upright on flat open ground. Secure with bricks on both sides. Light fuse and retreat 25 meters immediately.',
    '["https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_03',
    'Royal Tri-Color Giant Anar (Pack of 5)',
    'royal-tri-color-giant-anar',
    'Glorious volcano eruption transitioning seamlessly from saffron orange to emerald green and sparkling silver pearl showers up to 15 feet.',
    'cat_pots',
    'POT-TRI-05',
    49900,
    39900,
    80,
    10,
    'Medium',
    '15ft Fountain',
    '3-Stage Multi-Color Volcanic Fountain with Golden Crackles',
    'Keep firmly on clear horizontal surface outdoors. Never lean over the cone while lighting.',
    '["https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_04',
    'Whistling Galaxy Sound Rockets (10 Pcs)',
    'whistling-galaxy-sound-rockets',
    'Aerodynamic wooden-stick rockets with high pitch screeching ascent bursting into dazzling silver strobe umbrellas.',
    'cat_rockets',
    'RCK-WHT-10',
    45000,
    34900,
    60,
    10,
    'High',
    '150ft',
    'Screaming Siren Ascent to Silver Glitter Umbrella',
    'Insert launch stick loosely into launch tube or pipe. Ensure no overhead trees, cables or structures.',
    '["https://images.unsplash.com/photo-1576400883215-7083980b619f?auto=format&fit=crop&w=800&q=80"]',
    0,
    1
),
(
    'prod_05',
    'Deluxe Peacock Ground Chakkars (Pack of 10)',
    'deluxe-peacock-ground-chakkars',
    'Vibrant high-speed spinning wheels delivering hypnotic spiral rings of multi-colored emerald and amethyst sparks.',
    'cat_spinners',
    'SPN-PCK-10',
    22000,
    17900,
    95,
    15,
    'Mild',
    'Ground Level',
    'Rotating Floral Wheel with Emerald Sparkle Rings',
    'Place on smooth concrete or tiled ground. Light center tip and stand back 3 meters.',
    '["https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80"]',
    0,
    1
),
(
    'prod_06',
    'Mega Sound 1000 Wala Festive Garland (Lad)',
    'mega-sound-1000-wala-festive-garland',
    'Traditional unbroken continuous celebratory garland crackers producing rhythmic festive crackles followed by an ear-splitting grand finale salute.',
    'cat_sound',
    'SND-LAD-1000',
    125000,
    99900,
    45,
    5,
    'Extreme Thunder',
    'Ground',
    'Rhythmic Continuous Crackle Chain Ending in Thunder Salutes',
    'Spread out fully on dry open ground away from vehicles, flammable items, and crowds. Light tail fuse and retreat.',
    '["https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
);

-- Hampers
INSERT OR IGNORE INTO hampers (id, name, slug, description, price, sale_price, images, video, is_featured, is_active)
VALUES (
    'hmp_family_joy_01',
    'Diwali Family Joy Celebration Hamper',
    'diwali-family-joy-celebration-hamper',
    'The quintessential family festive assortment packed with glittering sparklers, dazzling flower pots, ground chakkars, and joyful whistling rockets. Perfect for all family members.',
    349900,
    279900,
    '["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80"]',
    null,
    1,
    1
);

INSERT OR IGNORE INTO products (id, name, slug, description, category_id, sku, price, sale_price, stock, low_stock_threshold, images, is_featured, is_active)
VALUES (
    'hmp_family_joy_01',
    'Diwali Family Joy Celebration Hamper',
    'diwali-family-joy-celebration-hamper',
    'The quintessential family festive assortment packed with glittering sparklers, dazzling flower pots, ground chakkars, and joyful whistling rockets.',
    'cat_gift',
    'HMP-FAM-JOY',
    349900,
    279900,
    9999,
    10,
    '["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
);

INSERT OR IGNORE INTO hamper_items (id, hamper_id, product_id, quantity)
VALUES
('hi_seed_01', 'hmp_family_joy_01', 'prod_01', 3),
('hi_seed_02', 'hmp_family_joy_01', 'prod_03', 2),
('hi_seed_03', 'hmp_family_joy_01', 'prod_05', 2);
`;
