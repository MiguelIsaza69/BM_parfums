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
            url: "https://wa.me/573024539932", // Assuming this is the number based on the invoice
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
            url: "https://tiktok.com/@bm__parfums",
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

            <div className="pt-40 pb-24 px-6 md:px-12">
                <div className="max-w-2xl mx-auto flex flex-col items-center">

                    {/* Logo Section */}
                    <div className="mb-12 relative w-48 h-48 md:w-56 md:h-56">
                        <Image
                            src="https://res.cloudinary.com/dbeaem1xr/image/upload/v1771865096/WhatsApp_Image_2026-02-11_at_3.37.42_PM-removebg-preview_lz7whv.png"
                            alt="BM Parfums Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-center mb-4 tracking-tight">Contacto & Redes</h1>
                    <p className="text-neutral-500 font-mono text-xs uppercase tracking-[4px] mb-12 text-center">Avant-Garde Perfumery</p>

                    {/* Links Section */}
                    <div className="w-full flex flex-col gap-4">
                        {socialLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                target={link.url.startsWith('http') ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className={`group flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${link.color}`}
                            >
                                <span className="flex items-center gap-4">
                                    <span className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                        {link.icon}
                                    </span>
                                    <span className="font-mono text-sm uppercase tracking-widest font-bold">
                                        {link.label}
                                    </span>
                                </span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Send size={18} />
                                </span>
                            </a>
                        ))}
                    </div>

                    {/* Info Section */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 w-full border-t border-white/10 pt-12">
                        <div className="flex flex-col items-center md:items-start gap-3">
                            <div className="flex items-center gap-2 text-gold">
                                <MapPin size={18} />
                                <span className="text-xs font-mono uppercase tracking-widest">Ubicación</span>
                            </div>
                            <p className="text-neutral-400 font-serif text-center md:text-left">Medellín, Colombia</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <div className="flex items-center gap-2 text-gold">
                                <Phone size={18} />
                                <span className="text-xs font-mono uppercase tracking-widest">WhatsApp Business</span>
                            </div>
                            <p className="text-neutral-400 font-serif text-center md:text-right">+57 302 453 9932</p>
                        </div>
                    </div>

                    {/* Business Email */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest mb-2">Email Corporativo</p>
                        <a href="mailto:Bmparfums.med@gmail.com" className="text-lg font-serif hover:text-gold transition-colors underline decoration-gold/30 underline-offset-8">
                            Bmparfums.med@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
