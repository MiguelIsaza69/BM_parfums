"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation on mount
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    useEffect(() => {
        // Auto remove after 5 seconds
        const duration = 5000;

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const bgColor = toast.type === "success" ? "bg-black/90 border-gold/50" :
        toast.type === "error" ? "bg-black/90 border-red-900/50" :
            toast.type === "warning" ? "bg-black/90 border-yellow-500/50" :
                "bg-black/90 border-white/20";

    const iconColor = toast.type === "success" ? "text-gold" :
        toast.type === "error" ? "text-red-500" :
            toast.type === "warning" ? "text-yellow-500" :
                "text-white";

    const Icon = toast.type === "success" ? CheckCircle : AlertCircle;

    return (
        <div
            className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-2xl backdrop-blur-md min-w-[320px] max-w-sm
                transition-all duration-300 ease-out transform
                ${bgColor}
                ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
        >
            <Icon className={`mt-0.5 shrink-0 ${iconColor}`} size={20} />
            <div className="flex-1">
                <h4 className={`text-sm font-bold uppercase mb-1 ${iconColor}`}>
                    {toast.type === "success" ? "Éxito" :
                        toast.type === "error" ? "Error" :
                            toast.type === "warning" ? "Advertencia" : "Info"}
                </h4>
                <p className="text-white/80 text-xs font-mono leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
}
