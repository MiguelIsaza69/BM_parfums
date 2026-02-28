"use client";

import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Suspense, useState } from "react";
import { TermsModal } from "@/components/TermsModal";

function RegistrarseContent() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    return (
        <div className="w-full max-w-md bg-neutral-900/40 p-10 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl shadow-gold/5">
            <h1 className="text-3xl font-serif text-white uppercase tracking-[6px] mb-2 text-center italic">Bienvenido</h1>
            <p className="text-gold text-[10px] font-mono uppercase tracking-[3px] mb-12 text-center opacity-80">Únete a la elite de la perfumería</p>

            <RegisterForm initialEmail={initialEmail} />

            <p className="mt-12 text-center text-[9px] text-neutral-600 font-mono uppercase tracking-[2px] leading-relaxed">
                Al registrarte, aceptas nuestros <br />
                <button
                    onClick={() => setIsTermsOpen(true)}
                    className="text-neutral-400 hover:text-gold cursor-pointer transition-colors underline underline-offset-4 bg-transparent border-none"
                >
                    Términos y Condiciones
                </button>
            </p>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
}

export default function RegistrarsePage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
            <Header />
            <div className="pt-48 pb-32 px-6 md:px-12 flex flex-col items-center justify-center min-h-[80vh]">
                <Suspense fallback={<div className="text-gold font-mono animate-pulse">Cargando...</div>}>
                    <RegistrarseContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    )
}
