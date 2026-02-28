"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            const { data } = await supabase.from('brands').select('id, name, logo_url').order('name');
            if (data) setBrands(data);
        };
        fetchBrands();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />
            <div className="px-6 md:px-12 lg:px-24 mb-12 text-right lg:text-left">
                <h1 className="text-4xl md:text-6xl font-serif mb-4">Marcas</h1>
                <p className="text-neutral-400 font-mono text-sm max-w-xl ml-auto lg:ml-0">
                    Descubre nuestra curada selección de casas perfumeras.
                </p>
            </div>

            <div className="px-6 md:px-12 lg:px-24 pb-24 grid grid-cols-[repeat(auto-fit,minmax(200px,260px))] gap-6 justify-center">
                {brands.map((brand) => (
                    <Link
                        key={brand.id}
                        href={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
                        className="group border border-white/10 p-8 hover:border-gold transition-colors block bg-neutral-900/20 text-center flex flex-col items-center justify-center aspect-square relative"
                    >
                        {brand.logo_url ? (
                            <div className="w-full h-3/4 flex items-center justify-center p-4">
                                <img
                                    src={brand.logo_url}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100 invert"
                                />
                            </div>
                        ) : (
                            <h2 className="text-xl font-serif mb-2 group-hover:text-gold transition-colors">{brand.name}</h2>
                        )}
                        <div className="text-[10px] font-mono text-neutral-500 group-hover:text-white transition-colors mt-auto tracking-widest uppercase absolute bottom-6">
                            VER COLECCIÓN
                        </div>
                    </Link>
                ))}
            </div>
            <Footer />
        </main>
    );
}
