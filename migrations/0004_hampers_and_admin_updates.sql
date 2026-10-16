-- Migration 0004: Hampers, Admin Provisioning & Settings Updates

-- 1. Update Admins Table with username and first-login password change flag
ALTER TABLE admins ADD COLUMN username TEXT;
ALTER TABLE admins ADD COLUMN must_change_password INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- 2. Hampers Table
CREATE TABLE IF NOT EXISTS hampers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- minor units (paise) for consistent financial calculations
    sale_price INTEGER,
    images TEXT, -- JSON array of image Base64 data URLs
    video TEXT, -- Base64 data URI (data:video/mp4;base64,...)
    is_featured INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hamper Items Table (Products included inside a hamper)
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

-- 4. Order Items item_type for clean handling of hampers and individual products
ALTER TABLE order_items ADD COLUMN item_type TEXT DEFAULT 'product';

-- 5. Seed default store configuration for rupees and logo
INSERT OR IGNORE INTO settings (key, value) VALUES ('store_logo', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('delivery_fee_rupees', '150');
INSERT OR IGNORE INTO settings (key, value) VALUES ('free_delivery_threshold_rupees', '2500');

-- 6. Provision boom_admin user with must_change_password = 1
UPDATE admins SET username = 'boom_admin', password_hash = '3c475aa87c7c15428ecc0ae1d22e37d843b837483a46a366823de7b0016405ec', must_change_password = 1 WHERE id = 'admin_01' OR email = 'admin@boombazaar.com';

INSERT OR IGNORE INTO admins (id, name, email, username, password_hash, role, must_change_password)
VALUES (
    'admin_boom',
    'Boom Administrator',
    'boom_admin@boombazaar.com',
    'boom_admin',
    '3c475aa87c7c15428ecc0ae1d22e37d843b837483a46a366823de7b0016405ec', -- sha256(boombazaar_salt_BoomAdmin@2026!)
    'superadmin',
    1
);
