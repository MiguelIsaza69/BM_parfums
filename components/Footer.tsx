"use client";

import { Instagram, Send, MessageCircle, Globe } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { TermsModal } from "./TermsModal";

export function Footer() {
    const [email, setEmail] = useState("");
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const router = useRouter();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            router.push(`/registrarse?email=${encodeURIComponent(email)}`);
        }
    };

    return (
        <footer className="border-t border-white/10 bg-black text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 xl:gap-24 p-12 md:p-20 border-b border-white/10">
                {/* Brand */}
                <div className="flex flex-col gap-6 md:col-span-1 lg:col-span-1">
                    <div className="relative w-48 h-24">
                        <Image
                            src="https://res.cloudinary.com/dbeaem1xr/image/upload/v1771865096/WhatsApp_Image_2026-02-11_at_3.37.42_PM-removebg-preview_lz7whv.png"
                            alt="BM Parfums Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-[10px] text-neutral-500 max-w-xs font-mono uppercase tracking-[2px] leading-relaxed">
                        ALTA PERFUMERÍA DE VANGUARDIA.<br />
                        EST. 2026<br />
                        MEDELLÍN, COLOMBIA
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-10 sm:gap-16 font-mono text-sm">
                    <ul>
                        <li className="mb-6 text-gold uppercase tracking-[3px] text-[10px] font-bold">Tienda</li>
                        <li className="mb-3 text-neutral-400"><a href="/catalogo" className="hover:text-white transition-colors">Todos los Productos</a></li>
                        <li className="mb-3 text-neutral-400"><a href="/catalogo?sort=newest" className="hover:text-white transition-colors">Novedades</a></li>
                        <li className="mb-3 text-neutral-400"><a href="/catalogo" className="hover:text-white transition-colors">Más Vendidos</a></li>
                    </ul>
                    <ul>
                        <li className="mb-6 text-gold uppercase tracking-[3px] text-[10px] font-bold">Soporte</li>
                        <li className="mb-3 text-neutral-400"><a href="/contacto" className="hover:text-white transition-colors">Contacto</a></li>
                        <li className="mb-3 text-neutral-400">
                            <button
                                onClick={() => setIsTermsOpen(true)}
                                className="hover:text-white transition-colors text-left"
                            >
                                Términos y Condiciones
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Social / Newsletter */}
                <div className="flex flex-col gap-8 md:col-span-2 lg:col-span-1 border-t md:border-t-0 border-white/5 pt-12 md:pt-0">
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-[3px] text-gold mb-6 font-bold">Conéctate</h4>
                        <div className="flex gap-6">
                            <a href="https://instagram.com/bm__parfums" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-all transform hover:scale-110"><Instagram size={20} /></a>
                            <a href="https://tiktok.com/@bm__parfums" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-all transform hover:scale-110"><Globe size={20} /></a>
                            <a href="https://wa.me/573106129517" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-all transform hover:scale-110"><MessageCircle size={20} /></a>
                        </div>
                    </div>

                    <form onSubmit={handleJoin} className="flex flex-col gap-4">
                        <label className="font-mono text-[9px] uppercase tracking-[4px] text-neutral-600">Suscríbete para Alertas</label>
                        <div className="flex flex-wrap sm:flex-nowrap border-b border-white/20 pb-2 transition-colors focus-within:border-gold group gap-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="TU CORREO ELECTRÓNICO"
                                className="bg-transparent outline-none flex-1 min-w-[150px] font-mono text-[11px] placeholder:text-neutral-800 tracking-widest text-white"
                            />
                            <button type="submit" className="text-gold font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors flex items-center gap-2 shrink-0">
                                Unirse <Send size={10} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="p-8 text-center flex flex-col items-center gap-4 border-t border-white/5">
                <div className="text-[9px] text-neutral-700 font-mono uppercase tracking-[4px]">
                    &copy; 2026 BM PARFUMS. TODOS LOS DERECHOS RESERVADOS.
                </div>
                <button
                    onClick={() => {
                        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
                    }}
                    className="text-[8px] text-neutral-800 hover:text-gold transition-colors font-mono uppercase tracking-[2px]"
                >
                    ¿Página lenta o con errores? Haz clic aquí para refrescar
                </button>
            </div>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </footer>
    );
}
