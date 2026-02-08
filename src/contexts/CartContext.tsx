import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  addProductToCart: (product: Product, option?: "left" | "right") => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "zexofile_cart_v1";

const CartContext = createContext<CartContextType | null>(null);

const safeParseCart = (raw: string | null): CartItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => safeParseCart(localStorage.getItem(CART_STORAGE_KEY)));

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const addProductToCart = (product: Product, option: "left" | "right" = "left") => {
    const price =
      option === "left"
        ? product.leftButton?.price ?? product.price
        : product.rightButton?.price ?? product.price;

    const label =
      option === "left"
        ? product.leftButton?.label || "Source Code"
        : product.rightButton?.label || "Get Customized";

    addToCart({
      product,
      selectedOption: option,
      price,
      label,
    });
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = useMemo(
    () => ({ cartItems, addToCart, addProductToCart, removeFromCart, clearCart }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
