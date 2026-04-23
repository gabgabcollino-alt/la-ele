import React, { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);

const STORAGE_KEY = "tbx_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product_id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price_cents: product.price_cents,
          category_label: product.category_label,
          image_url: product.image_url || null,
          quantity: qty,
        },
      ];
    });
    setOpen(true);
  };

  const removeItem = (id) =>
    setItems((p) => p.filter((i) => i.product_id !== id));

  const updateQty = (id, qty) =>
    setItems((p) =>
      p.map((i) =>
        i.product_id === id ? { ...i, quantity: Math.max(1, qty) } : i
      )
    );

  const clear = () => setItems([]);

  const subtotal = items.reduce(
    (s, i) => s + i.price_cents * i.quantity,
    0
  );
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clear,
        subtotal,
        count,
        open,
        setOpen,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
