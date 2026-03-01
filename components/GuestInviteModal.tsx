"use client";

import { X, UserPlus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface GuestInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: () => void;
    onContinueAsGuest: () => void;
}

export function GuestInviteModal({ isOpen, onClose, onRegister, onContinueAsGuest }: GuestInviteModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-neutral-900 border border-white/10 p-8 md:p-12 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        <UserPlus size={40} />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 tracking-tight uppercase italic">¡ESPERA! OBTÉN 10% OFF</h3>
                    <p className="text-neutral-400 font-mono text-sm mb-10 leading-relaxed md:px-4">
                        Regístrate ahora y obtén un <span className="text-gold font-bold">10% de descuento</span> en tu pedido usando el código <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">BIENVENIDO</span>. Además, podrás rastrear tu envío y guardar tus datos para futuras compras.
                    </p>

                    <div className="flex flex-col w-full gap-4">
                        <button
                            onClick={onRegister}
                            className="bg-gold text-black w-full py-5 px-10 uppercase font-black text-xs tracking-[4px] shadow-2xl transition-all hover:bg-white active:scale-95 flex items-center justify-center gap-3"
                        >
                            <UserPlus size={18} />
                            Registrarme y obtener descuento
                        </button>

                        <button
                            onClick={onContinueAsGuest}
                            className="text-neutral-500 hover:text-white w-full py-3 px-10 uppercase font-mono text-[10px] tracking-[3px] transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={14} />
                            Continuar como invitado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
