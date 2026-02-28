"use client";

import { X, Send, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    isDanger = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-neutral-900 border border-white/10 p-8 rounded-lg max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full mb-6 ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'}`}>
                        {isDanger ? <AlertTriangle size={32} /> : <Send size={32} />}
                    </div>

                    <h3 className="text-2xl font-serif text-white mb-2 tracking-tight">{title}</h3>
                    <p className="text-neutral-400 font-mono text-sm mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`w-full py-4 px-8 uppercase font-bold text-xs tracking-[2px] rounded transition-all ${isDanger
                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20'
                                : 'bg-gold text-black hover:bg-white shadow-lg shadow-gold/10 border border-gold'
                                }`}
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 px-8 uppercase font-bold text-[10px] tracking-[2px] text-neutral-500 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
