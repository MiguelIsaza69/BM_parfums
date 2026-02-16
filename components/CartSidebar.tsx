"use client";

import { X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartSidebar() {
    const { items, removeItem, updateQuantity, total, count, isOpen, setIsOpen } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-black border-l border-white/10 z-[70] flex flex-col transition-transform duration-300 transform translate-x-0`}>

                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                    <h2 className="text-2xl font-serif text-gold uppercase tracking-widest">
                        Tu Carrito ({count})
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="text-white hover:text-gold transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-500 font-mono text-sm">
                            <p className="mb-4">Tu carrito está vacío.</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gold border-b border-gold hover:text-white hover:border-white transition-colors uppercase tracking-widest"
                            >
                                Explorar Catálogo
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center bg-neutral-900/30 p-4 border border-white/5">
                                <div className="relative w-20 h-20 bg-white shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2 mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-muted font-mono tracking-widest mb-1">{item.brand}</p>
                                    <h4 className="text-sm font-serif text-white mb-2">{item.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <p className="text-gold font-mono text-sm">${(item.price * item.quantity).toLocaleString('es-CO')}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 border border-white/10 rounded px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-neutral-400 hover:text-white disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-neutral-400 hover:text-white"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-neutral-500 hover:text-red-500 transition-colors ml-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                {items.length > 0 && (
                    <div className="p-8 border-t border-white/10 bg-black">
                        <div className="flex justify-between items-center mb-6 text-sm font-mono">
                            <span className="text-neutral-400">SUBTOTAL</span>
                            <span className="text-gold text-lg font-bold">${total.toLocaleString('es-CO')}</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Checkout Button (White) */}
                            <Link
                                href="/checkout"
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-white text-black font-bold uppercase py-4 hover:bg-gold transition-colors font-mono tracking-widest text-center text-sm"
                            >
                                Ir a Pagar
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
