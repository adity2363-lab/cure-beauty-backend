# Cure Beauty — Backend API

Ek working backend: products, OTP-based login, addresses, aur orders — SQLite database ke saath (koi separate database install nahi karna, ek file mein sab data save hota hai: `cure-beauty.db`).

## Run kaise karo (apne laptop/Claude Code pe)

```
npm install
node src/server.js
```

Server chalega: `http://localhost:4000`

## API Endpoints

### Auth
- `POST /api/auth/send-otp` — body: `{ "phone": "9876543210" }` → OTP generate karta hai (abhi console mein print hota hai, real SMS ke liye niche dekho)
- `POST /api/auth/verify-otp` — body: `{ "phone": "...", "code": "1234", "name": "..." }` → login token deta hai

### Products
- `GET /api/products` — sab products, `?search=serum`, `?category=Face`, `?concern=Acne` se filter
- `GET /api/products/:id` — single product

### Addresses (login required — header: `Authorization: Bearer <token>`)
- `GET /api/addresses`
- `POST /api/addresses` — body: `{ "label", "line", "city", "pincode" }`
- `DELETE /api/addresses/:id`

### Orders (login required)
- `GET /api/orders` — order history
- `POST /api/orders` — body: `{ "addressId": 1, "items": [{ "productId": 1, "quantity": 2 }] }`

## Real SMS OTP connect karne ke liye
`src/routes/auth.js` mein `[DEV] OTP for...` line ke paas MSG91 ya Twilio ka API call add karna hoga. Abhi OTP response mein `dev_otp` field mein wapas aata hai testing ke liye — production mein yeh line hataani hogi.

## Next steps
1. Frontend (React app) ko is API se connect karna — abhi frontend mein `useState` se data local rehta hai, usko yahan se `fetch()` calls se replace karna hoga
2. Payment gateway (Razorpay) add karna order confirm hone se pehle
3. Production database — abhi SQLite hai (chhote scale ke liye theek), scale badhne pe PostgreSQL pe shift kar sakte ho
4. Deploy karna kahin (Railway/Render) taaki 24/7 chalta rahe
