"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthSidebar } from "./AuthSidebar";
import { CartSidebar } from "./CartSidebar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { count, setIsOpen } = useCart();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const handleSession = async (session: any) => {
            setUser(session?.user || null);

            if (session?.user) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (mounted) {
                        setIsAdmin(profile?.role === 'admin');
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            } else {
                if (mounted) {
                    setIsAdmin(false);
                }
            }
        };

        const checkUser = async () => {
            try {
                // 1. Obtener sesión inicial
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    await handleSession(session);
                }

                // 2. Escuchar cambios
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                    if (mounted) {
                        await handleSession(session);
                    }
                });

                return subscription;
            } catch (error) {
                console.error("Error checking auth:", error);
            }
        };

        const setupPromise = checkUser();

        return () => {
            mounted = false;
            setupPromise.then(subscription => {
                if (subscription) subscription.unsubscribe();
            });
        };
    }, []);

    const handleUserClick = () => {
        if (user) {
            router.push("/dashboard");
        } else {
            setIsAuthOpen(true);
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center transition-all duration-300 bg-gradient-to-b from-black from-0% via-black/60 to-transparent pb-12">
                {/* Logo */}
                <Link href="/" className="text-4xl font-black tracking-tighter hover:text-gold transition-colors">
                    BM.
                </Link>

                {/* Right Side Container */}
                <div className="flex items-center gap-12">
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 items-center">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="text-sm font-mono uppercase tracking-[2px] text-red-500 hover:text-white hover:line-through transition-all font-bold"
                            >
                                Panel Admin
                            </Link>
                        )}
                        {["Categorias", "Marcas", "Catalogo", "Contacto"].map((item) => {
                            const paths: Record<string, string> = {
                                "Categorias": "/categorias",
                                "Marcas": "/marcas",
                                "Catalogo": "/catalogo",
                                "Contacto": "/#contacto"
                            };
                            return (
                                <Link
                                    key={item}
                                    href={paths[item] || "#"}
                                    className="text-sm font-mono uppercase tracking-[2px] hover:text-gold hover:line-through transition-all"
                                >
                                    {item}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 bg-white/5 transition-all duration-300 focus-within:bg-black/80 focus-within:scale-105 focus-within:border-gold">
                            <Search className="w-4 h-4 text-muted group-focus-within:text-gold" />
                            <input
                                type="text"
                                placeholder="SEARCH"
                                className="bg-transparent border-none outline-none text-xs w-24 text-white placeholder:text-neutral-500 font-mono transition-all"
                            />
                        </div>

                        {/* User Auth Trigger */}
                        <button
                            onClick={handleUserClick}
                            className="hidden md:flex items-center gap-2 hover:text-gold transition-colors"
                        >
                            <User className={`w-5 h-5 ${user ? 'text-gold' : ''}`} />
                        </button>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 hover:text-gold transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-xs font-mono hidden md:inline">({count})</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-6 h-6 hover:text-gold transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Mobile Nav Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-black/95 border-b border-white/10 p-8 flex flex-col gap-6 md:hidden glass-panel">
                        {["Categorias", "Marcas", "Catalogo", "Contacto"].map((item) => {
                            const paths: Record<string, string> = {
                                "Categorias": "/categorias",
                                "Marcas": "/marcas",
                                "Catalogo": "/catalogo",
                                "Contacto": "/#contacto"
                            };
                            return (
                                <Link
                                    key={item}
                                    href={paths[item] || "#"}
                                    className="text-lg font-mono uppercase tracking-widest hover:text-gold"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => { handleUserClick(); setIsMobileMenuOpen(false); }}
                            className="text-lg font-mono uppercase tracking-widest hover:text-gold text-left flex items-center gap-2"
                        >
                            <User size={18} className={user ? 'text-gold' : ''} />
                            {user ? "Mi Cuenta" : "Iniciar Sesión"}
                        </button>
                    </div>
                )}
            </header>

            {/* Sidebars */}
            <AuthSidebar isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <CartSidebar />
        </>
    );
}
