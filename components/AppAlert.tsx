"use client";

import { X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AppAlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "error" | "warning" | "success";
}

export function AppAlert({ isOpen, onClose, title, message, type = "error" }: AppAlertProps) {
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
            <div className={`relative bg-neutral-900 border border-white/10 p-8 md:p-12 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 ${type === "error" ? "bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" :
                        type === "warning" ? "bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" :
                            "bg-green-500/10 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                        }`}>
                        <AlertCircle size={40} />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 tracking-tight uppercase italic">{title}</h3>
                    <p className="text-neutral-400 font-mono text-sm mb-10 leading-relaxed md:px-4">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-5 px-10 uppercase font-black text-xs tracking-[4px] shadow-2xl transition-all active:scale-95 ${type === "error" ? "bg-red-600 text-white hover:bg-red-500" :
                            type === "warning" ? "bg-gold text-black hover:bg-white" :
                                "bg-green-600 text-white hover:bg-green-500"
                            }`}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
