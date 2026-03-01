"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function CategoryGrid() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isInteracting, setIsInteracting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Drag to scroll state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

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

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || categories.length === 0 || isInteracting || isDragging) return;

        let animationFrameId: number;
        const scroll = () => {
            if (container) {
                container.scrollLeft += 0.8;
                if (container.scrollLeft >= container.scrollWidth / 2) {
                    container.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [categories, isInteracting, isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setIsInteracting(true);
        const container = scrollRef.current;
        if (container) {
            setStartX(e.pageX - container.offsetLeft);
            setScrollLeft(container.scrollLeft);
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsInteracting(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsInteracting(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const container = scrollRef.current;
        if (container) {
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            container.scrollLeft = scrollLeft - walk;
        }
    };

    if (categories.length === 0) return null;

    return (
        <section className="bg-black py-12 border-b border-white/10 overflow-hidden">
            <div className="flex justify-between items-end px-6 md:px-12 mb-8">
                <h2 className="text-4xl md:text-6xl font-serif">Categorías</h2>
                <span className="font-mono text-sm">[01 — {categories.length.toString().padStart(2, '0')}]</span>
            </div>

            <div className="relative w-full">
                <div
                    ref={scrollRef}
                    className={`flex overflow-x-auto gap-6 px-6 md:px-12 hide-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseEnter={() => setIsInteracting(true)}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={() => setIsInteracting(true)}
                    onTouchEnd={() => setIsInteracting(false)}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {/* Double the categories for seamless looping */}
                    {[...categories, ...categories].map((cat, i) => (
                        <Link
                            key={`${cat.id}-${i}`}
                            href={`/catalogo?category=${encodeURIComponent(cat.name)}`}
                            className="w-[260px] h-[340px] md:w-[320px] md:h-[420px] relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 shrink-0 transform hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-black/40"
                            draggable={false}
                        >
                            <Image
                                src={cat.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500"}
                                alt={cat.name}
                                fill
                                className="object-cover xl:grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-center z-10">
                                <span className="font-mono text-lg md:text-xl tracking-widest text-gold xl:text-white xl:group-hover:text-gold transition-colors">{cat.name}</span>
                                <span className="text-white xl:group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
