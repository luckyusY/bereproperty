import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, toCartItems } from './api';

const AuthContext = createContext(null);
const CartContext = createContext(null);
const GUEST_CART_KEY = 'bereproperty-guest-cart-v2';
const LEGACY_GUEST_CART_KEY = 'toolbay-guest-cart-v2';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api('/auth/me').then(({ user: current, store: currentStore }) => { setUser(current); setStore(currentStore); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  const login = useCallback(async (email, password) => { const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setUser(result.user); setStore(result.store || null); return result; }, []);
  const register = useCallback(async payload => { const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }); setUser(result.user); setStore(result.store || null); return result; }, []);
  const logout = useCallback(async () => { await api('/auth/logout', { method: 'POST' }).catch(() => {}); setUser(null); setStore(null); }, []);
  const value = useMemo(() => ({ user, store, loading, login, register, logout }), [user, store, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

function readGuest() {
  try {
    let value = localStorage.getItem(GUEST_CART_KEY);
    if (value === null) {
      value = localStorage.getItem(LEGACY_GUEST_CART_KEY);
      if (value !== null) { localStorage.setItem(GUEST_CART_KEY, value); localStorage.removeItem(LEGACY_GUEST_CART_KEY); }
    }
    return JSON.parse(value || '[]');
  } catch { return []; }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(readGuest);
  const [accountCartReady, setAccountCartReady] = useState(false);
  const syncedUser = useRef(null);
  const latestItems = useRef(items);

  useEffect(() => { latestItems.current = items; }, [items]);

  useEffect(() => {
    let active = true;
    setAccountCartReady(false);
    if (user?.role === 'buyer') {
      const guest = readGuest();
      const carry = syncedUser.current && syncedUser.current !== user.id ? latestItems.current : [];
      const mergeItems = [...guest, ...carry];
      if (guest.length) localStorage.removeItem(GUEST_CART_KEY);
      api('/cart/merge', { method: 'POST', body: JSON.stringify({ items: mergeItems.map(({ product, quantity }) => ({ productId: product.id, quantity })) }) })
        .then(data => { if (active) { syncedUser.current = user.id; setItems(toCartItems(data.items)); setAccountCartReady(true); } })
        .catch(() => { if (active) { if (mergeItems.length) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(mergeItems)); setAccountCartReady(true); } });
    } else {
      if (user?.role === 'seller' || user?.role === 'admin') { setItems([]); syncedUser.current = null; }
      if (!user) syncedUser.current = null;
      setAccountCartReady(true);
    }
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (user?.role === 'buyer') {
      if (syncedUser.current !== user.id) return;
      if (accountCartReady) api('/cart', { method: 'PUT', body: JSON.stringify({ items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })) }) }).catch(() => {});
    } else if (!user) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }, [items, user, accountCartReady]);

  const add = useCallback((product, quantity = 1) => setItems(current => {
    const found = current.find(item => String(item.product.id) === String(product.id));
    const available = Math.max(0, Number(product.stock) || 0);
    if (!available) return current;
    return found ? current.map(item => String(item.product.id) === String(product.id) ? { ...item, quantity: Math.min(available, item.quantity + quantity) } : item) : [...current, { product, quantity: Math.min(available, quantity) }];
  }), []);
  const setQuantity = useCallback((productId, quantity) => setItems(current => quantity < 1 ? current.filter(item => String(item.product.id) !== String(productId)) : current.map(item => String(item.product.id) === String(productId) ? { ...item, quantity: Math.min(item.product.stock || 999, quantity) } : item)), []);
  const remove = useCallback(productId => setItems(current => current.filter(item => String(item.product.id) !== String(productId))), []);
  const clear = useCallback(() => { setItems([]); localStorage.removeItem(GUEST_CART_KEY); }, []);
  const value = useMemo(() => ({ items, add, setQuantity, remove, clear, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) }), [items, add, setQuantity, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
