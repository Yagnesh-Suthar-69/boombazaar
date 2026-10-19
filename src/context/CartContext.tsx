'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string; // product id or hamper id
  name: string;
  slug: string;
  sku: string;
  price: number; // in paise
  salePrice?: number | null;
  image?: string;
  categoryName?: string;
  stock: number;
  quantity: number;
  itemType?: 'product' | 'hamper';
  includedProducts?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  calculatedTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'boombazaar_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryFeePaise, setDeliveryFeePaise] = useState(15000); // ₹150 default
  const [freeDeliveryThresholdPaise, setFreeDeliveryThresholdPaise] = useState(250000); // ₹2500 default

  // Load store settings dynamically
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.delivery_fee_rupees) {
          setDeliveryFeePaise(Number(data.settings.delivery_fee_rupees) * 100);
        }
        if (data.settings?.free_delivery_threshold_rupees) {
          setFreeDeliveryThresholdPaise(Number(data.settings.free_delivery_threshold_rupees) * 100);
        }
      })
      .catch(() => {});
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse cart storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to store cart', e);
    }
  }, [items, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const validQty = Math.min(quantity, product.stock);
        if (validQty <= 0) return prev;
        return [...prev, { ...product, quantity: validQty }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const clamped = Math.min(quantity, item.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= freeDeliveryThresholdPaise || subtotal === 0 ? 0 : deliveryFeePaise;
  const calculatedTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        freeDeliveryThreshold: freeDeliveryThresholdPaise,
        deliveryFee,
        calculatedTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
