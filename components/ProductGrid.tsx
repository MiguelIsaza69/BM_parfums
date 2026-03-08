"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
    const { addItem } = useCart();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('products')
                .select('*, brands(name)')
                .eq('is_active', true)
                .eq('is_favorite', true);

            if (data) {
                // Shuffle all favorites and pick 12 random ones
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                setProducts(shuffled.slice(0, 12));
            }
        };

        fetchProducts();
    }, []);

    // Placeholder skeleton or loading state could be added here
    if (products.length === 0) return null;

    return (
        <section className="bg-black py-16 px-6 md:px-12 lg:px-20">
            <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                <h2 className="text-4xl md:text-6xl font-serif">Los más esperados</h2>
                <span className="font-mono text-sm">[01 — {products.length.toString().padStart(2, '0')}]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.filter(p => p.is_active !== false).map((product, idx) => (
                    <ProductCard key={product.id} product={product} idx={idx} />
                ))}
            </div>
        </section>
    );
}
