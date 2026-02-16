"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function BrandTicker() {
    const [brands, setBrands] = useState<string[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            const { data } = await supabase
                .from('brands')
                .select('name')
                .order('name', { ascending: true });

            if (data) {
                setBrands(data.map(b => b.name));
            }
        };

        fetchBrands();
    }, []);

    if (brands.length === 0) return null;

    return (
        <div className="w-full overflow-hidden border-b border-white/10 bg-black py-8">
            <div className="relative flex w-full overflow-x-hidden hover-pause group">
                <div className="animate-marquee marquee-slow whitespace-nowrap py-12 flex items-center">
                    {[...brands, ...brands, ...brands].map((brand, index) => (
                        <span key={index} className="mx-8 text-4xl md:text-6xl font-serif text-neutral-800 hover:text-gold transition-all duration-300 cursor-pointer inline-block transform hover:scale-110">
                            {brand}
                        </span>
                    ))}
                </div>
                <div className="absolute top-0 animate-marquee2 marquee-slow whitespace-nowrap py-12 flex items-center">
                    {[...brands, ...brands, ...brands].map((brand, index) => (
                        <span key={`dup-${index}`} className="mx-8 text-4xl md:text-6xl font-serif text-neutral-800 hover:text-gold transition-all duration-300 cursor-pointer inline-block transform hover:scale-110">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
