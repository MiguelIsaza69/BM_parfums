"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

export function ProductGrid() {
    const { addItem } = useCart();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('products')
                .select('*, brands(name)')
                .order('created_at', { ascending: false })
                .limit(8);

            if (data) {
                setProducts(data);
            }
        };

        fetchProducts();
    }, []);

    // Placeholder skeleton or loading state could be added here
    if (products.length === 0) return null;

    return (
        <section className="bg-black py-16 px-8 md:px-24 lg:px-48">
            <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                <h2 className="text-4xl md:text-6xl font-serif">Los mas esperados</h2>
                <span className="font-mono text-sm">[01 — {products.length.toString().padStart(2, '0')}]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                    // Robust Image Extraction
                    let mainImage = "/placeholder.jpg";
                    try {
                        if (Array.isArray(product.images) && product.images.length > 0) {
                            mainImage = product.images[0];
                        } else if (typeof product.images === 'string') {
                            const trimmed = product.images.trim();
                            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                                const parsed = JSON.parse(trimmed);
                                if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
                            } else {
                                mainImage = trimmed.split(',')[0].replace(/^['"\[]+|['"\]]+$/g, '');
                            }
                        }
                    } catch (e) { console.error("Error parsing product image:", e); }
                    if (!mainImage || mainImage.length < 5) mainImage = "/placeholder.jpg";

                    return (
                        <div key={product.id} className="group relative border border-white/10 p-6 hover:border-gold/50 transition-colors bg-neutral-900/20">
                            <div className="relative h-[250px] w-full flex items-center justify-center mb-6 bg-white p-4 overflow-hidden">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="object-contain max-h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center text-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-10">
                                    <p className="text-gray-300 text-xs mb-6 leading-relaxed font-mono line-clamp-3">{product.description || "Sin descripción"}</p>
                                    <button
                                        onClick={() => addItem(product)}
                                        className="bg-gold text-black font-bold uppercase py-2 px-6 min-w-[140px] text-xs hover:bg-white transition-colors flex items-center gap-2 mb-2 w-auto justify-center"
                                    >
                                        <ShoppingCart size={14} />
                                        AGREGAR
                                    </button>
                                    <Link href={`/product/${product.id}`} className="w-full">
                                        <button className="w-full text-white border border-white/30 font-mono uppercase py-2 px-4 text-[10px] hover:border-gold hover:text-gold transition-colors">
                                            Ver Detalles
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <p className="text-[10px] text-muted mb-1 font-mono tracking-widest uppercase">{product.brands?.name || "BM"}</p>
                                <h3 className="text-lg font-serif mb-2 truncate w-full">{product.name}</h3>
                                <p className="text-gold font-mono text-sm">${Number(product.price).toLocaleString()}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
