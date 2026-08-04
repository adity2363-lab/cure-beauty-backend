require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { router: authRouter } = require("./auth");
const productsRouter = require("./products");
const addressesRouter = require("./addresses");
const ordersRouter = require("./orders");
const adminRouter = require("./admin");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "Cure Beauty API running" }));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Cure Beauty backend running on http://localhost:${PORT}`));
