const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || "5432"),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

async function health() {
  await pool.query("SELECT 1");
  return true;
}

async function createOrder(productId, quantity) {
  const r = await pool.query(
    "INSERT INTO orders(product_id, quantity, status) VALUES($1,$2,'CREATED') RETURNING id, product_id, quantity, status, created_at",
    [productId, quantity]
  );
  return r.rows[0];
}

async function listOrders() {
  const r = await pool.query(
    "SELECT id, product_id, quantity, status, created_at FROM orders ORDER BY id DESC",
    []
  );
  return r.rows;
}

module.exports = { health, createOrder, listOrders };