const express = require("express");
const db = require("./db");
const router = express.Router();

// GET /api/products?search=&category=&concern=
router.get("/", (req, res) => {
  const { search, category, concern } = req.query;
  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];
  if (search) { query += " AND (name LIKE ? OR brand LIKE ? OR concern LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (category && category !== "All") { query += " AND category = ?"; params.push(category); }
  if (concern) { query += " AND concern = ?"; params.push(concern); }
  const products = db.prepare(query).all(...params);
  res.json(products);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

module.exports = router;
