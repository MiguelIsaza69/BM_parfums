"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: any;
    idx?: number;
    delay?: number;
}

export function ProductCard({ product, idx = 0, delay }: ProductCardProps) {
    const { addItem } = useCart();
    const router = useRouter();
    const [selectedQuality, setSelectedQuality] = useState<'1.1' | 'Original'>('1.1');

    // Robust Image Extraction
    let mainImage = "/placeholder.jpg";
    try {
        if (Array.isArray(product.images) && product.images.length > 0) {
            mainImage = product.images[0];
        } else if (typeof product.images === 'string') {
            const trimmed = product.images.trim();
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
                    else if (typeof parsed === 'string') mainImage = parsed;
                    else if (parsed.url) mainImage = parsed.url;
                    else if (parsed.image) mainImage = parsed.image;
                } catch (e) {
                    mainImage = trimmed.split(',')[0].replace(/^['"\[{]+|['"\]}]+$/g, '');
                }
            } else {
                mainImage = trimmed.split(',')[0].replace(/^['"\[{]+|['"\]}]+$/g, '');
            }
        }
    } catch (e) { }
    if (!mainImage || mainImage.length < 5) mainImage = "/placeholder.jpg";

    const isOriginal = selectedQuality === 'Original';
    const currentPrice = isOriginal ? (product.price_original || product.price) : product.price;
    const currentDiscount = isOriginal ? (product.discount_percentage_original || 0) : (product.discount_percentage || 0);

    const hasDiscount = currentDiscount > 0;
    const discountedPrice = hasDiscount
        ? currentPrice * (1 - currentDiscount / 100)
        : currentPrice;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1, selectedQuality, product.volume_ml);
    };

    return (
        <div
            className="group relative border border-white/10 p-4 sm:p-6 hover:border-gold/50 transition-all duration-700 bg-neutral-900/20 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
            style={{ animationDelay: delay ? `${delay}ms` : `${idx * 100}ms` }}
        >
            <div className="relative h-[220px] sm:h-[250px] w-full flex items-center justify-center mb-6 overflow-hidden p-4">
                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 100vw, 300px"
                />

                {hasDiscount && (
                    <div className="absolute top-0 right-0 bg-gold text-black font-mono text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 z-20 shadow-lg">
                        -{currentDiscount}% OFF
                    </div>
                )}

                {/* Hover Overlay - Desktop Only */}
                <div className="absolute inset-0 bg-black/95 hidden xl:flex flex-col justify-center items-center text-center p-6 opacity-0 xl:group-hover:opacity-100 transition-all duration-500 ease-in-out backdrop-blur-sm z-10 translate-y-4 xl:group-hover:translate-y-0">
                    <button
                        onClick={handleAddToCart}
                        className="bg-gold text-black font-bold uppercase py-2.5 px-6 min-w-[150px] text-[10px] hover:bg-white transition-all duration-300 flex items-center gap-2 mb-3 justify-center shadow-lg"
                    >
                        <ShoppingCart size={14} />
                        AGREGAR {selectedQuality}
                    </button>
                    <button
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="text-white border border-white/20 font-mono uppercase py-2 px-6 text-[9px] hover:border-gold hover:text-gold transition-all duration-300 tracking-[1px] hover:bg-white/5"
                    >
                        Ver Detalles
                    </button>
                </div>
            </div>

            <div
                className="flex flex-col items-center text-center cursor-pointer flex-1"
                onClick={() => router.push(`/product/${product.id}`)}
            >
                <p className="text-[9px] text-muted mb-1 font-mono tracking-widest uppercase opacity-70">
                    {product.brandName || product.brands?.name}
                </p>
                <h3 className="text-base sm:text-lg font-serif mb-2 line-clamp-1 w-full text-white/90 group-hover:text-white transition-colors">{product.name}</h3>

                <div className="flex flex-col items-center mb-4">
                    <p className="text-gold font-mono text-sm sm:text-base font-bold tracking-tight">
                        ${Number(discountedPrice).toLocaleString('es-CO')}
                    </p>
                    {hasDiscount && (
                        <p className="text-neutral-500 font-mono text-[10px] line-through mt-0.5 opacity-60">
                            ${Number(currentPrice).toLocaleString('es-CO')}
                        </p>
                    )}
                </div>

                {/* Quality Selection Buttons */}
                <div className="flex gap-2 w-full mt-auto pt-2 border-t border-white/5">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedQuality('1.1'); }}
                        className={`flex-1 py-1.5 px-2 text-[8px] sm:text-[9px] font-mono uppercase tracking-widest border transition-all duration-300 ${selectedQuality === '1.1'
                            ? 'border-gold text-gold font-bold bg-gold/5'
                            : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white bg-white/5'}`}
                    >
                        1.1
                    </button>
                    {product.has_original && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedQuality('Original'); }}
                            className={`flex-1 py-1.5 px-2 text-[8px] sm:text-[9px] font-mono uppercase tracking-widest border transition-all duration-300 ${selectedQuality === 'Original'
                                ? 'border-gold text-gold font-bold bg-gold/5'
                                : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white bg-white/5'}`}
                        >
                            Original
                        </button>
                    )}
                </div>

                {/* Volume Display */}
                <div className="flex justify-center mt-2">
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                        {isOriginal && product.decants && product.decants.length > 0
                            ? `${product.volume_ml}ml (+ Decants)`
                            : `${product.volume_ml || 0}ml`}
                    </span>
                </div>
            </div>

            {/* Mobile/Tablet Permanent Button */}
            <div className="mt-4 xl:hidden">
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-gold text-black font-bold uppercase py-3.5 px-4 text-[10px] flex items-center gap-2 justify-center active:bg-white transition-all shadow-lg active:scale-95 rounded-sm"
                >
                    <ShoppingCart size={14} />
                    AGREGAR {selectedQuality}
                </button>
            </div>
        </div>
    );
}
