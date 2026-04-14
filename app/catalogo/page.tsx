"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronDown, Check, ChevronLeft, ChevronRight, Filter, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

function CatalogContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addItem } = useCart();

    // Data State
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [genders, setGenders] = useState<any[]>([]);

    // Filter State
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // URLs usually pass IDs or Names. Let's assume Names for SEO, map to IDs if needed.
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('most_sold');
    const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [openSections, setOpenSections] = useState({
        price: true,
        gender: true,
        categories: true,
        brands: true
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const ITEMS_PER_PAGE = 15;

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Options
                const { data: bData } = await supabase.from('brands').select('*').order('name');
                const { data: cData } = await supabase.from('categories').select('*').order('name');
                const { data: gData } = await supabase.from('genders').select('*').order('name');

                if (bData) setBrands(bData);
                if (cData) setCategories(cData);
                if (gData) setGenders(gData);

                // Fetch Products
                const { data: pData } = await supabase
                    .from('products')
                    .select('*, brands(name), genders(name)')
                    .order('is_favorite', { ascending: false })
                    .order('created_at', { ascending: false });

                // Fetch Sales Data for "Most Sold" sorting
                const { data: oData } = await supabase
                    .from('orders')
                    .select('items')
                    .not('status', 'eq', 'cancelled');

                const counts: Record<string, number> = {};
                if (oData) {
                    oData.forEach(order => {
                        const items = order.items as any[];
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                counts[item.id] = (counts[item.id] || 0) + (item.quantity || 1);
                            });
                        }
                    });
                }
                setSalesCounts(counts);

                if (pData) {
                    // Pre-process products for easier filtering
                    const processed = pData.map(p => ({
                        ...p,
                        brandName: p.brands?.name || "Genérico",
                        genderName: p.genders?.name || "Unisex",
                        categoryIds: p.category_ids || [],
                        // Robust Image Extraction
                        mainImage: (() => {
                            let img = "/placeholder.jpg";
                            try {
                                if (Array.isArray(p.images) && p.images.length > 0) img = p.images[0];
                                else if (typeof p.images === 'string') {
                                    const trimmed = p.images.trim();
                                    // Handle array or object looking strings
                                    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                                        try {
                                            const parsed = JSON.parse(trimmed);
                                            if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                                            else if (typeof parsed === 'string') img = parsed;
                                            else if (parsed.url) img = parsed.url;
                                            else if (parsed.image) img = parsed.image;
                                        } catch (e) {
                                            // Fallback if it's not valid JSON despite braces
                                            img = trimmed.split(',')[0].replace(/^['"\[{]+|['"\]}]+$/g, '');
                                        }
                                    } else {
                                        img = trimmed.split(',')[0].replace(/^['"\[{]+|['"\]}]+$/g, '');
                                    }
                                }
                            } catch (e) { }
                            return (img && img.length > 5) ? img.trim() : "/placeholder.jpg";
                        })()
                    }));
                    setAllProducts(processed);
                }
            } catch (err) {
                console.error("Error loading catalog:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Initialize Filters from URL
    useEffect(() => {
        if (isLoading) return; // Wait for data to verify IDs/Names if needed

        const catParam = searchParams.get('category'); // Expecting ID or Name
        const brandParam = searchParams.get('brand');
        const genderParam = searchParams.get('gender');

        if (catParam) {
            // Check if it's an ID or Name
            const cat = categories.find(c => c.id === catParam || c.name.toLowerCase() === catParam.toLowerCase());
            if (cat) setSelectedCategories([cat.id]);
        }

        if (brandParam) {
            const brand = brands.find(b => b.name.toLowerCase() === brandParam.toLowerCase());
            if (brand) setSelectedBrands([brand.name]);
        }

        if (genderParam) {
            const gender = genders.find(g => g.name.toLowerCase() === genderParam.toLowerCase());
            if (gender) setSelectedGenders([gender.name]);
        }
    }, [searchParams, isLoading, categories, brands, genders]);

    // Derived State (Filtering & Sorting)
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...allProducts];

        // 1. Filtering
        // Gender
        if (selectedGenders.length > 0) {
            result = result.filter(p => selectedGenders.includes(p.genderName));
        }

        // Categories
        if (selectedCategories.length > 0) {
            result = result.filter(p =>
                p.categoryIds && p.categoryIds.some((id: string) => selectedCategories.includes(id))
            );
        }

        // Brands
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brandName));
        }

        // Price
        result = result.filter(p => {
            const finalPrice = p.price * (1 - (p.discount_percentage || 0) / 100);
            return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
        });

        // Active & In Stock Only
        result = result.filter(p => (p as any).is_active !== false && (p.stock > 0));

        // 2. Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'most_sold':
                    return (salesCounts[b.id] || 0) - (salesCounts[a.id] || 0);
                case 'least_sold':
                    return (salesCounts[a.id] || 0) - (salesCounts[b.id] || 0);
                case 'price_desc':
                    return (b.price * (1 - (b.discount_percentage || 0) / 100)) - (a.price * (1 - (a.discount_percentage || 0) / 100));
                case 'price_asc':
                    return (a.price * (1 - (a.discount_percentage || 0) / 100)) - (b.price * (1 - (b.discount_percentage || 0) / 100));
                case 'az':
                    return a.name.localeCompare(b.name);
                case 'za':
                    return b.name.localeCompare(a.name);
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return 0;
            }
        });

        return result;
    }, [allProducts, selectedGenders, selectedCategories, selectedBrands, priceRange, sortBy, salesCounts]);

    const totalProductsCount = filteredAndSortedProducts.length;

    // Derived State (Pagination)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredAndSortedProducts.slice(start, end);
    }, [filteredAndSortedProducts, currentPage]);

    // Reset pagination when filters or sorting change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGenders, selectedCategories, selectedBrands, priceRange, sortBy]);

    // Handlers
    const toggleGender = (g: string) => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    const toggleCategory = (id: string) => setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleBrand = (b: string) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

    const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);

    const sortOptions = [
        { id: 'most_sold', label: 'Más vendidos' },
        { id: 'least_sold', label: 'Menos vendidos' },
        { id: 'price_desc', label: 'Mayor precio' },
        { id: 'price_asc', label: 'Menor precio' },
        { id: 'az', label: 'Nombre A-Z' },
        { id: 'za', label: 'Nombre Z-A' },
        { id: 'newest', label: 'Más nuevos' }
    ];

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />

            <div className="px-6 md:px-12 lg:px-24 mb-12 text-right lg:text-left">
                <h1 className="text-4xl md:text-6xl font-serif mb-4">Catálogo</h1>
                <p className="text-neutral-400 font-mono text-sm max-w-xl ml-auto lg:ml-0">
                    Explora nuestra colección curada de las fragancias más exclusivas del mundo.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row px-6 md:px-12 lg:px-24 gap-12 pb-24">
                {/* Mobile Filters Overlay */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setShowMobileFilters(false)}
                />

                {/* Sidebar Filters - Desktop and Mobile Drawer */}
                <aside className={`
                    fixed inset-y-0 left-0 w-[85%] max-w-sm bg-black border-r border-white/10 z-[101] p-8 flex flex-col gap-8 transition-transform duration-500 transform lg:relative lg:inset-auto lg:translate-x-0 lg:w-64 lg:bg-transparent lg:border-none lg:z-0 lg:p-0
                    ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex justify-between items-center lg:hidden mb-4">
                        <h2 className="text-xl font-serif">Filtros</h2>
                        <button onClick={() => setShowMobileFilters(false)} className="text-gold font-mono text-xs uppercase tracking-widest">Cerrar</button>
                    </div>

                    <div className="flex-1 overflow-y-auto lg:overflow-visible pr-2 custom-scrollbar space-y-8">
                        {/* Price Filter */}
                        <div className="border-b border-white/10 pb-6">
                            <h3
                                onClick={() => toggleSection('price')}
                                className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between cursor-pointer group hover:text-gold transition-colors"
                            >
                                Precio
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.price ? '' : '-rotate-90'}`} />
                            </h3>
                            <div className={`transition-all duration-300 overflow-hidden ${openSections.price ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000000"
                                    step="5000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full accent-gold h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs font-mono text-neutral-400 mt-2">
                                    <span>$0</span>
                                    <span>${priceRange[1].toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Gender Filter */}
                        <div className="border-b border-white/10 pb-6">
                            <h3
                                onClick={() => toggleSection('gender')}
                                className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between cursor-pointer group hover:text-gold transition-colors"
                            >
                                Género
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.gender ? '' : '-rotate-90'}`} />
                            </h3>
                            <div className={`flex flex-col gap-3 transition-all duration-300 overflow-hidden ${openSections.gender ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                {genders.map(g => (
                                    <label key={g.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div
                                            className={`w-4 h-4 border border-white/30 flex items-center justify-center transition-colors ${selectedGenders.includes(g.name) ? 'bg-gold border-gold text-black' : 'group-hover:border-white'}`}
                                            onClick={() => toggleGender(g.name)}
                                        >
                                            {selectedGenders.includes(g.name) && <Check size={10} strokeWidth={4} />}
                                        </div>
                                        <span className="text-xs font-mono text-neutral-300 group-hover:text-white transition-colors uppercase">{g.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Categories Filter */}
                        <div className="border-b border-white/10 pb-6">
                            <h3
                                onClick={() => toggleSection('categories')}
                                className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between cursor-pointer group hover:text-gold transition-colors"
                            >
                                Categorías
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.categories ? '' : '-rotate-90'}`} />
                            </h3>
                            <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${openSections.categories ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="max-h-48 overflow-y-auto hide-scrollbar flex flex-col gap-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                className={`w-3 h-3 border border-white/30 flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id) ? 'bg-gold border-gold' : 'group-hover:border-white'}`}
                                                onClick={() => toggleCategory(cat.id)}
                                            />
                                            <span className={`text-xs font-mono uppercase tracking-wide transition-colors ${selectedCategories.includes(cat.id) ? 'text-gold' : 'text-neutral-400 hover:text-white'}`}>
                                                {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Brands Filter */}
                        <div className="pb-6">
                            <h3
                                onClick={() => toggleSection('brands')}
                                className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between cursor-pointer group hover:text-gold transition-colors"
                            >
                                Marcas
                                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.brands ? '' : '-rotate-90'}`} />
                            </h3>
                            <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${openSections.brands ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                                    {brands.map(b => (
                                        <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                className={`w-3 h-3 border border-white/30 flex items-center justify-center transition-colors ${selectedBrands.includes(b.name) ? 'bg-gold border-gold' : 'group-hover:border-white'}`}
                                                onClick={() => toggleBrand(b.name)}
                                            />
                                            <span className={`text-xs font-mono uppercase tracking-wide transition-colors ${selectedBrands.includes(b.name) ? 'text-gold' : 'text-neutral-400 hover:text-white'}`}>
                                                {b.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="lg:hidden w-full bg-gold text-black font-bold py-4 uppercase text-xs tracking-widest mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
                        onClick={() => setShowMobileFilters(false)}
                    >
                        Ver Resultados
                    </button>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-1.5 border border-white/20 rounded text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                <Filter size={14} /> Filtros
                            </button>
                            <span className="hidden sm:inline text-xs font-mono text-neutral-400">
                                {totalProductsCount} productos • Página {currentPage} de {totalPages || 1}
                            </span>
                        </div>

                        <div className="relative">
                            <div
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors"
                            >
                                <span className="text-xs font-mono uppercase">
                                    {sortOptions.find(o => o.id === sortBy)?.label || 'Ordenar'}
                                </span>
                                <ChevronDown size={14} className={showSortDropdown ? 'rotate-180' : ''} />
                            </div>

                            {showSortDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowSortDropdown(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded shadow-xl z-20 py-2">
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setSortBy(option.id);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs font-mono uppercase transition-colors hover:bg-gold hover:text-black ${sortBy === option.id ? 'text-gold' : 'text-neutral-400'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <span className="font-mono text-neutral-500 animate-pulse uppercase tracking-widest text-xs">Cargando catálogo...</span>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-[10px] font-mono text-gold hover:text-white transition-colors underline underline-offset-4"
                            >
                                ¿Tarda demasiado? Recargar
                            </button>
                        </div>
                    ) : filteredAndSortedProducts.length === 0 ? (
                        <div className="text-center py-20 font-mono text-neutral-500">No se encontraron productos.</div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                            {paginatedProducts.map((product, idx) => (
                                <ProductCard key={product.id} product={product} idx={idx} />
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-white/10">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="p-2 border border-white/10 rounded hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded transition-colors ${currentPage === page
                                            ? 'bg-gold text-black font-bold'
                                            : 'bg-white/5 hover:bg-white/10 text-neutral-400'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="p-2 border border-white/10 rounded hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>}>
            <CatalogContent />
        </Suspense>
    );
}
