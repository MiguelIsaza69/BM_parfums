"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />
            <div className="px-6 md:px-12 lg:px-24 mb-12">
                <h1 className="text-4xl md:text-6xl font-serif mb-4">Categorías</h1>
                <p className="text-neutral-400 font-mono text-sm max-w-xl">
                    Encuentra tu esencia ideal explorando nuestras familias olfativas.
                </p>
            </div>

            <div className="px-6 md:px-12 lg:px-24 pb-24 grid grid-cols-[repeat(auto-fit,minmax(300px,400px))] gap-6 justify-center">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/catalogo?category=${encodeURIComponent(cat.name)}`}
                        className="group border border-white/10 p-8 hover:border-gold transition-colors block bg-neutral-900/20"
                    >
                        <h2 className="text-2xl font-serif mb-4 group-hover:text-gold transition-colors">{cat.name}</h2>
                        <div className="flex items-center gap-2 text-sm font-mono text-neutral-400 group-hover:text-white transition-colors">
                            VER PRODUCTOS <ArrowRight size={14} />
                        </div>
                    </Link>
                ))}
            </div>
            <Footer />
        </main>
    );
}
