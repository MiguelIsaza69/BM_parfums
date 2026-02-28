"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState<string>("/placeholder.jpg");
    const [categories, setCategories] = useState<any[]>([]);
    const [genderName, setGenderName] = useState<string>("");

    // Fetch Product Details
    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;

            try {
                // Fetch product with relations
                const { data, error } = await supabase
                    .from('products')
                    .select('*, brands(name), genders(name)')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;

                if (data) {
                    // Process Image
                    let img = "/placeholder.jpg";
                    try {
                        if (Array.isArray(data.images) && data.images.length > 0) img = data.images[0];
                        else if (typeof data.images === 'string') {
                            const trimmed = data.images.trim();
                            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                                const parsed = JSON.parse(trimmed);
                                if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                            } else {
                                img = trimmed.split(',')[0].replace(/^['"\[]+|['"\]]+$/g, '');
                            }
                        }
                    } catch (e) { console.error("Error parsing image:", e); }
                    if (img && img.length > 5) setMainImage(img);

                    setProduct(data);
                    setGenderName(data.genders?.name || "");

                    // Fetch Category Names (since we only have IDs in product)
                    if (data.category_ids && data.category_ids.length > 0) {
                        const { data: cats } = await supabase
                            .from('categories')
                            .select('id, name')
                            .in('id', data.category_ids);
                        if (cats) setCategories(cats);
                    }
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    const handleAddToCart = () => {
        addItem(product);
    };

    const handleSearchSimilar = () => {
        if (!product) return;

        const queryParams = new URLSearchParams();
        if (genderName) queryParams.set('gender', genderName);
        if (categories.length > 0) queryParams.set('category', categories[0].name); // Use the first category

        router.push(`/catalogo?${queryParams.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono animate-pulse">
                CARGANDO DETALLES...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <p className="font-mono text-neutral-400">Producto no encontrado.</p>
                <Link href="/catalogo" className="text-gold hover:underline font-mono uppercase">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-20">

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-400 hover:text-gold transition-colors mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono text-xs uppercase tracking-widest">Volver</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Image Section */}
                    <div className="relative aspect-square w-full flex items-center justify-center border border-white/10 group overflow-hidden bg-neutral-900/40 p-8">
                        <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-contain w-full h-full z-10 transition-transform duration-700 hover:scale-110"
                            priority
                        />
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-2">
                            <span className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
                                {product.brands?.name || "MARCA"}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-2xl font-mono text-white/90 mb-8">
                            ${Number(product.price).toLocaleString('es-CO')}
                        </p>

                        <div className="bg-white/5 border border-white/10 p-6 mb-8 backdrop-blur-sm">
                            <h3 className="text-xs font-mono uppercase text-neutral-400 mb-2 tracking-widest">Descripción</h3>
                            <p className="text-neutral-300 font-light leading-relaxed text-sm md:text-base">
                                {product.description || "Sin descripción disponible para este producto exclusivo."}
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-6 mb-8 font-mono">
                            <div>
                                <span className="block uppercase tracking-widest text-neutral-500 text-xs mb-2">Género</span>
                                <span className="text-white text-lg">{product.genders?.name || "Unisex"}</span>
                            </div>
                            <div>
                                <span className="block uppercase tracking-widest text-neutral-500 text-xs mb-2">Categoría</span>
                                <span className="text-white text-lg">
                                    {categories.map(c => c.name).join(", ") || "General"}
                                </span>
                            </div>
                            {/* Standard metadata usually doesn't change, but good to show something */}
                            <div>
                                <span className="block uppercase tracking-widest text-neutral-500 text-xs mb-2">Volumen</span>
                                <span className="text-white text-lg">{product.volume_ml ? `${product.volume_ml} ml` : "N/A"}</span>
                            </div>
                            <div>
                                <span className="block uppercase tracking-widest text-neutral-500 text-xs mb-2">Calidad</span>
                                <span className="text-white text-lg">{product.quality || "Premium"}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gold text-black font-bold uppercase py-4 px-8 hover:bg-white transition-colors flex items-center justify-center gap-2 font-mono tracking-widest"
                            >
                                <ShoppingCart size={18} />
                                Agregar al Carrito
                            </button>

                            <Link href="/catalogo" className="flex-1">
                                <button className="w-full border border-white/20 text-white font-mono uppercase py-4 px-8 hover:border-gold hover:text-gold transition-colors tracking-widest">
                                    Volver al Catálogo
                                </button>
                            </Link>
                        </div>

                        {/* Search Similar */}
                        <div className="border-t border-white/10 pt-8 mt-auto">
                            <button
                                onClick={handleSearchSimilar}
                                className="w-full group flex items-center justify-between p-4 bg-neutral-900/50 border border-white/5 hover:border-gold/30 hover:bg-neutral-900 transition-all"
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-xs font-mono text-gold uppercase tracking-widest">Explorar más</span>
                                    <span className="font-serif text-lg text-white group-hover:translate-x-1 transition-transform">Buscar Similares</span>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold group-hover:text-gold transition-colors">
                                    <Search size={16} />
                                </div>
                            </button>
                            <p className="mt-2 text-[10px] text-neutral-500 font-mono">
                                Encuentra otros productos basados en {categories.length > 0 ? categories[0].name : "su categoría"} y género.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
