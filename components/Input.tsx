"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps {
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    className?: string;
}

export function Input({ label, type, placeholder, value, onChange, className = "" }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="bg-neutral-900/50 border border-white/10 text-white p-3 pr-12 text-sm focus:border-gold focus:outline-none transition-colors placeholder:text-neutral-700 font-mono w-full"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
}
