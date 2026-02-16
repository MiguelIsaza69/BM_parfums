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
            const { data } = await supabase.from('brands').select('*').order('name');
            if (data) setBrands(data);
        };
        fetchBrands();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />
            <div className="px-6 md:px-12 lg:px-24 mb-12">
                <h1 className="text-4xl md:text-6xl font-serif mb-4">Marcas</h1>
                <p className="text-neutral-400 font-mono text-sm max-w-xl">
                    Descubre nuestra curada selección de casas perfumeras.
                </p>
            </div>

            <div className="px-6 md:px-12 lg:px-24 pb-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map((brand) => (
                    <Link
                        key={brand.id}
                        href={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
                        className="group border border-white/10 p-8 hover:border-gold transition-colors block bg-neutral-900/20 text-center flex flex-col items-center justify-center aspect-square"
                    >
                        <h2 className="text-xl font-serif mb-2 group-hover:text-gold transition-colors">{brand.name}</h2>
                        <div className="text-xs font-mono text-neutral-500 group-hover:text-white transition-colors mt-auto">
                            VER COLECCIÓN
                        </div>
                    </Link>
                ))}
            </div>
            <Footer />
        </main>
    );
}
