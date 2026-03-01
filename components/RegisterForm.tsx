"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { sileo } from "sileo";
import { Input } from "./Input";
import { TermsModal } from "./TermsModal";
import { AppAlert } from "./AppAlert";

interface RegisterFormProps {
    onSuccess?: () => void;
    initialEmail?: string;
    initialFullName?: string;
    initialPhone?: string;
    setView?: (v: any) => void;
}

export function RegisterForm({ onSuccess, initialEmail = "", initialFullName = "", initialPhone = "", setView }: RegisterFormProps) {
    const [fullName, setFullName] = useState(initialFullName);
    const [email, setEmail] = useState(initialEmail);
    const [phoneCode, setPhoneCode] = useState("+57");
    const [phone, setPhone] = useState(initialPhone);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    // Alert State
    const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; type: "error" | "warning" | "success" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "error"
    });

    const handleRegister = async () => {
        if (!acceptedTerms) {
            setAlert({
                isOpen: true,
                title: "TÉRMINOS Y CONDICIONES",
                message: "Por favor, acepta los términos y condiciones de BM Parfums para poder crear tu cuenta.",
                type: "warning"
            });
            return;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            setAlert({
                isOpen: true,
                title: "CORREO INVÁLIDO",
                message: "Por favor, ingresa un correo electrónico real y funcional (ej: usuario@gmail.com). Necesitarás acceder a él para verificar tu cuenta.",
                type: "error"
            });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({
                isOpen: true,
                title: "DATOS INCORRECTOS",
                message: "Las contraseñas no coinciden. Por favor, asegúrate de que ambas sean idénticas para continuar.",
                type: "error"
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

            setAlert({
                isOpen: true,
                title: "REGISTRO EXITOSO",
                message: "¡Bienvenido a BM Parfums! Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta y empezar a comprar.",
                type: "success"
            });

            if (onSuccess) onSuccess();
            // We'll let the user click "Entendido" on the alert before changing view
            // The onClose of AppAlert in the JSX will handle the view transition if it was a success

        } catch (err: any) {
            console.error("Register Error Details:", err);

            let errorMessage = err.message;
            if (err.status === 429 || (err.message && (err.message.includes("429") || err.message.includes("Too many requests")))) {
                errorMessage = "Has intentado registrarte demasiadas veces en poco tiempo. Por seguridad, Supabase limita el número de registros por hora. Por favor, intenta de nuevo en unos minutos.";
            }

            setAlert({
                isOpen: true,
                title: "ERROR EN REGISTRO",
                message: errorMessage,
                type: "error"
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

            <div className="flex items-center justify-center gap-3 px-1 mt-2">
                <div className="shrink-0">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-neutral-900 accent-gold cursor-pointer"
                    />
                </div>
                <label htmlFor="terms" className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest cursor-pointer leading-tight text-center">
                    Acepto los <button type="button" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="text-gold hover:text-white underline underline-offset-4 transition-colors inline-block">términos y condiciones</button> de BM Parfums
                </label>
            </div>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

            <AppAlert
                isOpen={alert.isOpen}
                onClose={() => {
                    setAlert(prev => ({ ...prev, isOpen: false }));
                    if (alert.type === "success" && setView) {
                        setView("login");
                    }
                }}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />

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

