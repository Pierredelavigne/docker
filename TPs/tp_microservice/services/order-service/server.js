const express = require("express");
const db = require("./db");

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || "3001");

app.get("/health", async (req, res) => {
  try {
    await db.health();
    res.json({ status: "UP" });
  } catch {
    res.status(503).json({ status: "DOWN" });
  }
});

app.post("/orders", async (req, res) => {
  const { productId, quantity } = req.body || {};
  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "INVALID_INPUT" });
  }

  const row = await db.createOrder(productId, quantity);
  res.status(201).json({
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    status: row.status,
    createdAt: row.created_at
  });
});

app.get("/orders", async (req, res) => {
  const rows = await db.listOrders();
  res.json(rows.map(x => ({
    id: x.id,
    productId: x.product_id,
    quantity: x.quantity,
    status: x.status,
    createdAt: x.created_at
  })));
});

app.listen(PORT, () => {
  console.log(`order-service listening on ${PORT}`);
});