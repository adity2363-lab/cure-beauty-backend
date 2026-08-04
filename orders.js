require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { router: authRouter } = require("./routes/auth");
const productsRouter = require("./routes/products");
const addressesRouter = require("./routes/addresses");
const ordersRouter = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "Cure Beauty API running" }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/orders", ordersRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Cure Beauty backend running on http://localhost:${PORT}`));
