const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // change this on Render (Environment tab)

// POST /api/admin/login  { password }
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Wrong password" });
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token });
});

function adminOnly(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(header.replace("Bearer ", ""), JWT_SECRET);
    if (payload.role !== "admin") throw new Error();
    next();
  } catch {
    res.status(401).json({ error: "Invalid admin token" });
  }
}

// GET /api/admin/orders  - every order, newest first, with customer + address + items
router.get("/orders", adminOnly, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name as customer_name, u.phone as customer_phone,
           a.label as addr_label, a.line as addr_line, a.city as addr_city, a.pincode as addr_pincode
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN addresses a ON a.id = o.address_id
    ORDER BY o.id DESC
  `).all();

  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare(`SELECT oi.quantity, oi.price, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`).all(o.id),
  }));
  res.json(withItems);
});

// PATCH /api/admin/orders/:id/status  { status }
router.patch("/orders/:id/status", adminOnly, (req, res) => {
  const { status } = req.body;
  const allowed = ["confirmed", "packed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});

module.exports = router;
