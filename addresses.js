const express = require("express");
const db = require("./db");
const { authMiddleware } = require("./auth");
const router = express.Router();

router.use(authMiddleware);

// GET /api/addresses
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM addresses WHERE user_id = ?").all(req.userId);
  res.json(rows);
});

// POST /api/addresses  { label, line, city, pincode }
router.post("/", (req, res) => {
  const { label, line, city, pincode } = req.body;
  if (!line || !city || !pincode) return res.status(400).json({ error: "line, city, pincode required" });
  const info = db.prepare("INSERT INTO addresses (user_id, label, line, city, pincode) VALUES (?,?,?,?,?)").run(req.userId, label || "Home", line, city, pincode);
  res.json(db.prepare("SELECT * FROM addresses WHERE id = ?").get(info.lastInsertRowid));
});

// DELETE /api/addresses/:id
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
