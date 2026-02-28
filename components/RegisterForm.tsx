"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";

interface RegisterFormProps {
    onSuccess?: () => void;
    initialEmail?: string;
    setView?: (v: any) => void;
}

export function RegisterForm({ onSuccess, initialEmail = "", setView }: RegisterFormProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState(initialEmail);
    const [phoneCode, setPhoneCode] = useState("+57");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!acceptedTerms) {
            sileo.error({
                title: "Términos y Condiciones",
                description: "Debes aceptar los términos y condiciones para continuar."
            });
            return;
        }
        if (password !== confirmPassword) {
            sileo.error({
                title: "Error",
                description: "Las contraseñas no coinciden"
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: `${phoneCode} ${phone}`,
                    },
                },
            });

            if (error) throw error;

            sileo.success({
                title: "Registro exitoso",
                description: "Por favor revisa tu correo para confirmar tu cuenta."
            });

            if (onSuccess) onSuccess();
            if (setView) setView("login");

        } catch (err: any) {
            sileo.error({
                title: "Error al registrarse",
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <Input label="Nombre Completo" type="text" placeholder="John Doe" value={fullName} onChange={setFullName} />
            <Input label="Correo Electrónico" type="email" placeholder="ejemplo@email.com" value={email} onChange={setEmail} />

            <div className="flex gap-4">
                <div className="w-1/3">
                    <Input label="Indicativo" type="text" placeholder="+57" value={phoneCode} onChange={setPhoneCode} />
                </div>
                <div className="flex-1">
                    <Input label="Teléfono" type="tel" placeholder="300 123 4567" value={phone} onChange={setPhone} />
                </div>
            </div>

            <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
            <Input label="Confirmar Contraseña" type="password" placeholder="••••••••" value={confirmPassword} onChange={setConfirmPassword} />

            <div className="flex items-start gap-3 px-1 mt-2">
                <div className="pt-0.5">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-neutral-900 accent-gold cursor-pointer"
                    />
                </div>
                <label htmlFor="terms" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest cursor-pointer leading-tight">
                    Acepto los términos y condiciones de BM Parfums
                </label>
            </div>

            <button
                onClick={handleRegister}
                disabled={loading}
                className="bg-gold text-black font-bold uppercase py-4 hover:bg-white transition-colors font-mono tracking-widest mt-2 disabled:opacity-50"
            >
                {loading ? "Registrando..." : "Registrarse"}
            </button>

            {setView && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setView("login")}
                        className="text-neutral-500 text-xs uppercase font-mono hover:text-white transition-colors"
                    >
                        ← Volver al inicio de sesión
                    </button>
                </div>
            )}
        </div>
    );
}

function Input({ label, type, placeholder, value, onChange }: { label: string, type: string, placeholder: string, value: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-neutral-900/50 border border-white/10 text-white p-3 text-sm focus:border-gold focus:outline-none transition-colors placeholder:text-neutral-700 font-mono w-full"
            />
        </div>
    );
}
