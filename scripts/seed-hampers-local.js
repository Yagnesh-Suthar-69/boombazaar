const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(process.cwd(), '.data', 'boombazaar.sqlite'));

// 1. Ensure boom_admin has correct hash and must_change_password = 1
db.exec(`
  UPDATE admins 
  SET username = 'boom_admin', 
      password_hash = '3c475aa87c7c15428ecc0ae1d22e37d843b837483a46a366823de7b0016405ec', 
      must_change_password = 1 
  WHERE username = 'boom_admin' OR id = 'admin_01' OR email = 'admin@boombazaar.com';
`);

console.log('Admin boom_admin provisioned with must_change_password = 1.');

// 2. Ensure both featured festive hampers are seeded
const count = db.prepare('SELECT count(*) as c FROM hampers').get().c;
console.log('Current hampers count:', count);

{
  console.log('Seeding initial hampers...');
  
  // Hamper 1: Diwali Family Joy Hamper
  const hmp1Id = 'hmp_family_joy_01';
  db.exec(`
    INSERT INTO hampers (id, name, slug, description, price, sale_price, images, video, is_featured, is_active)
    VALUES (
      '${hmp1Id}',
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

    INSERT INTO products (id, name, slug, description, category_id, sku, price, sale_price, stock, low_stock_threshold, images, is_featured, is_active)
    VALUES (
      '${hmp1Id}',
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

    INSERT INTO hamper_items (id, hamper_id, product_id, quantity)
    VALUES
      ('hi_seed_01', '${hmp1Id}', 'prod_01', 3),
      ('hi_seed_02', '${hmp1Id}', 'prod_03', 2),
      ('hi_seed_03', '${hmp1Id}', 'prod_05', 2);
  `);

  // Hamper 2: Royal Grand Sky Hamper
  const hmp2Id = 'hmp_royal_sky_02';
  db.exec(`
    INSERT INTO hampers (id, name, slug, description, price, sale_price, images, video, is_featured, is_active)
    VALUES (
      '${hmp2Id}',
      'Royal Grand Aerial Sky Hamper',
      'royal-grand-aerial-sky-hamper',
      'An elite showstopper collection featuring 50-shot multi-colour sky cakes, screaming high-altitude rockets, and glowing gold waterfalls for an unforgettable celebration.',
      599900,
      489900,
      '["https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80"]',
      null,
      1,
      1
    );

    INSERT INTO products (id, name, slug, description, category_id, sku, price, sale_price, stock, low_stock_threshold, images, is_featured, is_active)
    VALUES (
      '${hmp2Id}',
      'Royal Grand Aerial Sky Hamper',
      'royal-grand-aerial-sky-hamper',
      'An elite showstopper collection featuring 50-shot multi-colour sky cakes, screaming high-altitude rockets, and glowing gold waterfalls.',
      'cat_gift',
      'HMP-ROY-SKY',
      599900,
      489900,
      9999,
      10,
      '["https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80"]',
      1,
      1
    );

    INSERT INTO hamper_items (id, hamper_id, product_id, quantity)
    VALUES
      ('hi_seed_04', '${hmp2Id}', 'prod_02', 1),
      ('hi_seed_05', '${hmp2Id}', 'prod_04', 3),
      ('hi_seed_06', '${hmp2Id}', 'prod_01', 2);
  `);

  console.log('✅ Seeded 2 featured hampers successfully.');
}
