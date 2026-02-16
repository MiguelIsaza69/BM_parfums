"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { User, ShoppingBag, Settings, LogOut } from "lucide-react";
import { departments, colombiaData } from "@/lib/colombia-data";

export default function UserDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({
        alias: "",
        full_address: "",
        department: "",
        city: "",
        neighborhood: "",
        apartment: "",
        details: ""
    });

    // Derived state for cities based on selected department
    const availableCities = newAddress.department ? (colombiaData as any)[newAddress.department] || [] : [];

    const [user, setUser] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    const fetchAddresses = async (userId: string) => {
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (data) setAddresses(data);
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/");
                return;
            }

            // Fetch user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            // Merge strategy: Use profile data if available, otherwise fallback to auth metadata
            const meta = session.user.user_metadata;
            const finalUser = {
                ...profile,
                email: session.user.email,
                full_name: profile?.full_name || meta.full_name || "",
                phone: profile?.phone || meta.phone || ""
            };

            setUser(finalUser);
            fetchAddresses(session.user.id);
            setLoading(false);
        };

        checkUser();
    }, [router]);

    const handleUpdateProfile = async () => {
        setMessage(null);
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: newName,
                    phone: newPhone
                })
                .eq('id', user.id);

            if (error) throw error;

            setUser({ ...user, full_name: newName, phone: newPhone });
            setIsEditing(false);
            setMessage("Perfil actualizado correctamente.");
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage("Error al actualizar: " + error.message);
        }
    };

    const startEditing = () => {
        setNewName(user?.full_name || "");
        setNewPhone(user?.phone || "");
        setIsEditing(true);
    };

    const handleAddAddress = async () => {
        if (!user) return;
        if (addresses.length >= 3) {
            setMessage("Solo puedes tener un máximo de 3 direcciones.");
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        // Basic validation
        if (!newAddress.alias || !newAddress.full_address || !newAddress.department || !newAddress.city || !newAddress.neighborhood) {
            setMessage("Por favor completa todos los campos obligatorios.");
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            const { error } = await supabase
                .from('addresses')
                .insert([{
                    user_id: user.id,
                    alias: newAddress.alias,
                    full_address: newAddress.full_address,
                    department: newAddress.department,
                    city: newAddress.city,
                    neighborhood: newAddress.neighborhood,
                    apartment: newAddress.apartment,
                    details: newAddress.details,
                    is_default: addresses.length === 0 // Make default if it's the first one
                }]);

            if (error) throw error;

            await fetchAddresses(user.id);
            setIsAddressModalOpen(false);
            setNewAddress({ alias: "", full_address: "", department: "", city: "", neighborhood: "", apartment: "", details: "" });
            setMessage("Dirección agregada correctamente.");
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage("Error al agregar dirección: " + error.message);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchAddresses(user.id);
        } catch (error: any) {
            setMessage("Error al eliminar dirección: " + error.message);
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        if (!user) return;
        try {
            // First set all to false
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);

            // Then set selected to true
            await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', id);

            await fetchAddresses(user.id);
        } catch (error: any) {
            setMessage("Error al establecer dirección predeterminada: " + error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold font-mono">Loading...</div>;

    return (
        <main className="min-h-screen bg-black text-white pt-32">
            <Header />

            <div className="px-6 md:px-12 lg:px-24 mb-12">
                <h1 className="text-4xl md:text-6xl font-sans mb-4">Mi Cuenta</h1>
                <p className="text-neutral-400 font-mono text-sm max-w-xl">
                    Bienvenido, <span className="text-gold">{user?.full_name || "Usuario"}</span>.
                </p>
                {message && <p className="text-xs font-mono text-green-400 mt-2">{message}</p>}
            </div>

            <div className="px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-8 pb-24">
                {/* Sidebar Navigation */}
                <aside className="border-r border-white/10 pr-8 h-full flex flex-col gap-4">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-3 p-3 border rounded-lg transition-colors text-left ${activeTab === 'orders' ? 'bg-white/5 border-gold text-white' : 'border-transparent hover:bg-white/5 hover:border-white/10 text-neutral-400'}`}
                    >
                        <ShoppingBag size={18} className={activeTab === 'orders' ? 'text-gold' : 'text-neutral-400'} />
                        <span className="font-mono text-sm uppercase tracking-wider">Mis Pedidos</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-3 p-3 border rounded-lg transition-colors text-left ${activeTab === 'profile' ? 'bg-white/5 border-gold text-white' : 'border-transparent hover:bg-white/5 hover:border-white/10 text-neutral-400'}`}
                    >
                        <User size={18} className={activeTab === 'profile' ? 'text-gold' : 'text-neutral-400'} />
                        <span className="font-mono text-sm uppercase tracking-wider">Perfil</span>
                    </button>

                    <div className="mt-auto pt-8 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors text-sm font-mono uppercase tracking-wider"
                        >
                            <LogOut size={16} />
                            Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-8">
                    {activeTab === 'orders' && (
                        <div className="border border-white/10 p-6 rounded-lg bg-neutral-900/20">
                            <h2 className="text-xl font-sans mb-6">Pedidos Recientes</h2>

                            {/* Placeholder for now */}
                            <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                                No hay pedidos recientes.
                                <br />
                                <Link href="/catalogo" className="text-gold mt-2 block hover:underline cursor-pointer">
                                    Explorar Catálogo →
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="flex flex-col gap-6">
                            <div className="border border-white/10 p-6 rounded-lg bg-neutral-900/20 relative group">
                                <h3 className="text-sm font-mono uppercase text-neutral-400 mb-6 flex justify-between items-center">
                                    Información Personal
                                    {!isEditing && (
                                        <button
                                            onClick={startEditing}
                                            className="text-xs text-gold hover:text-white transition-colors"
                                        >
                                            EDITAR
                                        </button>
                                    )}
                                </h3>

                                {isEditing ? (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="text-xs text-neutral-500 font-mono mb-1 block">Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="w-full bg-black border border-gold text-white p-2 text-sm font-sans focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500 font-mono mb-1 block">Teléfono</label>
                                            <input
                                                type="text"
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                                className="w-full bg-black border border-gold text-white p-2 text-sm font-sans focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={handleUpdateProfile}
                                                className="bg-gold text-black text-xs font-bold uppercase px-4 py-2 hover:bg-white transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="border border-white/20 text-white text-xs font-bold uppercase px-4 py-2 hover:bg-white/10 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <label className="text-xs text-neutral-500 font-mono mb-1 block">Nombre</label>
                                            <p className="font-serif text-lg text-white font-sans">{user?.full_name}</p>
                                        </div>
                                        <div className="mb-4">
                                            <label className="text-xs text-neutral-500 font-mono mb-1 block">Correo Electrónico</label>
                                            <p className="text-sm text-neutral-300 font-mono">{user?.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500 font-mono mb-1 block">Teléfono</label>
                                            <p className="text-sm text-neutral-300 font-mono">{user?.phone || "No registrado"}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="border border-white/10 p-6 rounded-lg bg-neutral-900/20 flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-mono uppercase text-neutral-400">Direcciones ({addresses.length}/3)</h3>
                                    {isAddressModalOpen ? (
                                        <button onClick={() => setIsAddressModalOpen(false)} className="text-xs text-red-500 hover:text-red-400 transition-colors uppercase">Cancelar</button>
                                    ) : (
                                        addresses.length < 3 && (
                                            <button onClick={() => setIsAddressModalOpen(true)} className="text-xs text-gold hover:text-white transition-colors uppercase">+ Agregar</button>
                                        )
                                    )}
                                </div>

                                {isAddressModalOpen && (
                                    <div className="bg-white/5 p-4 rounded mb-4 border border-white/10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 space-y-2 md:space-y-0 text-white font-mono">
                                            <input
                                                type="text"
                                                placeholder="Alias (Ej: Casa, Trabajo)"
                                                value={newAddress.alias}
                                                onChange={(e) => setNewAddress({ ...newAddress, alias: e.target.value })}
                                                className="col-span-1 md:col-span-2 bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none"
                                            />

                                            <select
                                                value={newAddress.department}
                                                onChange={(e) => setNewAddress({ ...newAddress, department: e.target.value, city: "" })}
                                                className="bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
                                            >
                                                <option value="">Departamento</option>
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
                                                disabled={!newAddress.department}
                                            >
                                                <option value="">Ciudad</option>
                                                {availableCities.map((city: string) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>

                                            <input
                                                type="text"
                                                placeholder="Dirección Completa (Ej: Calle 123...)"
                                                value={newAddress.full_address}
                                                onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                                                className="col-span-1 md:col-span-2 bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none"
                                            />

                                            <input
                                                type="text"
                                                placeholder="Barrio"
                                                value={newAddress.neighborhood}
                                                onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                                                className="bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none"
                                            />

                                            <input
                                                type="text"
                                                placeholder="Apartamento (Opcional)"
                                                value={newAddress.apartment}
                                                onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                                                className="bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none"
                                            />

                                            <input
                                                type="text"
                                                placeholder="Detalles / Referencias"
                                                value={newAddress.details}
                                                onChange={(e) => setNewAddress({ ...newAddress, details: e.target.value })}
                                                className="col-span-1 md:col-span-2 bg-black border border-white/20 p-2 text-xs text-white focus:border-gold outline-none"
                                            />

                                            <button
                                                onClick={handleAddAddress}
                                                className="col-span-1 md:col-span-2 bg-gold text-black text-xs font-bold uppercase py-2 hover:bg-white transition-colors mt-2"
                                            >
                                                Guardar Dirección
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {addresses.length === 0 && !isAddressModalOpen ? (
                                    <p className="text-sm text-neutral-500 font-mono italic">No tienes direcciones guardadas.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className={`p-4 rounded border ${addr.is_default ? 'border-gold bg-gold/5' : 'border-white/10 bg-white/5'} flex justify-between items-start`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-sans font-bold text-sm text-white">{addr.alias}</span>
                                                        {addr.is_default && <span className="text-[10px] bg-gold text-black px-1.5 py-0.5 rounded font-bold uppercase">Predeterminada</span>}
                                                    </div>
                                                    <p className="text-xs text-neutral-300 font-mono">
                                                        {addr.full_address} {addr.apartment ? `, Apto ${addr.apartment}` : ''}
                                                    </p>
                                                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                                                        {addr.neighborhood}, {addr.city}, {addr.department}
                                                    </p>
                                                    {addr.details && (
                                                        <p className="text-[10px] text-neutral-500 font-mono mt-1 italic">
                                                            "{addr.details}"
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2 items-end ml-4">
                                                    {!addr.is_default && (
                                                        <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] text-neutral-400 hover:text-gold uppercase transition-colors whitespace-nowrap">
                                                            Hacer Predet.
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] text-red-500 hover:text-red-400 uppercase transition-colors">
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
