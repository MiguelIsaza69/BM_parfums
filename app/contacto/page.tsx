"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Instagram, Facebook, MessageCircle, Send, Globe, MapPin, Phone } from "lucide-react";
import Image from "next/image";

export default function ContactoPage() {
    const socialLinks = [
        {
            name: "WhatsApp",
            icon: <MessageCircle className="w-6 h-6" />,
            url: "https://wa.me/573106129517", // Assuming this is the number based on the invoice
            color: "bg-[#25D366]",
            label: "CHATEA CON NOSOTROS"
        },
        {
            name: "Instagram",
            icon: <Instagram className="w-6 h-6" />,
            url: "https://instagram.com/bm__parfums",
            color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
            label: "SÍGUENOS EN INSTAGRAM"
        },
        {
            name: "TikTok",
            icon: <Globe className="w-6 h-6" />, // TikTok icon doesn't exist in Lucide yet, using Globe or similar
            url: "https://tiktok.com/@bm_parfums",
            color: "bg-black border border-white/20",
            label: "MIRA NUESTROS VIDEOS"
        },
        {
            name: "Catálogo",
            icon: <Send className="w-6 h-6" />,
            url: "/catalogo",
            color: "bg-[#D4AF37]",
            label: "VER CATÁLOGO COMPLETO"
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
            <Header />

            <div className="pt-40 pb-32 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-24">
                        <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 tracking-tighter">Contacto</h1>
                        <div className="flex items-center justify-center gap-6">
                            <div className="h-px w-16 bg-gold/30"></div>
                            <p className="text-gold font-mono text-[13px] uppercase tracking-[8px] font-medium">L'Excellence du Parfum</p>
                            <div className="h-px w-16 bg-gold/30"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 xl:gap-24">
                        {/* Digital Channels */}
                        <div className="space-y-10">
                            <h2 className="text-[14px] font-mono text-neutral-400 uppercase tracking-[4px] border-b border-white/5 pb-4">Digital Ecosystem</h2>
                            <div className="flex flex-col gap-4">
                                {socialLinks.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target={link.url.startsWith('http') ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className="group relative flex items-center justify-between p-7 bg-white/2 border border-white/10 hover:border-gold/40 transition-all duration-700 overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center gap-6">
                                            <div className="text-neutral-500 group-hover:text-gold transition-colors duration-500 scale-110">
                                                {link.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-[3px] mb-1 group-hover:text-neutral-400 transition-colors">{link.name}</span>
                                                <span className="font-serif text-lg tracking-wider uppercase text-white/80 group-hover:text-white transition-colors">
                                                    {link.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative z-10 w-10 h-10 border border-white/10 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-700">
                                            <Send size={12} className="text-white group-hover:text-black transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-500" />
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Direct Info */}
                        <div className="space-y-12">
                            <h2 className="text-[14px] font-mono text-neutral-400 uppercase tracking-[4px] border-b border-white/5 pb-4">Direct Communication</h2>

                            <div className="space-y-14">
                                <div className="group">
                                    <div className="flex items-center gap-4 text-gold/60 mb-5 group-hover:text-gold transition-colors duration-500">
                                        <MapPin size={22} strokeWidth={1} />
                                        <span className="text-[10px] font-mono uppercase tracking-[4px]">Headquarters</span>
                                    </div>
                                    <p className="text-3xl font-serif text-white/90 group-hover:text-white transition-colors duration-500">Medellín, Colombia</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 text-gold/60 mb-5 group-hover:text-gold transition-colors duration-500">
                                        <Phone size={22} strokeWidth={1} />
                                        <span className="text-[10px] font-mono uppercase tracking-[4px]">Personal Concierge</span>
                                    </div>
                                    <a href="https://wa.me/573106129517" className="text-3xl font-serif text-white/90 group-hover:text-white transition-colors duration-500 tracking-wide">+57 310 612 9517</a>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-4 text-gold/60 mb-5 group-hover:text-gold transition-colors duration-500">
                                        <Send size={22} strokeWidth={1} />
                                        <span className="text-[10px] font-mono uppercase tracking-[4px]">Electronic Office</span>
                                    </div>
                                    <a href="mailto:Bmparfums.med@gmail.com" className="text-2xl font-serif text-white/80 group-hover:text-white transition-colors border-b border-gold/30 pb-2 decoration-transparent hover:decoration-gold/50 underline underline-offset-12">
                                        Bmparfums.med@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="pt-16 border-t border-white/5">
                                <p className="text-[12px] font-mono text-neutral-400 uppercase tracking-[5px] leading-relaxed">
                                    Curated by BM Parfums Maison <br />
                                    &copy; 2026 Tous Droits Réservés
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
