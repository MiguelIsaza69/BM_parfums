"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

type AuthView = "login" | "register" | "forgot-password";

interface AuthSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthSidebar({ isOpen, onClose }: AuthSidebarProps) {
    const [view, setView] = useState<AuthView>("login");

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
                    {view === "login" && <LoginForm setView={setView} onClose={onClose} />}
                    {view === "register" && <RegisterForm setView={setView} />}
                    {view === "forgot-password" && <ForgotPasswordForm setView={setView} />}
                </div>
            </div>
        </>
    );
}

function LoginForm({ setView, onClose }: { setView: (v: AuthView) => void, onClose: () => void }) {
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
            // Ignore AbortError if it happens during navigation
            if (err.name !== 'AbortError') {
                sileo.error({
                    title: "Error al iniciar sesión",
                    description: err.message || "Credenciales incorrectas"
                });
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

function RegisterForm({ setView }: { setView: (v: AuthView) => void }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneCode, setPhoneCode] = useState("+57");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        setError(null);

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
            setView("login");

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

            <button
                onClick={handleRegister}
                disabled={loading}
                className="bg-gold text-black font-bold uppercase py-4 hover:bg-white transition-colors font-mono tracking-widest mt-4 disabled:opacity-50"
            >
                {loading ? "Registrando..." : "Registrarse"}
            </button>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setView("login")}
                    className="text-neutral-500 text-xs uppercase font-mono hover:text-white transition-colors"
                >
                    ← Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
}

function ForgotPasswordForm({ setView }: { setView: (v: AuthView) => void }) {
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
            sileo.error({
                title: "Error de recuperación",
                description: error.message
            });
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

function Input({ label, type, placeholder, value, onChange }: { label: string, type: string, placeholder: string, value: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-neutral-900/50 border border-white/10 text-white p-3 text-sm focus:border-gold focus:outline-none transition-colors placeholder:text-neutral-700 font-mono"
            />
        </div>
    );
}
