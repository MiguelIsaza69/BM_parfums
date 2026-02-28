"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function CategoryGrid() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    if (categories.length === 0) return null;

    return (
        <section className="bg-black py-12 border-b border-white/10 overflow-hidden">
            <div className="flex justify-between items-end px-6 md:px-12 mb-8">
                <h2 className="text-4xl md:text-6xl font-serif">Categorias</h2>
                <span className="font-mono text-sm">[01 — {categories.length.toString().padStart(2, '0')}]</span>
            </div>

            <div className="relative w-full hover-pause">
                <div className="flex w-max animate-marquee marquee-fast gap-6">
                    {[...categories, ...categories].map((cat, i) => (
                        <Link
                            key={i}
                            href={`/catalogo?category=${encodeURIComponent(cat.name)}`}
                            className="w-[300px] h-[400px] md:w-[350px] md:h-[450px] relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 shrink-0 transform hover:scale-105 transition-all duration-500"
                        >
                            <Image
                                src={cat.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500"}
                                alt={cat.name}
                                fill
                                className="object-cover xl:grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 xl:opacity-60 xl:group-hover:opacity-40 transition-opacity" />

                            {/* Label */}
                            <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-center z-10">
                                <span className="font-mono text-xl tracking-widest text-gold xl:text-white xl:group-hover:text-gold transition-colors active:text-gold">{cat.name}</span>
                                <span className="text-white xl:group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
