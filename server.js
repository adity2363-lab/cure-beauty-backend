const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "cure-beauty.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT,
  price INTEGER NOT NULL,
  mrp INTEGER,
  concern TEXT,
  category TEXT,
  image_url TEXT,
  description TEXT,
  stock INTEGER DEFAULT 100,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  label TEXT,
  line TEXT,
  city TEXT,
  pincode TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  address_id INTEGER,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);
`);

// Seed products if empty
const count = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
if (count === 0) {
  const insert = db.prepare(`INSERT INTO products (name, brand, price, mrp, concern, category, image_url, description) VALUES (?,?,?,?,?,?,?,?)`);
  const seed = [
    ["Vitamin C Glow Serum", "Lumière", 649, 899, "Brightening", "Serums", "", "Targets brightening. Suitable for daily use."],
    ["Hyaluronic Acid Moisture Gel", "Dew Lab", 549, 699, "Hydration", "Face", "", "Deeply hydrating gel moisturizer."],
    ["Niacinamide 10% Serum", "Lumière", 399, 549, "Acne", "Serums", "", "Helps reduce acne and control oil."],
    ["Rose Clay Detox Mask", "Petal & Co.", 449, 599, "Deep Cleanse", "Face", "", "Detoxifying clay mask."],
    ["SPF 50 Matte Sunscreen", "Dew Lab", 379, 449, "Sun Protection", "Sunscreen", "", "Matte finish broad spectrum sunscreen."],
    ["Retinol Night Repair Cream", "Petal & Co.", 799, 999, "Anti-Aging", "Face", "", "Night repair cream with retinol."],
  ];
  const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(...r)));
  insertMany(seed);
}

module.exports = db;
