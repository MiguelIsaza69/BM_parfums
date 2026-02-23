"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LayoutDashboard, Users, Package, Settings, LogOut, FilePlus, RefreshCcw, Plus, Trash2, Edit, Check, X, FileText, Send, ShoppingBag } from "lucide-react";
import { sileo } from "sileo";
import { updateHeroSlide, updateBrand } from "../actions/config";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    // const [toasts, setToasts] = useState<ToastMessage[]>([]); // Removed custom toast state

    const [ordersTab, setOrdersTab] = useState<'pending' | 'processing' | 'completed'>('pending');

    // Stats State
    const [stats, setStats] = useState({
        users: 0,
        sales: 0,
        pending: 0,
        active: 0,
        completed: 0
    });
    const [ordersList, setOrdersList] = useState<any[]>([]);

    const addToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        switch (type) {
            case "success": sileo.success({ title: message }); break;
            case "error": sileo.error({ title: message }); break;
            case "warning": sileo.warning({ title: message }); break;
            case "info": default: sileo.info({ title: message }); break;
        }
    };

    const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        if (error) {
            addToast("Error: " + error.message, "error");
        } else {
            setOrdersList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            addToast("Estado actualizado", "success");
        }
    };

    const handleUpdateOrderDescription = async (id: string, newDesc: string) => {
        const { error } = await supabase.from('orders').update({ description: newDesc }).eq('id', id);
        if (error) {
            console.error("Error updating description:", error);
            addToast("Error al guardar nota", "error");
        } else {
            setOrdersList(prev => prev.map(o => o.id === id ? { ...o, description: newDesc } : o));
        }
    };

    const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
    const [sentOrders, setSentOrders] = useState<string[]>([]);

    const handleSendInvoice = async (order: any) => {
        setIsSendingEmail(order.id);
        try {
            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    email: order.shipping_info?.email || order.profiles?.email,
                    name: order.shipping_info?.name || order.profiles?.full_name || "Cliente",
                    items: order.items,
                    total: order.total,
                    shipping_info: order.shipping_info
                })
            });

            const result = await response.json();
            if (result.success) {
                addToast("Factura enviada por correo", "success");
                setSentOrders(prev => [...prev, order.id]);
            } else {
                throw new Error(result.error || "Error al enviar");
            }
        } catch (error: any) {
            console.error("Error sending invoice:", error);
            addToast("Error: " + error.message, "error");
        } finally {
            setIsSendingEmail(null);
        }
    };

    // const removeToast = (id: string) => { // Removed usage
    //     setToasts(prev => prev.filter(t => t.id !== id));
    // };

    useEffect(() => {
        let mounted = true;

        const checkAdmin = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    if (mounted) router.replace("/");
                    return;
                }
                const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

                if (profileError || !profile) {
                    await supabase.auth.signOut();
                    if (mounted) router.replace("/");
                    return;
                }
                if (profile.role !== 'admin') {
                    if (mounted) router.replace("/dashboard");
                    return;
                }
                if (mounted) {
                    setUser(profile);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) router.replace("/");
            }
        };

        checkAdmin();
        return () => { mounted = false; };
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    // --- USERS STATE ---
    const [usersList, setUsersList] = useState<any[]>([]);
    useEffect(() => {
        if (activeSection === 'users') {
            const fetchUsers = async () => {
                const { data } = await supabase.from('profiles').select('*');
                if (data) setUsersList(data);
            };
            fetchUsers();
        }

        if (activeSection === 'dashboard') {
            const fetchStats = async () => {
                // Users
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

                // Orders Stats
                const { data: orders } = await supabase.from('orders').select('total, status');

                let sales = 0;
                let pending = 0;
                let active = 0;
                let completed = 0;

                if (orders) {
                    orders.forEach(o => {
                        if (o.status === 'completed') {
                            sales += Number(o.total);
                            completed++;
                        } else if (o.status === 'pending') {
                            pending++;
                        } else if (o.status === 'processing') {
                            active++;
                        }
                    });
                }

                setStats({
                    users: usersCount || 0,
                    sales,
                    pending,
                    active,
                    completed
                });
            };
            fetchStats();
        }

        if (activeSection === 'orders') {
            const fetchOrders = async () => {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, profiles(email, full_name)')
                    .order('created_at', { ascending: false });

                if (error) console.error("Error fetching orders:", error);
                if (data) setOrdersList(data);
            };
            fetchOrders();
        }
    }, [activeSection]);

    // --- CONFIG STATE ---
    const [heroImages, setHeroImages] = useState<any[]>([]);
    const [newHeroImage, setNewHeroImage] = useState("");
    const [isSubmittingHero, setIsSubmittingHero] = useState(false);
    const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
    const [editHeroUrl, setEditHeroUrl] = useState("");

    const [brands, setBrands] = useState<any[]>([]);
    const [newBrandName, setNewBrandName] = useState("");
    const [newBrandLogo, setNewBrandLogo] = useState("");
    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [editBrandName, setEditBrandName] = useState("");
    const [editBrandLogo, setEditBrandLogo] = useState("");
    const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            if (activeSection === 'config' || activeSection === 'products') {
                const { data, error } = await supabase.from('brands').select('id, name, logo_url').order('name', { ascending: true });
                if (error) {
                    console.error("Error loading brands:", error);
                    addToast("Error al cargar marcas", "error");
                }
                if (mounted && data) setBrands(data);
            }

            if (activeSection === 'products') {
                const { data: gData, error: gError } = await supabase.from('genders').select('id, name').order('name');
                if (gError) console.error("Error loading genders:", gError);
                if (mounted && gData) setGenders(gData);

                const { data: cData, error: cError } = await supabase.from('categories').select('*').order('name');
                if (cError) console.error("Error loading categories:", cError);
                if (mounted && cData) setCategories(cData);
            }

            if (activeSection === 'config') {
                const { data, error } = await supabase.from('hero_slides').select('*').order('created_at', { ascending: false });
                if (error) console.error("Error loading hero:", error);
                if (mounted && data) setHeroImages(data);
            }
        };

        fetchData();

        return () => { mounted = false; };
    }, [activeSection]);

    // Hero Operations
    const handleAddHeroImage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newHeroImage.trim()) { addToast("Por favor ingrese una URL válida.", "error"); return; }
        setIsSubmittingHero(true);
        try {
            const { error } = await supabase.from('hero_slides').insert([{ image_url: newHeroImage }]);
            if (error) throw error;
            addToast("Imagen agregada.", "success");
            setNewHeroImage("");
            const { data } = await supabase.from('hero_slides').select('*').order('created_at', { ascending: false });
            if (data) setHeroImages(data);
        } catch (err: any) { addToast("Error: " + err.message, "error"); }
        finally { setIsSubmittingHero(false); }
    };
    const handleDeleteHeroImage = async (id: string) => {
        if (!confirm("¿Eliminar imagen?")) return;
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) addToast("Error: " + error.message, "error");
        else { setHeroImages(heroImages.filter(img => img.id !== id)); addToast("Imagen eliminada.", "success"); }
    };
    const handleStartEditHero = (img: any) => { setEditingHeroId(img.id); setEditHeroUrl(img.image_url); };
    const handleCancelEditHero = () => { setEditingHeroId(null); setEditHeroUrl(""); };

    const handleSaveEditHero = async (id: string) => {
        if (!editHeroUrl.trim()) return addToast("URL vacía", "warning");

        const result = await updateHeroSlide(id, editHeroUrl);
        if (result?.error) {
            console.error("Update failed:", result.error);
            addToast("Error: " + result.error, "error");
        } else {
            setHeroImages(heroImages.map(img => img.id === id ? { ...img, image_url: editHeroUrl } : img));
            setEditingHeroId(null);
            addToast("Actualizado correctamente.", "success");
        }
    };

    // Brand Operations
    const handleAddBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return addToast("Nombre vacío", "warning");
        setIsSubmittingBrand(true);
        try {
            const { error } = await supabase.from('brands').insert([{ name: newBrandName, logo_url: newBrandLogo }]);
            if (error) throw error;
            addToast("Marca agregada.", "success");
            setNewBrandName("");
            setNewBrandLogo("");
            const { data } = await supabase.from('brands').select('*').order('name', { ascending: true });
            if (data) setBrands(data);
        } catch (err: any) { addToast("Error: " + err.message, "error"); }
        finally { setIsSubmittingBrand(false); }
    };
    const handleDeleteBrand = async (id: string) => {
        if (!confirm("¿Eliminar marca?")) return;
        const { error } = await supabase.from('brands').delete().eq('id', id);
        if (error) addToast("Error: " + error.message, "error");
        else { setBrands(brands.filter(b => b.id !== id)); addToast("Marca eliminada.", "success"); }
    };
    const handleStartEditBrand = (b: any) => { setEditingBrandId(b.id); setEditBrandName(b.name); setEditBrandLogo(b.logo_url || ""); };
    const handleCancelEditBrand = () => { setEditingBrandId(null); setEditBrandName(""); setEditBrandLogo(""); };
    const handleSaveEditBrand = async (id: string) => {
        if (!editBrandName.trim()) return addToast("Nombre vacío", "warning");
        const { error } = await supabase.from('brands').update({ name: editBrandName, logo_url: editBrandLogo }).eq('id', id);
        if (error) addToast("Error: " + error.message, "error");
        else {
            setBrands(brands.map(b => b.id === id ? { ...b, name: editBrandName, logo_url: editBrandLogo } : b));
            setEditingBrandId(null);
            addToast("Marca actualizada.", "success");
        }
    };

    // --- PRODUCTS STATE ---
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [genders, setGenders] = useState<any[]>([]);
    const [imagesText, setImagesText] = useState("");
    const [productForm, setProductForm] = useState({
        id: null as string | null,
        name: "",
        brand_id: "",
        gender_id: "",
        category_ids: [""] as string[],
        description: "",
        price: "" as string | number,
        volume_ml: "" as string | number,
        quality: "Inspiración"
    });
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false); // New state for form visibility

    useEffect(() => {
        let mounted = true;
        if (activeSection === 'products') {
            const fetchProducts = async () => {
                console.log("Fetching products...");
                const { data, error } = await supabase.from('products').select('*, brands(name), genders(name)').order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching products:", error);
                    addToast("Error al cargar productos: " + error.message, "error");
                    return;
                }

                if (mounted && data) {
                    console.log("Products loaded:", data.length);
                    setProducts(data);
                }
            };
            fetchProducts();
        }
        return () => { mounted = false; };
    }, [activeSection]);

    const handleProductFormChange = (field: string, value: any) => setProductForm(prev => ({ ...prev, [field]: value }));

    const handleProductCategoryChange = (index: number, val: string) => {
        const newCats = [...productForm.category_ids];
        newCats[index] = val;
        setProductForm(prev => ({ ...prev, category_ids: newCats }));
    };
    const addCategoryField = () => productForm.category_ids.length < 4 && setProductForm(prev => ({ ...prev, category_ids: [...prev.category_ids, ""] }));
    const removeCategoryField = (i: number) => {
        const newCats = productForm.category_ids.filter((_, idx) => idx !== i);
        setProductForm(prev => ({ ...prev, category_ids: newCats.length ? newCats : [""] }));
    };

    const resetProductForm = () => {
        setProductForm({
            id: null, name: "", brand_id: "", gender_id: "", category_ids: [""], description: "", price: "", volume_ml: "", quality: "Inspiración"
        });
        setImagesText("");
        setIsFormOpen(false); // Close form on reset
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!navigator.onLine) { addToast("Sin conexión a internet", "error"); return; }
        setIsSubmittingProduct(true);
        addToast("Guardando...", "info");

        try {
            const rawLines = imagesText.split(/\r?\n/);
            const cleanImages: string[] = [];
            for (const line of rawLines) {
                const trimmed = line.trim().replace(/^["']|["']$/g, "");
                if (!trimmed) continue;
                try {
                    const urlObj = new URL(trimmed);
                    cleanImages.push(urlObj.href);
                } catch (e) { }
            }
            const cleanDesc = (productForm.description || "").normalize('NFC').replace(/\u0000/g, "").trim();

            // DUPLICATE CHECK: Prevent exact Name + Quality duplicates
            const normalizedName = productForm.name.trim().toLowerCase();
            const duplicate = products.find(p =>
                p.name.toLowerCase() === normalizedName &&
                p.quality === productForm.quality &&
                p.id !== productForm.id
            );

            if (duplicate) {
                addToast(`Ya existe "${duplicate.name}" en calidad ${duplicate.quality}`, "warning");
                setIsSubmittingProduct(false);
                return;
            }

            // PAYLOAD ÚNICO (Atomic Save)
            const payload = {
                id: productForm.id, // Include ID for updates
                name: productForm.name.trim(),
                brand_id: productForm.brand_id || null,
                gender_id: productForm.gender_id || null,
                category_ids: (productForm.category_ids || []).filter(c => c && c.length > 10),
                description: cleanDesc,
                price: Number(productForm.price),
                volume_ml: Number(productForm.volume_ml) || 0,
                quality: productForm.quality,
                images: cleanImages
            };

            console.log("Saving payload via API:", payload);

            // USE SERVER-SIDE API TO BYPASS RLS/NETWORK ISSUES
            const response = await fetch('/api/products/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("API Error Text:", text);
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                console.error("API Error:", result.error);
                throw new Error(result.error?.message || result.error || "Error al guardar en el servidor");
            }

            addToast("Guardado correctamente!", "success");
            resetProductForm();

            // OPTIMISTIC UPDATE from API response (Avoids stale read)
            if (result.data && result.data.length > 0) {
                const savedProduct = result.data[0];
                setProducts(prev => {
                    const exists = prev.find(p => p.id === savedProduct.id);
                    if (exists) {
                        return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
                    }
                    return [savedProduct, ...prev];
                });
            } else {
                // Fallback refetch if API didn't return data for some reason
                const { data: newData } = await supabase.from('products').select('*, brands(name), genders(name)').order('created_at', { ascending: false });
                if (newData) setProducts(newData);
            }

        } catch (err: any) {
            console.error("Critical Error:", err);
            addToast("Error al guardar: " + (err.message || "Desconocido"), "error");
        } finally {
            setIsSubmittingProduct(false);
        }
    };

    const handleEditProduct = (p: any) => {
        setProductForm({
            id: p.id,
            name: p.name,
            brand_id: p.brand_id,
            gender_id: p.gender_id,
            category_ids: p.category_ids && p.category_ids.length ? p.category_ids : [""],
            description: p.description || "",
            price: p.price,
            volume_ml: p.volume_ml || "",
            quality: p.quality
        });
        // Handle images (text, array, or JSON string)
        let actualImages: string[] = [];

        try {
            if (Array.isArray(p.images)) {
                actualImages = p.images;
            } else if (typeof p.images === 'string') {
                const trimmed = p.images.trim();
                // Check if it's a JSON array string
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) actualImages = parsed;
                } else {
                    // Fallback to comma-separated
                    actualImages = trimmed.split(',');
                }
            }
        } catch (e) {
            console.error("Error parsing images for edit:", e);
            // Last resort fallback
            if (typeof p.images === 'string') actualImages = p.images.split(',');
        }

        // Clean up URLs
        actualImages = actualImages
            .map(img => img.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
            .filter(img => img.length > 0);

        setImagesText(actualImages.join('\n'));
        setIsFormOpen(true); // Open form on edit
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (id: string) => {
        // if (!confirm("¿Eliminar producto?")) return; // Removed at user request
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) addToast("Error: " + error.message, "error");
        else {
            if (productForm.id === id) resetProductForm();
            setProducts(products.filter(p => p.id !== id));
            addToast("Producto eliminado.", "success");
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold font-mono">Verifying Admin Access...</div>;

    const renderContent = () => {
        switch (activeSection) {
            case 'products':
                return (
                    <div>
                        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                            <h2 className="text-3xl font-serif text-white">Gestión de Productos</h2>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFormOpen(!isFormOpen);
                                        if (!isFormOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="bg-green-600 text-white font-bold uppercase text-xs px-6 py-2 rounded hover:bg-green-500 transition-colors flex items-center gap-2"
                                >
                                    {isFormOpen ? <X size={16} /> : <Plus size={16} />}
                                    {isFormOpen ? "CERRAR" : "CREAR PRODUCTO"}
                                </button>
                            </div>
                        </div>

                        {isFormOpen && (
                            <form onSubmit={handleSaveProduct} className="bg-neutral-900/30 border border-white/10 p-6 rounded-lg mb-12 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Nombre</label><input type="text" value={productForm.name} onChange={e => handleProductFormChange('name', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded" /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Marca</label><select value={productForm.brand_id} onChange={e => handleProductFormChange('brand_id', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded appearance-none"><option value="">Select...</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                                            <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Género</label><select value={productForm.gender_id} onChange={e => handleProductFormChange('gender_id', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded appearance-none"><option value="">Select...</option>{genders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center"><label className="text-xs font-mono text-neutral-500 uppercase">Categorías (Max 4)</label><button type="button" onClick={addCategoryField} className="text-[10px] text-gold uppercase">+ Agregar</button></div>
                                            <div className="space-y-2">{productForm.category_ids.map((catId, index) => (<div key={index} className="flex gap-2"><select value={catId} onChange={(e) => handleProductCategoryChange(index, e.target.value)} className="flex-1 bg-black border border-white/20 p-2 text-sm text-white focus:border-gold outline-none font-mono rounded appearance-none"><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{productForm.category_ids.length > 1 && (<button type="button" onClick={() => removeCategoryField(index)} className="text-red-500"><X size={14} /></button>)}</div>))}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Precio</label><input type="number" value={productForm.price} onChange={e => handleProductFormChange('price', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded" /></div>
                                            <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Volumen</label><input type="number" value={productForm.volume_ml} onChange={e => handleProductFormChange('volume_ml', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded" /></div>
                                        </div>
                                        <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Calidad</label><select value={productForm.quality} onChange={e => handleProductFormChange('quality', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded"><option value="Inspiración">Inspiración</option><option value="1.1">1.1</option><option value="Original">Original</option></select></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Descripción</label><textarea value={productForm.description} onChange={e => handleProductFormChange('description', e.target.value)} className="bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none font-mono rounded h-32 resize-none" /></div>
                                        <div className="flex flex-col gap-2"><label className="text-xs font-mono text-neutral-500 uppercase">Imágenes (Una URL por línea)</label><textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} className="bg-black border border-white/20 p-3 text-xs text-white focus:border-gold outline-none font-mono rounded resize-y" rows={5} /><p className="text-[10px] text-neutral-600">Sepáralas con Enter.</p></div>
                                    </div>
                                </div>
                                <div className="flex justify-end"><button type="submit" disabled={isSubmittingProduct} className="bg-gold text-black uppercase font-bold text-xs py-3 px-8 hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2">{isSubmittingProduct ? "Guardando..." : (productForm.id ? "Actualizar" : "Crear")} <Plus size={16} /></button></div>
                            </form>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(p => {
                                const mainImage = (() => {
                                    try {
                                        if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
                                        if (typeof p.images === 'string') {
                                            const trimmed = p.images.trim();
                                            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                                                const parsed = JSON.parse(trimmed);
                                                if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                                            }
                                            // Split comma separated, handle quotes
                                            const first = trimmed.split(',')[0].trim();
                                            return first.replace(/^["'\[]+|["'\]]+$/g, '');
                                        }
                                        return null;
                                    } catch (e) { return null; }
                                })();

                                const safeImage = mainImage && mainImage.length > 5 ? mainImage : null;
                                return (
                                    <div key={p.id} className="group bg-neutral-900/20 border border-white/10 p-4 rounded-lg relative hover:border-gold/50 transition-colors">
                                        <div className="aspect-square bg-white mb-4 relative rounded-sm flex items-center justify-center overflow-hidden">
                                            {safeImage ? <img src={safeImage} alt={p.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500" /> : <div className="text-xs text-neutral-300">Sin imagen</div>}
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditProduct(p)} className="bg-white text-black p-2 rounded-full hover:bg-gold"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="bg-black text-white p-2 rounded-full hover:bg-red-600 border border-white/10"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex justify-center gap-1 mb-1"><span className="text-[9px] text-neutral-500 uppercase tracking-widest">{p.brands?.name || '...'}</span></div>
                                            <h3 className="text-sm font-serif text-white mb-1 truncate">{p.name}</h3>
                                            <p className="text-gold font-mono text-xs">${p.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div>
                        <h2 className="text-3xl font-serif text-white mb-8 border-b border-white/10 pb-6">Usuarios Registrados ({usersList.length})</h2>
                        <div className="bg-neutral-900/30 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm w-full max-w-6xl mx-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-sm font-mono uppercase text-gold tracking-wider">
                                        <th className="p-6">Email</th>
                                        <th className="p-6">Nombre</th>
                                        <th className="p-6 text-right">Teléfono</th>
                                    </tr>
                                </thead>
                                <tbody className="text-base font-mono text-neutral-300 divide-y divide-white/5">
                                    {usersList.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6 break-all text-white/70">{u.email}</td>
                                            <td className="p-6 font-bold text-white">{u.full_name || "—"}</td>
                                            <td className="p-6 text-right">{u.phone || "—"}</td>
                                        </tr>
                                    ))}
                                    {usersList.length === 0 && (
                                        <tr><td colSpan={3} className="p-10 text-center text-lg text-neutral-500">No hay usuarios registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'orders':
                const filteredOrders = ordersList.filter(o => {
                    if (ordersTab === 'completed') return o.status === 'completed' || o.status === 'cancelled';
                    return o.status === ordersTab;
                });

                return (
                    <div>
                        <h2 className="text-3xl font-serif text-white mb-8 border-b border-white/10 pb-6">Gestión de Pedidos</h2>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-1">
                            <button onClick={() => setOrdersTab('pending')} className={`px-4 py-3 text-sm font-mono uppercase transition-all relative ${ordersTab === 'pending' ? 'text-yellow-500 font-bold' : 'text-neutral-400 hover:text-white'}`}>
                                Pendientes ({ordersList.filter(o => o.status === 'pending').length})
                                {ordersTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500" />}
                            </button>
                            <button onClick={() => setOrdersTab('processing')} className={`px-4 py-3 text-sm font-mono uppercase transition-all relative ${ordersTab === 'processing' ? 'text-blue-500 font-bold' : 'text-neutral-400 hover:text-white'}`}>
                                Activos ({ordersList.filter(o => o.status === 'processing').length})
                                {ordersTab === 'processing' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
                            </button>
                            <button onClick={() => setOrdersTab('completed')} className={`px-4 py-3 text-sm font-mono uppercase transition-all relative ${ordersTab === 'completed' ? 'text-green-500 font-bold' : 'text-neutral-400 hover:text-white'}`}>
                                Finalizados ({ordersList.filter(o => o.status === 'completed' || o.status === 'cancelled').length})
                                {ordersTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" />}
                            </button>
                        </div>

                        <div className="bg-neutral-900/30 border border-white/10 rounded-lg overflow-x-auto backdrop-blur-sm w-full">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-xs font-mono uppercase text-gold tracking-wider">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Dirección</th>
                                        <th className="p-4">Productos</th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Descripción / Notas</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-mono text-neutral-300 divide-y divide-white/5">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white/50 font-mono text-xs">{order.id.substring(0, 8)}...</span>
                                                    <Link
                                                        href={`/order-confirmation/${order.id}?from=admin`}
                                                        target="_blank"
                                                        className="text-[10px] text-gold uppercase tracking-widest hover:underline flex items-center gap-1 w-fit"
                                                    >
                                                        <FileText size={10} />
                                                        Ver Factura
                                                    </Link>
                                                    <button
                                                        onClick={() => handleSendInvoice(order)}
                                                        disabled={isSendingEmail === order.id}
                                                        className={`text-[10px] uppercase tracking-widest flex items-center gap-1 w-fit mt-1 px-2 py-1 rounded transition-colors ${sentOrders.includes(order.id) ? 'text-green-500 bg-green-500/10' : 'text-blue-400 hover:bg-blue-400/10'}`}
                                                    >
                                                        {isSendingEmail === order.id ? (
                                                            <RefreshCcw size={10} className="animate-spin" />
                                                        ) : sentOrders.includes(order.id) ? (
                                                            <Check size={10} />
                                                        ) : (
                                                            <Send size={10} />
                                                        )}
                                                        {isSendingEmail === order.id ? "Enviando..." : sentOrders.includes(order.id) ? "Re-Enviar" : "Enviar Correo"}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white font-bold text-base">{order.shipping_info?.name || "Sin nombre"}</span>
                                                    <span className="text-neutral-300 text-sm">{order.shipping_info?.phone || "—"}</span>
                                                    <span className="text-neutral-300 text-sm">{order.shipping_info?.email || order.profiles?.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1 max-w-[200px]">
                                                    <span className="text-sm font-bold block mb-1">{order.shipping_info?.address || "—"}</span>
                                                    {order.shipping_info?.apartment && <span className="text-sm text-neutral-300 block">Apto: {order.shipping_info.apartment}</span>}
                                                    <span className="text-white text-sm block">{order.shipping_info?.neighborhood}</span>
                                                    <span className="text-neutral-300 font-serif text-sm block">{order.shipping_info?.city}, {order.shipping_info?.department}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-2 max-w-[250px]">
                                                    {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-start border-b border-white/5 pb-1 last:border-0 gap-2">
                                                            <span className="text-white line-clamp-2 leading-tight text-sm">{item.quantity}x <span className="text-neutral-400">{item.name}</span></span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top text-neutral-300 text-sm">{new Date(order.created_at).toLocaleDateString()} <br /> <span className="text-neutral-400 text-sm">{new Date(order.created_at).toLocaleTimeString()}</span></td>
                                            <td className="p-4 align-top">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                    className={`cursor-pointer bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-gold transition-colors font-bold uppercase tracking-wider ${order.status === 'pending' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' :
                                                        order.status === 'processing' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                                            order.status === 'completed' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'
                                                        }`}
                                                >
                                                    <option value="pending" className="bg-black text-yellow-500">Pendiente</option>
                                                    <option value="processing" className="bg-black text-blue-400">Activo / Procesando</option>
                                                    <option value="completed" className="bg-black text-green-500">Completado</option>
                                                    <option value="cancelled" className="bg-black text-red-500">Cancelado</option>
                                                </select>
                                            </td>
                                            <td className="p-4 align-top text-gold font-bold font-mono text-base">${Number(order.total).toLocaleString('es-CO')}</td>
                                            <td className="p-4 align-top">
                                                {order.status === 'completed' || order.status === 'cancelled' ? (
                                                    <div className="text-neutral-500 italic text-sm max-w-[200px] break-words">{order.description || "Sin notas"}</div>
                                                ) : (
                                                    <textarea
                                                        defaultValue={order.description || ""}
                                                        onBlur={(e) => handleUpdateOrderDescription(order.id, e.target.value)}
                                                        placeholder="Agregar nota..."
                                                        className="bg-transparent border border-white/10 w-full min-w-[200px] focus:border-gold outline-none transition-colors text-white placeholder:text-neutral-700 focus:bg-white/5 p-2 rounded text-sm resize-y min-h-[80px]"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr><td colSpan={8} className="p-12 text-center text-neutral-500 italic font-serif">No hay pedidos en esta sección.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'config': return (
                <div className="space-y-12">
                    {/* Hero Section */}
                    <div className="border-b border-white/10 pb-12">
                        <h2 className="text-2xl font-serif text-white mb-6">Carrusel Hero</h2>
                        <form onSubmit={handleAddHeroImage} className="flex gap-4 mb-8 bg-neutral-900 p-4 rounded-lg border border-white/20">
                            <input
                                value={newHeroImage}
                                onChange={e => setNewHeroImage(e.target.value)}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className="flex-1 bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-gold outline-none rounded"
                            />
                            <button type="submit" disabled={isSubmittingHero} className="bg-gold px-6 py-2 text-black font-bold uppercase text-xs hover:bg-white transition-colors rounded relative">
                                <Plus size={16} />
                                <span className="absolute -top-3 -right-3 bg-neutral-800/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/20">
                                    {heroImages.length}/6
                                </span>
                            </button>
                        </form>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {heroImages.map(img => (
                                <div key={img.id} className="relative aspect-video group rounded-lg overflow-hidden border border-white/20 bg-neutral-800 shadow-lg">
                                    <img src={img.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    {editingHeroId === img.id ? (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
                                            <div className="flex items-center gap-2 bg-black border border-white/30 p-2 rounded-full shadow-xl w-full max-w-[90%]">
                                                <input
                                                    value={editHeroUrl}
                                                    onChange={e => setEditHeroUrl(e.target.value)}
                                                    className="flex-1 bg-transparent text-white text-xs font-mono outline-none px-2"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSaveEditHero(img.id);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log("Save clicked for", img.id);
                                                        handleSaveEditHero(img.id);
                                                    }}
                                                    className="text-green-500 hover:text-green-400 p-1 transition-transform active:scale-95"
                                                    title="Guardar cambios"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleCancelEditHero();
                                                    }}
                                                    className="text-red-500 hover:text-red-400 p-1 transition-transform active:scale-95"
                                                    title="Cancelar"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute top-2 right-2 flex gap-2 bg-black/50 p-1 rounded-full backdrop-blur-sm z-10">
                                                <button onClick={() => handleStartEditHero(img)} className="bg-white text-black p-2 rounded-full hover:bg-gold"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteHeroImage(img.id)} className="bg-black text-white p-2 rounded-full hover:bg-red-600 border border-white/10"><Trash2 size={14} /></button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-[10px] font-mono text-neutral-400 truncate border-t border-white/10">
                                                {img.image_url}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Brands Section */}
                    <div>
                        <h2 className="text-2xl font-serif text-white mb-6">Marcas</h2>
                        <form onSubmit={handleAddBrand} className="flex gap-4 mb-8 bg-neutral-900 p-4 rounded-lg border border-white/20 flex-col md:flex-row">
                            <input
                                value={newBrandName}
                                onChange={e => setNewBrandName(e.target.value)}
                                placeholder="Nombre de la marca (ej. Versace)"
                                className="flex-1 bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-gold outline-none rounded"
                            />
                            <input
                                value={newBrandLogo}
                                onChange={e => setNewBrandLogo(e.target.value)}
                                placeholder="URL del Logo (Opcional)"
                                className="flex-1 bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-gold outline-none rounded"
                            />
                            <button type="submit" disabled={isSubmittingBrand} className="bg-gold px-6 py-2 text-black font-bold uppercase text-xs hover:bg-white transition-colors rounded relative">
                                <Plus size={16} />
                                <span className="absolute -top-4 -right-2 bg-neutral-800/80 text-white text-[9px] font-mono px-2 py-0.5 rounded border border-white/20 whitespace-nowrap">
                                    {brands.length} Marcas
                                </span>
                            </button>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {brands.map(b => (
                                <div key={b.id} className="bg-neutral-900/40 border border-white/10 p-4 rounded flex justify-between items-center group hover:border-white/30 transition-colors">
                                    {editingBrandId === b.id ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <input
                                                value={editBrandName}
                                                onChange={e => setEditBrandName(e.target.value)}
                                                className="w-full bg-black border border-white/30 p-2 text-xs text-white focus:border-gold outline-none rounded"
                                                autoFocus
                                                placeholder="Nombre"
                                            />
                                            <input
                                                value={editBrandLogo}
                                                onChange={e => setEditBrandLogo(e.target.value)}
                                                className="w-full bg-black border border-white/30 p-2 text-xs text-white focus:border-gold outline-none rounded"
                                                placeholder="URL Logo"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEditBrand(b.id)}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleSaveEditBrand(b.id)} className="text-green-500 hover:text-green-400 p-1"><Check size={16} /></button>
                                                <button onClick={handleCancelEditBrand} className="text-red-500 hover:text-red-400 p-1"><X size={16} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {b.logo_url ? (
                                                    <div className="w-8 h-8 bg-white/5 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                                                        <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-[10px] text-neutral-500 font-mono border border-white/10 flex-shrink-0">
                                                        {b.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-xs font-mono font-bold text-white uppercase truncate">{b.name}</span>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleStartEditBrand(b)} className="text-neutral-400 hover:text-white p-1"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteBrand(b.id)} className="text-neutral-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
            default:
                return (
                    <div>
                        <h2 className="text-3xl font-serif text-white mb-8 border-b border-white/10 pb-6">Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Card 1: Users */}
                            <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-lg hover:border-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono mb-1">Clientes Registrados</p>
                                        <h3 className="text-4xl font-serif text-white">{stats.users}</h3>
                                    </div>
                                    <div className="bg-blue-500/10 p-3 rounded-full text-blue-500"><Users size={24} /></div>
                                </div>
                            </div>

                            {/* Card 2: Total Sales */}
                            <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-lg hover:border-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono mb-1">Ventas Totales</p>
                                        <h3 className="text-4xl font-serif text-gold">${stats.sales.toLocaleString()}</h3>
                                    </div>
                                    <div className="bg-gold/10 p-3 rounded-full text-gold"><LayoutDashboard size={24} /></div>
                                </div>
                            </div>

                            {/* Card 3: Pending Orders */}
                            <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-lg hover:border-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono mb-1">Pedidos Pendientes</p>
                                        <h3 className="text-4xl font-serif text-yellow-500">{stats.pending}</h3>
                                    </div>
                                    <div className="bg-yellow-500/10 p-3 rounded-full text-yellow-500"><Package size={24} /></div>
                                </div>
                            </div>

                            {/* Card 4: Active Orders */}
                            <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-lg hover:border-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono mb-1">Pedidos Activos</p>
                                        <h3 className="text-4xl font-serif text-blue-400">{stats.active}</h3>
                                    </div>
                                    <div className="bg-blue-400/10 p-3 rounded-full text-blue-400"><RefreshCcw size={24} /></div>
                                </div>
                            </div>

                            {/* Card 5: Completed Orders */}
                            <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-lg hover:border-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono mb-1">Completados</p>
                                        <h3 className="text-4xl font-serif text-green-500">{stats.completed}</h3>
                                    </div>
                                    <div className="bg-green-500/10 p-3 rounded-full text-green-500"><Check size={24} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />
            <div className="px-6 md:px-12 lg:px-24 mb-6"><h1 className="text-4xl md:text-6xl font-serif mb-2">Administración</h1></div>
            <div className="px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-4 gap-8 pb-24">
                <aside className="border-r border-white/10 pr-8 h-full flex flex-col gap-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'products', label: 'Productos', icon: Package },
                        { id: 'users', label: 'Usuarios', icon: Users },
                        { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
                        { id: 'config', label: 'Configuración', icon: Settings },
                    ].map(sec => (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg text-left font-mono text-sm uppercase transition-colors ${activeSection === sec.id ? 'bg-white/5 text-gold' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <sec.icon size={18} />
                            {sec.label}
                        </button>
                    ))}
                    <div className="mt-auto pt-8"><button onClick={handleLogout} className="text-red-500 text-sm font-mono flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors w-full"><LogOut size={16} /> Salir</button></div>
                </aside>
                <div className="lg:col-span-3">{renderContent()}</div>
            </div>
            <Footer />
            {/* <ToastContainer toasts={toasts} removeToast={removeToast} /> */}
        </main>
    );
}
