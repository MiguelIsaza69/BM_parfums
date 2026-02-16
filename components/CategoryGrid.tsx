"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const categories = [
    { name: "CITRUS", img: "https://images.unsplash.com/photo-1597524021703-e847321e25e9?w=500" },
    { name: "SWEET", img: "https://images.unsplash.com/photo-1595425207086-6245a44358a6?w=500" },
    { name: "FRESH", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" },
    { name: "FLORAL", img: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=500" },
    { name: "WOODY", img: "https://images.unsplash.com/photo-1519669576417-c8e731631b54?w=500" },
    { name: "SPICY", img: "https://images.unsplash.com/photo-1595425207086-6245a44358a6?w=500" },
    { name: "ORIENTAL", img: "https://images.unsplash.com/photo-1616422321453-294c65e23653?w=500" },
    { name: "FRUITY", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" },
    { name: "AQUATIC", img: "https://images.unsplash.com/photo-1512777576255-a876cea05f88?w=500" }
];

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
                        <div
                            key={i}
                            className="w-[300px] h-[400px] md:w-[350px] md:h-[450px] relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 shrink-0 transform hover:scale-105 transition-all duration-500"
                        >
                            <Image
                                src={cat.image_url || "https://images.unsplash.com/photo-1597524021703-e847321e25e9?w=500"}
                                alt={cat.name}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                            {/* Label */}
                            <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-center z-10">
                                <span className="font-mono text-xl tracking-widest text-white group-hover:text-gold transition-colors">{cat.name}</span>
                                <span className="text-white group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
