const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "cure-beauty.db"));
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

// Real product catalog (reference pricing based on popular Amazon/Meesho skincare sellers — adjust to your actual sourced prices anytime)
const REAL_SEED = [
  ["Vitamin C Face Wash", "Mamaearth", 249, 349, "Brightening", "Face", "", "Foaming face wash with vitamin C and turmeric for glowing skin."],
  ["10% Niacinamide Serum", "Minimalist", 489, 599, "Acne", "Serums", "", "Controls oil and reduces acne marks with 10% niacinamide."],
  ["Green Tea Oil-Free Moisturizer", "Plum", 389, 495, "Hydration", "Face", "", "Lightweight, oil-free moisturizer for combination skin."],
  ["Vitamin C Serum", "Dot & Key", 595, 795, "Brightening", "Serums", "", "22% vitamin C blend for radiant, even-toned skin."],
  ["2% Salicylic Acid Face Wash", "The Derma Co", 299, 399, "Acne", "Face", "", "Deep pore cleansing face wash for acne-prone skin."],
  ["Bio Papaya Face Wash", "Biotique", 199, 249, "Deep Cleanse", "Face", "", "Herbal face wash with papaya extract for clear skin."],
  ["Sunscreen Matte Gel SPF 50", "Lakme", 399, 499, "Sun Protection", "Sunscreen", "", "Non-greasy matte-finish sunscreen with broad spectrum protection."],
  ["Hydro Boost Water Gel", "Neutrogena", 899, 1099, "Hydration", "Face", "", "Hyaluronic acid water gel for 72-hour hydration."],
  ["Gentle Skin Cleanser", "Cetaphil", 459, 549, "Deep Cleanse", "Face", "", "Dermatologist-recommended gentle daily cleanser."],
  ["Glow Sunscreen SPF 50", "Aqualogica", 399, 499, "Sun Protection", "Sunscreen", "", "Watermelon and hyaluronic sunscreen with a natural glow finish."],
  ["Ubtan Face Mask", "Mamaearth", 299, 399, "Deep Cleanse", "Face", "", "Turmeric and saffron face mask for natural glow."],
  ["E-Luminence Facial Oil", "Plum", 650, 825, "Anti-Aging", "Face", "", "Nourishing facial oil rich in vitamin E."],
  ["Vitamin C Foaming Face Wash", "WOW Skin Science", 249, 319, "Brightening", "Face", "", "Foaming face wash infused with vitamin C and turmeric."],
  ["Onion Black Seed Hair Oil", "WOW Skin Science", 349, 449, "Hydration", "Hair", "", "Hair oil blend to reduce hair fall and add shine."],
  ["Retinol Night Repair Cream", "Minimalist", 799, 999, "Anti-Aging", "Face", "", "0.3% retinol night cream to reduce fine lines."],
];

// Seed (or reseed) products so the catalog reflects the real product list above
const existing = db.prepare("SELECT name FROM products WHERE name = ?").get(REAL_SEED[0][0]);
if (!existing) {
  db.exec("DELETE FROM products");
  const insert = db.prepare(`INSERT INTO products (name, brand, price, mrp, concern, category, image_url, description) VALUES (?,?,?,?,?,?,?,?)`);
  const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(...r)));
  insertMany(REAL_SEED);
}


module.exports = db;
