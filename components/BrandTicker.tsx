"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export function BrandTicker() {
    const [brands, setBrands] = useState<string[]>([]);
    const [isInteracting, setIsInteracting] = useState(false);
    const scrollRef = typeof window !== 'undefined' ? (require('react').useRef<HTMLDivElement>(null)) : { current: null };

    // Drag to scroll state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const fetchBrands = async () => {
            const { data } = await supabase
                .from('brands')
                .select('name')
                .order('name', { ascending: true });

            if (data) setBrands(data.map(b => b.name));
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || brands.length === 0 || isInteracting || isDragging) return;

        let animationFrameId: number;
        const scroll = () => {
            if (container) {
                container.scrollLeft += 1.2; // Speed for brands
                if (container.scrollLeft >= container.scrollWidth / 2) {
                    container.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [brands, isInteracting, isDragging]);

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

    if (brands.length === 0) return null;

    return (
        <div className="w-full overflow-hidden border-b border-white/10 bg-black py-4 lg:py-8">
            <div
                ref={scrollRef}
                className={`flex overflow-x-auto whitespace-nowrap py-12 items-center hide-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseEnter={() => setIsInteracting(true)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => setIsInteracting(true)}
                onTouchEnd={() => setIsInteracting(false)}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {[...brands, ...brands].map((brand, index) => (
                    <Link
                        key={index}
                        href={`/catalogo?brand=${encodeURIComponent(brand)}`}
                        className="mx-8 text-4xl md:text-6xl font-serif text-neutral-500 xl:text-neutral-800 hover:text-gold transition-all duration-300 cursor-pointer inline-block transform hover:scale-110 active:text-gold active:scale-110 shrink-0"
                        draggable={false}
                    >
                        {brand}
                    </Link>
                ))}
            </div>
        </div>
    );
}
