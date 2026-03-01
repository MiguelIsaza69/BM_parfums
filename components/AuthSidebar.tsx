"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { RegisterForm } from "./RegisterForm";
import { Input } from "./Input";
import { AppAlert } from "./AppAlert";

type AuthView = "login" | "register" | "forgot-password";

interface AuthSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: AuthView;
    initialData?: {
        email?: string;
        name?: string;
        phone?: string;
    };
}

export function AuthSidebar({ isOpen, onClose, initialView = "login", initialData }: AuthSidebarProps) {
    const [view, setView] = useState<AuthView>(initialView);
    const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; type: "error" | "warning" | "success" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "error"
    });

    const showAlert = (title: string, message: string, type: "error" | "warning" | "success" = "error") => {
        setAlert({ isOpen: true, title, message, type });
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 z-[60]"
                onClick={onClose}
            />

            <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-black border-l border-white/10 z-[70] p-8 transition-transform duration-300 transform translate-x-0 flex flex-col`}>
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-serif text-gold uppercase tracking-widest">
                        {view === "login" && "Iniciar Sesión"}
                        {view === "register" && "Crear Cuenta"}
                        {view === "forgot-password" && "Recuperar"}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gold transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {view === "login" && <LoginForm setView={setView} onClose={onClose} onAlert={showAlert} />}
                    {view === "register" && (
                        <RegisterForm
                            setView={setView}
                            initialEmail={initialData?.email}
                            initialFullName={initialData?.name}
                            initialPhone={initialData?.phone}
                        />
                    )}
                    {view === "forgot-password" && <ForgotPasswordForm setView={setView} onAlert={showAlert} />}
                </div>

                <AppAlert
                    isOpen={alert.isOpen}
                    onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
                    title={alert.title}
                    message={alert.message}
                    type={alert.type}
                />
            </div>
        </>
    );
}

function LoginForm({ setView, onClose, onAlert }: { setView: (v: AuthView) => void, onClose: () => void, onAlert: (t: string, m: string, ty?: any) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check role for redirection
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .maybeSingle();

            onClose();
            router.refresh(); // Update server components

            if (profile?.role === 'admin') {
                router.push("/");
            } else {
                router.push("/");
            }

            // Do not set loading false here, as component might unmount

        } catch (err: any) {
            console.error("Login Error:", err);

            let errorMessage = err.message || "Credenciales incorrectas";
            if (err.status === 429 || (err.message && (err.message.includes("429") || err.message.includes("Too many requests")))) {
                errorMessage = "Has intentado iniciar sesión demasiadas veces seguidas. Por seguridad, por favor espera unos minutos antes de intentar de nuevo.";
            }

            // Ignore AbortError if it happens during navigation
            if (err.name !== 'AbortError') {
                onAlert("ERROR DE ACCESO", errorMessage, "error");
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">

            <Input label="Correo Electrónico" type="email" placeholder="ejemplo@email.com" value={email} onChange={setEmail} />
            <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={setPassword} />

            <button
                onClick={() => setView("forgot-password")}
                className="text-xs text-right text-neutral-400 hover:text-white transition-colors uppercase font-mono tracking-wider"
            >
                ¿Olvidaste tu contraseña?
            </button>

            <button
                onClick={handleLogin}
                disabled={loading}
                className="bg-white text-black font-bold uppercase py-4 hover:bg-gold transition-colors font-mono tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Cargando..." : "Ingresar"}
            </button>

            <div className="mt-8 text-center border-t border-white/10 pt-8">
                <p className="text-neutral-500 text-sm mb-4">¿No tienes cuenta?</p>
                <button
                    onClick={() => setView("register")}
                    className="text-white border border-white/20 px-6 py-3 uppercase text-xs font-mono tracking-widest hover:border-gold hover:text-gold transition-colors w-full"
                >
                    Registrarse
                </button>
            </div>
        </div>
    );
}


function ForgotPasswordForm({ setView, onAlert }: { setView: (v: AuthView) => void, onAlert: (t: string, m: string, ty?: any) => void }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            sileo.success({
                title: "Enlace enviado",
                description: "Se ha enviado un correo de recuperación a tu cuenta."
            });
            setView("login");
        } catch (error: any) {
            console.error("Reset Password Error:", error);

            let errorMessage = error.message;
            if (error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("Too many requests")))) {
                errorMessage = "Has solicitado demasiados correos de recuperación. Por seguridad, por favor espera unos minutos antes de intentar de nuevo.";
            }

            onAlert("ERROR DE RECUPERACIÓN", errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <p className="text-neutral-400 text-sm font-mono leading-relaxed">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <Input label="Correo Electrónico" type="email" placeholder="ejemplo@email.com" value={email} onChange={setEmail} />

            <button
                onClick={handleReset}
                disabled={loading}
                className="bg-white text-black font-bold uppercase py-4 hover:bg-gold transition-colors font-mono tracking-widest mt-4 disabled:opacity-50"
            >
                {loading ? "Enviando..." : "Enviar Instrucciones"}
            </button>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setView("login")}
                    className="text-neutral-500 text-xs uppercase font-mono hover:text-white transition-colors"
                >
                    ← Cancelar
                </button>
            </div>
        </div>
    );
}

