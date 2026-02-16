"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronDown, Check, ChevronLeft, ChevronRight, Filter, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

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
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // URLs usually pass IDs or Names. Let's assume Names for SEO, map to IDs if needed.
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

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
                    .order('created_at', { ascending: false });

                if (pData) {
                    // Pre-process products for easier filtering
                    const processed = pData.map(p => ({
                        ...p,
                        brandName: p.brands?.name || "Generico",
                        genderName: p.genders?.name || "Unisex",
                        categoryIds: p.category_ids || [],
                        // Robust Image Extraction
                        mainImage: (() => {
                            let img = "/placeholder.jpg";
                            try {
                                if (Array.isArray(p.images) && p.images.length > 0) img = p.images[0];
                                else if (typeof p.images === 'string') {
                                    const trimmed = p.images.trim();
                                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                                        const parsed = JSON.parse(trimmed);
                                        if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                                    } else {
                                        img = trimmed.split(',')[0].replace(/^['"\[]+|['"\]]+$/g, '');
                                    }
                                }
                            } catch (e) { }
                            return (img && img.length > 5) ? img : "/placeholder.jpg";
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

    // Apply Filters
    useEffect(() => {
        let result = allProducts;

        // Gender
        if (selectedGenders.length > 0) {
            result = result.filter(p => selectedGenders.includes(p.genderName));
        }

        // Categories (Check if product has the category ID in its array)
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
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        setFilteredProducts(result);
        setCurrentPage(1); // Reset pagination on filter change
    }, [allProducts, selectedGenders, selectedCategories, selectedBrands, priceRange]);

    // Pagination
    useEffect(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        setPaginatedProducts(filteredProducts.slice(start, end));
    }, [filteredProducts, currentPage]);

    // Handlers
    const toggleGender = (g: string) => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    const toggleCategory = (id: string) => setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleBrand = (b: string) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />

            <div className="px-6 md:px-12 lg:px-24 mb-12">
                <h1 className="text-4xl md:text-6xl font-serif mb-4">Catálogo</h1>
                <p className="text-neutral-400 font-mono text-sm max-w-xl">
                    Explora nuestra colección curada de las fragancias más exclusivas del mundo.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row px-6 md:px-12 lg:px-24 gap-12 pb-24">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8">

                    {/* Price Filter */}
                    <div className="border-b border-white/10 pb-6">
                        <h3 className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between">
                            Precio
                            <ChevronDown size={14} />
                        </h3>
                        <input
                            type="range"
                            min="0"
                            max="500000"
                            step="10000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                            className="w-full accent-gold h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs font-mono text-neutral-400 mt-2">
                            <span>$0</span>
                            <span>${priceRange[1].toLocaleString('es-CO')}</span>
                        </div>
                    </div>

                    {/* Gender Filter */}
                    <div className="border-b border-white/10 pb-6">
                        <h3 className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between">
                            Género <ChevronDown size={14} />
                        </h3>
                        <div className="flex flex-col gap-3">
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
                        <h3 className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between">
                            Categorías <ChevronDown size={14} />
                        </h3>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto hide-scrollbar">
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

                    {/* Brands Filter */}
                    <div className="pb-6">
                        <h3 className="text-sm font-mono uppercase tracking-widest mb-4 flex items-center justify-between">
                            Marcas <ChevronDown size={14} />
                        </h3>
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <span className="text-xs font-mono text-neutral-400">
                            {filteredProducts.length} productos • Página {currentPage} de {totalPages || 1}
                        </span>

                        <div className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors">
                            <span className="text-xs font-mono uppercase">Más vendidos</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="text-center py-20 font-mono text-neutral-500">Cargando catálogo...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 font-mono text-neutral-500">No se encontraron productos.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedProducts.map((product) => (
                                <div key={product.id} className="group relative border border-white/10 p-6 hover:border-gold/50 transition-colors bg-neutral-900/20">
                                    <div className="relative h-[250px] w-full flex items-center justify-center mb-6 bg-white p-4 overflow-hidden">
                                        <Image
                                            src={product.mainImage}
                                            alt={product.name}
                                            width={300}
                                            height={300}
                                            className="object-contain max-h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center text-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-10">
                                            <button
                                                onClick={() => addItem(product)}
                                                className="bg-gold text-black font-bold uppercase py-2 px-6 min-w-[140px] text-xs hover:bg-white transition-colors flex items-center gap-2 mb-2 w-auto justify-center"
                                            >
                                                <ShoppingCart size={14} />
                                                AGREGAR
                                            </button>
                                            <button
                                                onClick={() => router.push(`/product/${product.id}`)}
                                                className="text-white border border-white/30 font-mono uppercase py-2 px-4 text-[10px] hover:border-gold hover:text-gold transition-colors"
                                            >
                                                Ver Detalles
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <p className="text-[10px] text-muted mb-1 font-mono tracking-widest uppercase">{product.brandName}</p>
                                        <h3 className="text-lg font-serif mb-2 line-clamp-1">{product.name}</h3>
                                        <p className="text-gold font-mono text-sm">${product.price.toLocaleString('es-CO')}</p>
                                    </div>
                                </div>
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
