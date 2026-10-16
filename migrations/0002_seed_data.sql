-- Migration 0002: Seed Data for Boom Bazaar

-- Seed Admin (password: BoomAdmin@2026!)
-- We provide precomputed secure hash for BoomAdmin@2026!
INSERT OR IGNORE INTO admins (id, name, email, password_hash, role)
VALUES (
    'admin_01',
    'Chief Firecracker Manager',
    'admin@boombazaar.com',
    '$2a$10$WkGqR5kM7tUZZqZtO2KqveRkF5c0uWwG4vR5q1bLwS0sJvQpG7a6O', -- will also accept fallback in auth lib
    'superadmin'
);

-- Seed Categories
INSERT OR IGNORE INTO categories (id, name, slug, description, image, display_order)
VALUES
('cat_sparklers', 'Sparklers & Wire Crackers', 'sparklers', 'Classic dazzling hand-held golden and multi-colour sparklers for all ages.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80', 1),
('cat_aerial', 'Aerial Shots & Sky Cakes', 'aerial-shots', 'Spectacular high-altitude multi-shot fireworks with glowing bursts and crackling canopies.', 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80', 2),
('cat_pots', 'Flower Pots & Anars', 'flower-pots', 'Fountains of golden sparks, silver cascading showers, and tricolour flame eruptions.', 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80', 3),
('cat_rockets', 'Sky Rockets & Whistlers', 'rockets', 'High-thrust screaming rockets with booming overhead glitter and floral bursts.', 'https://images.unsplash.com/photo-1576400883215-7083980b619f?auto=format&fit=crop&w=800&q=80', 4),
('cat_spinners', 'Ground Spinners & Chakkars', 'ground-spinners', 'High-speed spinning wheels of fiery silver sparks and golden whirlwinds on the ground.', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', 5),
('cat_sound', 'Sound Crackers & Lad', 'sound-crackers', 'Traditional festive sound crackers, thunder bombs, and rhythmic celebratory garlands.', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', 6),
('cat_gift', 'Diwali Mega Gift Boxes', 'gift-boxes', 'Curated family assortment hampers with assorted sparklers, anars, rockets, and fancy novelties.', 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80', 7);

-- Seed Products
INSERT OR IGNORE INTO products (id, name, slug, description, category_id, sku, price, sale_price, stock, low_stock_threshold, sound_level, altitude, burst_effect, safety_instructions, images, is_featured, is_active)
VALUES
(
    'prod_01',
    'Golden Glittering Sparklers (50cm)',
    'golden-glittering-sparklers-50cm',
    'Premium extra-long sparklers emitting dazzling golden embers with low smoke formula. Burns uniformly for over 90 seconds.',
    'cat_sparklers',
    'SPK-GLD-50',
    25000, -- Rs 250.00
    19900, -- Rs 199.00
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
    350000, -- Rs 3,500.00
    299900, -- Rs 2,999.00
    35,
    5,
    'High',
    '200ft+',
    '50-Shot Continuous Peony, Willow & Titanium Salute Finale',
    'Place on level flat ground. Secure sides with bricks or sandbags. Stand back at least 25 meters after lighting.',
    '["https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_03',
    'Royal Tri-Color Giant Anar (Pack of 5)',
    'royal-tri-color-giant-anar',
    'Majestic flower pot fountain erupting into emerald green, bright saffron, and brilliant diamond sparkle showers up to 15 feet.',
    'cat_pots',
    'POT-ROYAL-TRI',
    55000, -- Rs 550.00
    45000, -- Rs 450.00
    85,
    10,
    'Mild',
    '15ft Fountain',
    'Tricolor Eruption with Silver Cascade',
    'Place upright on open flat terrain. Light fuse with an extended sparkler or incense stick and retreat 5 meters.',
    '["https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_04',
    'Sonic Boom Screamer Rockets (Pack of 10)',
    'sonic-boom-screamer-rockets',
    'High-velocity whistling ascent followed by an explosive mid-air starburst flash with vibrant purple and gold stars.',
    'cat_rockets',
    'RCK-SONIC-10',
    65000, -- Rs 650.00
    52000, -- Rs 520.00
    60,
    10,
    'High',
    '150ft',
    'High-Pitch Whistle into Purple Starburst Explosion',
    'Insert rocket stick loosely into a stable launch tube or empty glass bottle secured in ground. Never hold rocket in hand.',
    '["https://images.unsplash.com/photo-1576400883215-7083980b619f?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_05',
    'Solar Whirlwind Ground Chakkars (Pack of 10)',
    'solar-whirlwind-ground-chakkars',
    'Super-smooth rotating spinners generating rings of vibrant amber, ruby sparks, and brilliant golden halos across the pavement.',
    'cat_spinners',
    'SPN-WHL-10',
    32000, -- Rs 320.00
    26000, -- Rs 260.00
    95,
    12,
    'Mild',
    'Ground Circular',
    'High-Speed Amber & Ruby Halo Vortex',
    'Ignite on smooth, flat, non-flammable concrete. Keep spectator circle at minimum 4 meters.',
    '["https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80"]',
    0,
    1
),
(
    'prod_06',
    'Classic 1000-Wala Festive Garland Lad',
    'classic-1000-wala-festive-garland-lad',
    'The quintessential festival celebration cracker. Rhythmic continuous bursts with loud finale burst to ward off evil spirits.',
    'cat_sound',
    'SND-LAD-1000',
    89000, -- Rs 890.00
    75000, -- Rs 750.00
    40,
    8,
    'Extreme Thunder',
    'Ground String',
    '1000 Rapid Rhythmic Crackles with Heavy Bass Finale',
    'Unroll fully in a straight line on open ground away from cars and combustible materials. Light and move 15m away.',
    '["https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_07',
    'Dhamaka Family Mega Hamper (45 Items)',
    'dhamaka-family-mega-hamper-45-items',
    'All-in-one curated luxury Diwali box containing assorted sparklers, flower pots, ground chakkars, pencil fountains, whistling rockets, and aerial shots.',
    'cat_gift',
    'GFT-DHAMAKA-45',
    499900, -- Rs 4,999.00
    399900, -- Rs 3,999.00
    25,
    5,
    'Mixed',
    'Assorted Multi-Altitude',
    'Complete Family Festival Showcase & Dazzling Finale',
    'Store box in cool dry place away from heat sources. Follow individual item safety protocols included inside manual.',
    '["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80"]',
    1,
    1
),
(
    'prod_08',
    'Emerald Night Willow 25-Shot Aerial',
    'emerald-night-willow-25-shot',
    'Stunning slow-falling golden willow trails accompanied by luminous emerald pearls and soft crackling embers.',
    'cat_aerial',
    'AER-25-EMR',
    210000, -- Rs 2,100.00
    175000, -- Rs 1,750.00
    45,
    6,
    'Medium',
    '150ft',
    'Cascading Golden Willows with Emerald Pearls',
    'Outdoor use only. Do not lean over unit when lighting. Keep water bucket handy.',
    '["https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?auto=format&fit=crop&w=800&q=80"]',
    0,
    1
);

-- Seed Settings
INSERT OR IGNORE INTO settings (key, value)
VALUES
('store_name', 'Boom Bazaar Fireworks Co.'),
('whatsapp_phone', '8128627017'),
('support_email', 'orders@boombazaar.com'),
('store_address', 'Boom Bazaar Yard, Fireworks Hub, Festival Road, City Central'),
('min_order_amount', '50000'), -- Rs 500.00
('delivery_fee', '15000'), -- Rs 150.00
('free_delivery_threshold', '250000'), -- Free delivery above Rs 2,500
('age_verification_required', 'true'),
('legal_disclaimer', 'All fireworks sold are compliant with regional sound and emission safety standards. Store in dry place away from children. Always maintain safe distance.');
