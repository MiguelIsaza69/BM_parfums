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
                <h2 className="text-4xl md:text-6xl font-serif">Los más esperados</h2>
                <span className="font-mono text-sm">[01 — {products.length.toString().padStart(2, '0')}]</span>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                {products.filter(p => p.is_active !== false).map((product, idx) => {
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
                        <div
                            key={product.id}
                            className="group relative border border-white/5 p-6 hover:border-gold/30 transition-all duration-700 bg-neutral-900/10 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="relative h-[280px] w-full flex items-center justify-center mb-6 overflow-hidden transition-transform duration-700 group-hover:shadow-2xl shadow-black/50 p-4">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-contain w-full h-full transition-all duration-1000 ease-out xl:group-hover:scale-110 xl:group-hover:rotate-1"
                                />

                                {/* Hover Overlay - Desktop Only (XL screens > 1280px) */}
                                <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center text-center p-8 opacity-0 xl:group-hover:opacity-100 transition-all duration-500 ease-in-out backdrop-blur-sm z-10 invisible xl:group-hover:visible translate-y-2 xl:group-hover:translate-y-0 max-xl:hidden">
                                    <div className="w-12 h-px bg-gold/50 mb-6 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
                                    <p className="text-neutral-400 text-[10px] mb-8 leading-relaxed font-mono uppercase tracking-[3px] line-clamp-4 px-2 italic">{product.description || "Nuestra esencia única, capturada en un frasco de alta perfumería."}</p>

                                    <div className="flex flex-col gap-3 w-full max-w-[160px]">
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
                                            className="bg-gold text-black font-bold uppercase py-3 px-4 text-[10px] hover:bg-white hover:tracking-[2px] transition-all duration-300 flex items-center gap-2 justify-center"
                                        >
                                            <ShoppingCart size={12} />
                                            AGREGAR
                                        </button>
                                        <Link href={`/product/${product.id}`} className="w-full">
                                            <button className="w-full text-white/50 border border-white/10 font-mono uppercase py-2 px-4 text-[9px] hover:border-white hover:text-white hover:bg-white/5 transition-all duration-300 tracking-[2px]">
                                                Detalles
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="w-12 h-px bg-gold/50 mt-6 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200" />
                                </div>
                            </div>

                            <Link href={`/product/${product.id}`} className="flex flex-col items-center text-center transition-all duration-500 xl:group-hover:translate-y-[-4px]">
                                <p className="text-[9px] text-gold/60 mb-2 font-mono tracking-[4px] uppercase">{product.brands?.name || "BM PARFUMS"}</p>
                                <h3 className="text-base font-serif mb-3 truncate w-full tracking-tight text-white/90 group-hover:text-white transition-colors">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-px w-4 bg-white/10 group-hover:w-8 group-hover:bg-gold/30 transition-all duration-500" />
                                    <p className="text-gold font-mono text-xs font-bold tracking-widest">${Number(product.price).toLocaleString('es-CO')}</p>
                                    <div className="h-px w-4 bg-white/10 group-hover:w-8 group-hover:bg-gold/30 transition-all duration-500" />
                                </div>
                            </Link>

                            {/* Mobile/Tablet Permanent Button (XL screens < 1280px) */}
                            <div className="mt-6 xl:hidden">
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
                                    className="w-full bg-gold text-black font-bold uppercase py-4 px-4 text-xs flex items-center gap-3 justify-center active:bg-white transition-colors rounded-sm shadow-lg shadow-gold/10"
                                >
                                    <ShoppingCart size={16} />
                                    AGREGAR AL CARRITO
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
