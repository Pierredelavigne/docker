const express = require("express");

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || "3000");

const products = [
  { id: "p1", name: "Clavier", price: 49.9 },
  { id: "p2", name: "Souris", price: 19.9 },
  { id: "p3", name: "Ecran", price: 179.9 }
];

app.get("/health", (req, res) => res.json({ status: "UP" }));

app.get("/products", (req, res) => res.json(products));

app.get("/products/:id", (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "NOT_FOUND" });
  res.json(p);
});

app.listen(PORT, () => {
  console.log(`catalog-service listening on ${PORT}`);
});