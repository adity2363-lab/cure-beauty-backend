const express = require("express");
const db = require("../db");
const { authMiddleware } = require("./auth");
const router = express.Router();

router.use(authMiddleware);

// GET /api/orders  - order history for logged-in user
router.get("/", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(req.userId);
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare(`SELECT oi.quantity, oi.price, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`).all(o.id),
  }));
  res.json(withItems);
});

// POST /api/orders  { addressId, items: [{ productId, quantity }] }
router.post("/", (req, res) => {
  const { addressId, items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "No items in order" });

  let total = 0;
  const priced = items.map((it) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(it.productId);
    if (!product) throw new Error("Invalid product");
    total += product.price * it.quantity;
    return { ...it, price: product.price };
  });

  const orderInfo = db.prepare("INSERT INTO orders (user_id, address_id, total) VALUES (?,?,?)").run(req.userId, addressId || null, total);
  const orderId = orderInfo.lastInsertRowid;

  const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)");
  priced.forEach((it) => insertItem.run(orderId, it.productId, it.quantity, it.price));

  res.json({ success: true, orderId, total });
});

module.exports = router;
