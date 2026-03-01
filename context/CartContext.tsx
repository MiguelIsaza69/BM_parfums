"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
    id: string; // product id
    name: string;
    price: number;
    image: string;
    brand: string;
    quantity: number;
    ml?: number;
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: any, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, newQuantity: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("bm_cart");
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("bm_cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (product: any, quantity = 1) => {
        setItems(current => {
            const existing = current.find(item => item.id === product.id);
            if (existing) {
                return current.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Extract main image safely
            let mainImage = "/placeholder.jpg";
            if (Array.isArray(product.images) && product.images.length > 0) mainImage = product.images[0];
            else if (typeof product.images === 'string') {
                // Try to handle potentially malformed string arrays or single strings
                const val = product.images.trim();
                if (val.startsWith('[') && val.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(val);
                        if (parsed.length > 0) mainImage = parsed[0];
                    } catch { }
                } else {
                    mainImage = val.split(',')[0];
                }
            }

            const hasDiscount = product.discount_percentage > 0;
            const finalPrice = hasDiscount
                ? Number(product.price) * (1 - product.discount_percentage / 100)
                : Number(product.price);

            const newItem: CartItem = {
                id: product.id,
                name: product.name,
                price: finalPrice,
                image: mainImage,
                brand: product.brands?.name || product.brandName || "BM", // Handle both detailed and flattened structures
                quantity,
                ml: product.volume_ml
            };
            return [...current, newItem];
        });
        setIsOpen(true); // Open cart when adding
    };

    const removeItem = (id: string) => {
        setItems(current => current.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItems(current => current.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, isOpen, setIsOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
