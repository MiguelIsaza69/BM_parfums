"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
    id: string; // product id
    name: string;
    price: number;
    image: string;
    brand: string;
    quantity: number;
    quality: string;
    ml?: number;
    originalPrice?: number;
    discount?: number;
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: any, quantity?: number, selectedQuality?: string, selectedSize?: number, selectedPrice?: number, selectedDiscount?: number) => void;
    removeItem: (id: string, quality: string, ml?: number) => void;
    updateQuantity: (id: string, quality: string, ml: number | undefined, newQuantity: number) => void;
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

    const addItem = (product: any, quantity = 1, selectedQuality?: string, selectedSize?: number, selectedPrice?: number, selectedDiscount?: number) => {
        setItems(current => {
            // Default to product's base quality if not provided
            const quality = selectedQuality || product.quality || '1.1';
            const isOriginal = quality === 'Original';

            // Volume to use: either selectedSize or the product's default volume
            const volume = selectedSize || product.volume_ml || 0;

            // Check if this specific variant (id + quality + volume) is already in cart
            const existing = current.find(item =>
                item.id === product.id &&
                item.quality === quality &&
                (item.ml === volume)
            );

            if (existing) {
                return current.map(item =>
                    (item.id === product.id && item.quality === quality && item.ml === volume)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Extract main image safely
            let mainImage = "/placeholder.jpg";
            if (Array.isArray(product.images) && product.images.length > 0) mainImage = product.images[0];
            else if (typeof product.images === 'string') {
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

            // Determine Price
            let basePrice = selectedPrice !== undefined ? selectedPrice : Number(product.price);
            let discount = selectedDiscount !== undefined ? selectedDiscount : (Number(product.discount_percentage) || 0);

            if (selectedPrice === undefined && isOriginal) {
                basePrice = Number(product.price_original) || basePrice;
                discount = Number(product.discount_percentage_original) || 0;
            }

            const finalPrice = discount > 0
                ? basePrice * (1 - discount / 100)
                : basePrice;

            const newItem: CartItem = {
                id: product.id,
                name: product.name,
                price: finalPrice,
                image: mainImage,
                brand: product.brands?.name || product.brandName || "BM",
                quantity,
                quality,
                ml: volume,
                originalPrice: discount > 0 ? basePrice : undefined,
                discount: discount > 0 ? discount : undefined
            };
            return [...current, newItem];
        });
        setIsOpen(true);
    };

    const removeItem = (id: string, quality: string, ml?: number) => {
        setItems(current => current.filter(item => !(item.id === id && item.quality === quality && (ml === undefined || item.ml === ml))));
    };

    const updateQuantity = (id: string, quality: string, ml: number | undefined, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItems(current => current.map(item =>
            (item.id === id && item.quality === quality && item.ml === ml) ? { ...item, quantity: newQuantity } : item
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
