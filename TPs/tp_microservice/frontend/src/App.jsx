import React, { useEffect, useMemo, useState } from "react";
import { getJson, postJson } from "./api/http.js";

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productId, setProductId] = useState("p1");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const canOrder = useMemo(() => {
    return productId && Number.isInteger(Number(quantity)) && Number(quantity) > 0;
  }, [productId, quantity]);

  async function refresh() {
    setError("");
    try {
      const [p, o] = await Promise.all([
        getJson("/catalog/products"),
        getJson("/orders/orders")
      ]);
      setProducts(p);
      setOrders(o);
      if (p.length > 0 && !p.find(x => x.id === productId)) setProductId(p[0].id);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function createOrder() {
    if (!canOrder) return;
    setError("");
    try {
      await postJson("/orders/orders", { productId, quantity: Number(quantity) });
      await refresh();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>ShopLite</h1>

      {error && (
        <div style={{ border: "1px solid #e88", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>Catalogue</h2>
          <button onClick={refresh}>Rafraîchir</button>
          <ul>
            {products.map(p => (
              <li key={p.id}>
                <b>{p.name}</b> — {p.price} €
              </li>
            ))}
          </ul>
        </section>

        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>Créer une commande</h2>
          <div style={{ display: "grid", gap: 8 }}>
            <label>
              Produit
              <select value={productId} onChange={e => setProductId(e.target.value)} style={{ marginLeft: 8 }}>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantité
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ marginLeft: 8, width: 100 }} />
            </label>

            <button onClick={createOrder} disabled={!canOrder}>Commander</button>
          </div>
        </section>

        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, gridColumn: "1 / span 2" }}>
          <h2 style={{ marginTop: 0 }}>Commandes</h2>
          <button onClick={refresh}>Rafraîchir</button>
          <ul>
            {orders.map(o => (
              <li key={o.id}>
                <b>#{o.id}</b> — {o.productId} x{o.quantity} — {o.status}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}