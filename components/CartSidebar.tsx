"use client";

import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export function CartSidebar() {
    const { items, removeItem, updateQuantity, total, count, isOpen, setIsOpen } = useCart();
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Use requestAnimationFrame for smoother timing
            const frame = requestAnimationFrame(() => {
                setIsAnimating(true);
            });
            return () => cancelAnimationFrame(frame);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <>
            {/* Backdrop - Simplified for performance */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                style={{ backdropFilter: isAnimating ? 'blur(4px)' : 'none' }}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar - Hardware accelerated */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-black border-l border-white/10 z-[70] flex flex-col transition-transform duration-300 ease-out will-change-transform ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
                style={{
                    boxShadow: isAnimating ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none'
                }}
            >

                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={20} className="text-gold" />
                        <h2 className="text-xl font-serif text-white uppercase tracking-widest">
                            Tu Selección <span className="text-gold">({count})</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-neutral-500 hover:text-white transition-colors p-2"
                        aria-label="Cerrar carrito"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items - Optimized stagger */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-4 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center h-full text-neutral-500 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
                            <ShoppingBag size={40} className="mb-6 text-neutral-800" />
                            <p className="mb-6 tracking-[4px] text-[10px] font-mono">EL CARRITO ESTÁ VACÍO</p>
                            <Link
                                href="/catalogo"
                                onClick={() => setIsOpen(false)}
                                className="text-gold border border-gold/30 px-10 py-3 hover:bg-gold hover:text-black transition-all duration-300 uppercase tracking-[2px] text-[10px] font-bold font-mono hover:scale-105 active:scale-95 shadow-lg shadow-gold/5"
                            >
                                Explorar Colección
                            </Link>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`flex gap-4 items-center bg-neutral-900/40 p-3 sm:p-4 border border-white/5 group hover:border-gold/30 transition-all duration-300 ${isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                                style={{
                                    transitionDelay: isAnimating ? `${Math.min(idx * 40 + 50, 300)}ms` : '0ms'
                                }}
                            >
                                <div className="relative w-20 h-20 bg-white shrink-0 rounded-sm">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-1 mix-blend-multiply"
                                        sizes="80px"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gold/60 font-mono tracking-[2px] mb-1 uppercase truncate">{item.brand}</p>
                                    <h4 className="text-sm font-serif text-white mb-2 leading-tight truncate">{item.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <p className="text-white font-mono text-sm font-bold">${(item.price * item.quantity).toLocaleString('es-CO')}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-full px-3 py-1 scale-90 sm:scale-100 origin-right transition-transform">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-neutral-500 hover:text-gold transition-colors disabled:opacity-20"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-[10px] font-mono w-4 text-center text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-neutral-500 hover:text-gold transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-neutral-700 hover:text-red-500 transition-colors p-2"
                                    aria-label="Eliminar producto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                {items.length > 0 && (
                    <div className={`p-8 border-t border-white/10 bg-black transition-all duration-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-mono tracking-[3px] text-neutral-500 uppercase">SUBTOTAL</span>
                            <span className="text-gold text-2xl font-serif">${total.toLocaleString('es-CO')}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/checkout"
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-gold text-black font-bold uppercase py-4 hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 font-mono tracking-[3px] text-center text-xs shadow-lg"
                            >
                                Finalizar Pedido
                            </Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full text-neutral-600 font-mono text-[9px] uppercase tracking-[3px] hover:text-white transition-colors py-2"
                            >
                                Continuar Comprando
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
