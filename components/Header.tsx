"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, User, X, RefreshCcw } from "lucide-react";
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

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchBrands, setSearchBrands] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);

                // 1. Fetch matching brands first
                const { data: brands } = await supabase
                    .from('brands')
                    .select('*')
                    .ilike('name', `%${searchQuery}%`)
                    .limit(5);

                const brandIds = brands?.map(b => b.id) || [];

                // 2. Fetch products: matching name OR matching brand IDs
                let productQuery = supabase
                    .from('products')
                    .select('*, brands(name)')
                    .limit(4);

                // Sanitize query for the complex OR generic filter to prevent syntax injection
                // PostgREST raw filters can be sensitive to characters like , ( ) .
                const safeQuery = searchQuery.replace(/[(),.]/g, " ");

                if (brandIds.length > 0) {
                    // Syntax: .or('name.ilike.%query%,brand_id.in.(id1,id2)')
                    productQuery = productQuery.or(`name.ilike.%${safeQuery}%,brand_id.in.(${brandIds.join(',')})`);
                } else {
                    // Standard .ilike() is parameterized and safe
                    productQuery = productQuery.ilike('name', `%${searchQuery}%`);
                }

                const { data: products } = await productQuery;

                setSearchResults(products || []);
                setSearchBrands(brands || []);
                setIsSearching(false);
                setShowSearch(true);
            } else {
                setSearchResults([]);
                setSearchBrands([]);
                setShowSearch(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

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
            <header className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center transition-all duration-300 bg-gradient-to-b from-black from-0% via-black/60 to-transparent pointer-events-none">
                {/* Logo */}
                <Link href="/" className="hover:scale-105 transition-transform pointer-events-auto">
                    <img
                        src="https://res.cloudinary.com/dbeaem1xr/image/upload/v1771865096/WhatsApp_Image_2026-02-11_at_3.37.42_PM-removebg-preview_lz7whv.png"
                        alt="BM Parfums"
                        className="h-24 w-auto object-contain"
                    />
                </Link>

                {/* Right Side Container */}
                <div className="flex items-center gap-12 pointer-events-auto">
                    {/* Desktop Nav */}
                    <nav className="hidden nav:flex gap-8 items-center">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="text-sm font-mono uppercase tracking-[2px] text-red-500 hover:text-white hover:line-through transition-all font-bold"
                            >
                                Panel Admin
                            </Link>
                        )}
                        {[
                            { name: "Categorías", path: "/categorias" },
                            { name: "Marcas", path: "/marcas" },
                            { name: "Catálogo", path: "/catalogo" },
                            { name: "Contacto", path: "/contacto" }
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className="text-sm font-mono uppercase tracking-[2px] hover:text-gold hover:line-through transition-all"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        <div className="relative group/search">
                            <div className="hidden nav:flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 bg-white/5 transition-all duration-300 focus-within:bg-black/80 focus-within:border-gold w-64">
                                <Search className="w-4 h-4 text-neutral-400 group-focus-within/search:text-gold" />
                                <input
                                    type="text"
                                    placeholder="BUSCAR..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
                                    // onBlur={() => setTimeout(() => setShowSearch(false), 200)} // Delay to allow clicks
                                    className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-neutral-500 font-mono transition-all uppercase"
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(""); setShowSearch(false); }} className="text-neutral-500 hover:text-white">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Search Dropdown */}
                            {showSearch && (
                                <div className="absolute top-full right-0 mt-4 w-[800px] bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
                                    {/* Left Column: Products */}
                                    <div className="flex-1 p-8 pb-20 border-r border-white/10">
                                        <h3 className="text-xs font-mono uppercase text-neutral-500 mb-6 tracking-widest">Coincidencias de Productos</h3>
                                        {isSearching ? (
                                            <div className="text-center py-8 text-gold text-sm font-mono animate-pulse">Buscando...</div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="space-y-4">
                                                {searchResults.map((product) => {
                                                    let image = null;
                                                    try {
                                                        const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                                                        image = Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0] : null;
                                                    } catch (e) {
                                                        console.error("Error parsing images for product", product.id, e);
                                                    }

                                                    return (
                                                        <Link
                                                            key={product.id}
                                                            href={`/product/${product.id}`}
                                                            onClick={() => setShowSearch(false)}
                                                            className="flex gap-6 group hover:bg-white/5 p-3 rounded-lg transition-colors items-center"
                                                        >
                                                            <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 p-1">
                                                                {image ? (
                                                                    <img src={image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">Sin Foto</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{product.brands?.name}</p>
                                                                <p className="text-base font-serif text-white group-hover:text-gold transition-colors truncate">{product.name}</p>
                                                                <p className="text-sm font-mono text-gold mt-1 font-bold">${product.price.toLocaleString()}</p>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-neutral-600 text-sm font-mono italic">No se encontraron productos.</div>
                                        )}
                                    </div>

                                    {/* Right Column: Suggestions & Collections */}
                                    <div className="w-80 bg-neutral-900/30 p-8 pb-20 flex flex-col gap-10">
                                        {/* Suggestions */}
                                        <div>
                                            <h3 className="text-xs font-mono uppercase text-neutral-500 mb-4 tracking-widest">Sugerencias</h3>
                                            <div className="flex flex-col gap-3">
                                                <Link href={`/catalogo?q=${searchQuery}`} onClick={() => setShowSearch(false)} className="text-sm font-mono text-white hover:text-gold transition-colors block truncate">
                                                    Perfumes de "{searchQuery}"
                                                </Link>
                                                <Link href={`/catalogo?g=hombre&q=${searchQuery}`} onClick={() => setShowSearch(false)} className="text-sm font-mono text-neutral-400 hover:text-white transition-colors block truncate">
                                                    "{searchQuery}" para Hombre
                                                </Link>
                                                <Link href={`/catalogo?g=mujer&q=${searchQuery}`} onClick={() => setShowSearch(false)} className="text-sm font-mono text-neutral-400 hover:text-white transition-colors block truncate">
                                                    "{searchQuery}" para Mujer
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Collections (Brands) */}
                                        {searchBrands.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-mono uppercase text-neutral-500 mb-4 tracking-widest">Marcas Relacionadas</h3>
                                                <div className="flex flex-col gap-3">
                                                    {searchBrands.map(brand => (
                                                        <Link
                                                            key={brand.id}
                                                            href={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
                                                            onClick={() => setShowSearch(false)}
                                                            className="text-base font-mono text-white hover:text-gold transition-colors block truncate"
                                                        >
                                                            {brand.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Action */}
                                    <Link
                                        href={`/catalogo?q=${searchQuery}`}
                                        onClick={() => setShowSearch(false)}
                                        className="absolute bottom-0 left-0 w-full bg-gold text-black text-xs font-bold uppercase py-3 text-center hover:bg-white transition-colors tracking-widest"
                                    >
                                        VER TODOS LOS RESULTADOS PARA "{searchQuery}"
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* User Auth Trigger */}
                        <button
                            onClick={() => user ? router.push("/dashboard") : setIsAuthOpen(true)}
                            className="flex items-center gap-2 hover:text-gold transition-colors"
                            title="Mi Cuenta"
                        >
                            <User className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 hover:text-gold transition-colors"
                            title="Carrito"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-xs font-mono hidden md:inline">({count})</span>
                        </button>

                        {/* Force Reload Button */}
                        <button
                            onClick={() => {
                                // Hard reload simulating Ctrl+F5 on mobile
                                window.location.href = window.location.pathname + '?v=' + new Date().getTime();
                            }}
                            className="flex items-center gap-2 text-neutral-500 hover:text-gold transition-colors"
                            title="Recargar Página"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="nav:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-6 h-6 hover:text-gold transition-colors" />
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-black/95 border-b border-white/10 p-8 flex flex-col gap-6 nav:hidden glass-panel pointer-events-auto">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="text-lg font-mono uppercase tracking-widest text-red-500 font-bold hover:text-white transition-all"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Panel Admin
                            </Link>
                        )}
                        {[
                            { name: "Categorías", path: "/categorias" },
                            { name: "Marcas", path: "/marcas" },
                            { name: "Catálogo", path: "/catalogo" },
                            { name: "Contacto", path: "/contacto" }
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className="text-lg font-mono uppercase tracking-widest hover:text-gold"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
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
