import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Frontend-only shopping cart. State lives in React + localStorage; there is no
// backend. "Checkout" just builds a WhatsApp message (see cartWhatsappUrl).
const CartContext = createContext(null);
const STORAGE_KEY = 'b2you-cart';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Drop anything malformed so a bad localStorage value can't crash the app.
    return parsed.filter((it) => it && it.key && it.title).map((it) => ({
      ...it,
      qty: Math.max(1, Number(it.qty) || 1),
      price: it.price == null ? null : Number(it.price),
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial);
  const [isOpen, setIsOpen] = useState(false);
  // Increments on every "adding" action (add / increment) so the UI can react
  // to a product being added — e.g. revealing the header so the cart is in view.
  const [addTick, setAddTick] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or unavailable: keep the in-memory cart working anyway */
    }
  }, [items]);

  const addItem = useCallback((item) => {
    if (!item || !item.key) return;
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.key === item.key);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setAddTick((t) => t + 1);
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }, []);

  const increment = useCallback((key) => {
    setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty: p.qty + 1 } : p)));
    setAddTick((t) => t + 1);
  }, []);

  const decrement = useCallback((key) => {
    setItems((prev) =>
      prev.flatMap((p) => {
        if (p.key !== key) return [p];
        const q = p.qty - 1;
        return q <= 0 ? [] : [{ ...p, qty: q }];
      })
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((o) => !o), []);

  const count = useMemo(() => items.reduce((n, it) => n + it.qty, 0), [items]);
  const total = useMemo(
    () => items.reduce((s, it) => s + (it.price != null ? it.price * it.qty : 0), 0),
    [items]
  );
  const hasUnpriced = useMemo(() => items.some((it) => it.price == null), [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      addTick,
      count,
      total,
      hasUnpriced,
      addItem,
      removeItem,
      increment,
      decrement,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [items, isOpen, addTick, count, total, hasUnpriced, addItem, removeItem, increment, decrement, clearCart, openCart, closeCart, toggleCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
