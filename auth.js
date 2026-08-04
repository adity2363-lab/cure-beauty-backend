const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";

// POST /api/auth/send-otp  { phone }
router.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length !== 10) return res.status(400).json({ error: "Valid 10-digit phone required" });

  const code = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
  db.prepare("INSERT INTO otps (phone, code, expires_at) VALUES (?,?,?)").run(phone, code, expiresAt);

  // TODO: connect a real SMS gateway here (MSG91 / Twilio) to actually send `code` to `phone`.
  console.log(`[DEV] OTP for ${phone}: ${code}`);

  res.json({ success: true, message: "OTP sent", dev_otp: code }); // dev_otp is only for local testing; remove in production
});

// POST /api/auth/verify-otp  { phone, code, name? }
router.post("/verify-otp", (req, res) => {
  const { phone, code, name } = req.body;
  const row = db.prepare("SELECT * FROM otps WHERE phone = ? ORDER BY id DESC LIMIT 1").get(phone);
  if (!row || row.code !== code || row.expires_at < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  let user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  if (!user) {
    const info = db.prepare("INSERT INTO users (phone, name) VALUES (?,?)").run(phone, name || "User");
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  } else if (name && name !== user.name) {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, user.id);
    user.name = name;
  }

  const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ success: true, token, user: { id: user.id, name: user.name, phone: user.phone } });
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });
  try {
    const payload = jwt.verify(header.replace("Bearer ", ""), JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { router, authMiddleware };
