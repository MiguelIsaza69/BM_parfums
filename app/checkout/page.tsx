"use client";

import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { departments, colombiaData } from "@/lib/colombia-data";
import { sileo } from "sileo";

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        phone: "",
        department: "",
        neighborhood: "",
        apartment: "",
        details: ""
    });

    const [userAddresses, setUserAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

    // Derived state for cities based on selected department in form
    const availableCities = formData.department ? (colombiaData as any)[formData.department] || [] : [];
    const departmentsList = departments;

    useEffect(() => {
        const loadUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // 1. Basic Info from Auth
                const meta = user.user_metadata || {};
                const baseData = {
                    name: meta.full_name || "",
                    email: user.email || "",
                    phone: meta.phone || "",
                    address: "",
                    city: "",
                    department: "",
                    neighborhood: "",
                    apartment: "",
                    details: ""
                };

                setFormData(prev => ({ ...prev, name: baseData.name, email: baseData.email, phone: baseData.phone }));

                // 2. Fetch User Addresses
                const { data: addresses } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false }); // Default first

                if (addresses && addresses.length > 0) {
                    setUserAddresses(addresses);
                    // Select default address automatically
                    const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
                    setSelectedAddressId(defaultAddr.id);
                    fillAddressForm(defaultAddr);
                }
            }
        };
        loadUserData();
    }, []);

    const fillAddressForm = (addr: any) => {
        setFormData(prev => ({
            ...prev,
            address: addr.full_address || "",
            city: addr.city || "",
            department: addr.department || "",
            neighborhood: addr.neighborhood || "",
            apartment: addr.apartment || "",
            details: addr.details || ""
        }));
    };

    const handleAddressSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedAddressId(value);

        if (value === "new") {
            // Clear address fields but keep contact info
            setFormData(prev => ({
                ...prev,
                address: "",
                city: "",
                department: "",
                neighborhood: "",
                apartment: "",
                details: ""
            }));
        } else {
            const selected = userAddresses.find(a => a.id === value);
            if (selected) fillAddressForm(selected);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // If user manually types address, switch select to "new" to indicate custom entry, unless editing current selection (optional logic, keeping simple for now)
        if (selectedAddressId !== "new" && ["address", "city", "department", "neighborhood", "apartment", "details"].includes(name)) {
            setSelectedAddressId("new");
        }
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        console.log("Iniciando proceso de pago...", formData);

        // 0. Validations
        const missingFields = [];
        if (!formData.name) missingFields.push("Nombre Completo");
        if (!formData.email) missingFields.push("Email");
        if (!formData.phone) missingFields.push("Teléfono");
        if (!formData.department) missingFields.push("Departamento");
        if (!formData.city) missingFields.push("Ciudad");
        if (!formData.neighborhood) missingFields.push("Barrio");
        if (!formData.address) missingFields.push("Dirección");

        if (missingFields.length > 0) {
            sileo.error({
                title: "Campos incompletos",
                description: `Por favor completa: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`
            });
            setIsProcessing(false);
            return;
        }

        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();

        // 2 Create Order in 'pending' status
        const { data: order, error } = await supabase.from('orders').insert([{
            user_id: user?.id || null,
            total: total,
            status: 'pending',
            shipping_info: formData,
            items: items
        }]).select().single();

        if (error) {
            console.error("Error creating order:", JSON.stringify(error, null, 2));
            console.error("Error Message:", error.message);
            console.error("Error Details:", error.details);
            console.error("Error Hint:", error.hint);
            console.error("Error Code:", error.code);
            sileo.error({
                title: "Error de pedido",
                description: `Hubo un error (${error.code}): ${error.message || "Intenta nuevamente."}`
            });
            setIsProcessing(false);
            return;
        }

        // 3. Prepare Wompi Data (EXACT INTEGERS ONLY)
        const amountInCents = Math.floor(total * 100);
        const reference = order.id;
        const currency = 'COP';

        try {
            // 4. Get Integrity Signature from Server
            const sigResponse = await fetch('/api/wompi/integrity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, amountInCents, currency })
            });
            const { signature } = await sigResponse.json();

            if (!signature) throw new Error("Could not generate signature");

            const publicKey = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '').trim();
            if (!publicKey || publicKey.length < 10) {
                throw new Error("Llave pública de Wompi inválida o ausente en .env.local");
            }

            console.log("Iniciando con Public Key:", publicKey);

            // 5. Open Wompi Widget (Modal) - Improved Reliability
            const scriptId = 'wompi-widget-script';
            const openWidget = () => {
                console.log("Intentando abrir Widget de Wompi...");
                try {
                    // @ts-ignore
                    if (typeof window.WidgetCheckout === 'undefined') {
                        console.warn("Widget aún no cargado, re-intentando...");
                        setTimeout(openWidget, 1000);
                        return;
                    }

                    // Usar llave de variable de entorno o fallback del dashboard
                    const checkoutKey = publicKey || "pub_test_ouThMFD7jJjB5fyKV6NaJU1i0GWUEWa0";

                    // Limpiar teléfono (solo números) para evitar errores de validación
                    const cleanPhone = formData.phone.replace(/\D/g, '').replace(/^57/, '');

                    // Asegurar que la dirección tenga al menos 10 caracteres (requisito de Wompi)
                    const fullAddress = `${formData.address}${formData.apartment ? ' - ' + formData.apartment : ''}`;
                    const validatedAddress = fullAddress.length < 10 ? `${fullAddress} - Colombia` : fullAddress;

                    // @ts-ignore
                    const checkout = new window.WidgetCheckout({
                        currency: 'COP',
                        amountInCents: amountInCents,
                        reference: reference,
                        publicKey: checkoutKey,
                        signature: signature,
                        redirectUrl: `${window.location.origin}/order-confirmation/${reference}`,
                        customerData: {
                            email: formData.email,
                            fullName: formData.name,
                            phoneNumber: cleanPhone,
                            phoneNumberPrefix: '+57'
                        },
                        shippingAddress: {
                            addressLine1: validatedAddress,
                            city: formData.city,
                            phoneNumber: cleanPhone,
                            phoneNumberPrefix: '+57',
                            region: formData.department,
                            country: 'CO'
                        }
                    });

                    checkout.open((result: any) => {
                        console.log('Transaction Result:', result);
                        const transaction = result.transaction;
                        if (transaction?.status === 'APPROVED') {
                            clearCart();
                            window.location.href = `/order-confirmation/${reference}`;
                        }
                    });

                    setIsProcessing(false);
                    console.log("Widget abierto correctamente");
                } catch (err) {
                    console.error("Widget initialization error:", err);
                    setIsProcessing(false);
                    throw new Error("No se pudo inicializar la pasarela");
                }
            };

            if (!document.getElementById(scriptId)) {
                console.log("Cargando script de Wompi (SANDBOX)...");
                const script = document.createElement('script');
                script.id = scriptId;
                // URL para pruebas (Sandbox)
                script.src = 'https://checkout.wompi.co/widget.js';
                // Nota: Wompi a veces usa la misma URL pero detecta la llave. 
                // Sin embargo, si falla con 403, es porque la cuenta no está activa para producción.
                script.async = true;
                script.onload = () => {
                    console.log("Script de Wompi cargado, inicializando...");
                    setTimeout(openWidget, 500);
                };
                script.onerror = () => {
                    setIsProcessing(false);
                    sileo.error({ title: "Error", description: "No se pudo cargar el script de Wompi" });
                };
                document.body.appendChild(script);
            } else {
                openWidget();
            }

        } catch (err) {
            console.error("Payment setup error:", err);
            sileo.error({
                title: "Error de pasarela",
                description: "No pudimos conectar con la pasarela de pago. Intenta más tarde."
            });
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-black text-white pt-32 p-8 flex flex-col items-center">
                <Header />
                <h1 className="text-4xl font-serif mb-4">Tu carrito está vacío</h1>
                <Link href="/catalogo" className="text-gold hover:underline font-mono uppercase">
                    Volver al catálogo
                </Link>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans">
            <Header />

            <div className="container mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-24">
                <Link href="/catalogo" className="flex items-center gap-2 text-neutral-400 hover:text-gold mb-8 uppercase font-mono text-xs tracking-widest">
                    <ArrowLeft size={14} /> Volver a comprar
                </Link>

                <h1 className="text-4xl md:text-5xl font-serif mb-12">Finalizar Compra</h1>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* Form Section */}
                    <div className="flex-1">
                        <h2 className="text-xl font-serif mb-6 text-gold">Información de Envío</h2>
                        <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>

                            {/* Saved Addresses Selector */}
                            {userAddresses.length > 0 && (
                                <div className="bg-neutral-900/50 p-4 border border-white/10 rounded mb-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400 block mb-2">Usar dirección guardada</label>
                                    <select
                                        value={selectedAddressId}
                                        onChange={handleAddressSelection}
                                        className="w-full bg-black border border-white/20 p-3 text-sm text-white focus:border-gold outline-none cursor-pointer rounded"
                                    >
                                        <option value="new">-- Nueva Dirección --</option>
                                        {userAddresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.alias} - {addr.full_address}, {addr.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Departamento</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-black text-neutral-500">Seleccionar...</option>
                                        {departmentsList.map(dept => (
                                            <option key={dept} value={dept} className="bg-black">{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Ciudad</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.department}
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="" className="bg-black text-neutral-500">Seleccionar...</option>
                                        {availableCities.map((city: string) => (
                                            <option key={city} value={city} className="bg-black">{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Barrio</label>
                                    <input
                                        type="text"
                                        name="neighborhood"
                                        value={formData.neighborhood}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-mono uppercase text-neutral-400">Dirección</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Calle 123 # 45 - 67"
                                    className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors placeholder:text-neutral-700"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Apartamento / Unidad (Opcional)</label>
                                    <input
                                        type="text"
                                        name="apartment"
                                        value={formData.apartment}
                                        onChange={handleInputChange}
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Detalles / Referencias (Opcional)</label>
                                    <input
                                        type="text"
                                        name="details"
                                        value={formData.details}
                                        onChange={handleInputChange}
                                        placeholder="Fachada blanca, tercer piso..."
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors placeholder:text-neutral-700"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-neutral-900/30 border border-white/10 rounded-lg">
                                <h3 className="text-sm font-mono text-neutral-300 mb-4 flex items-center gap-2">
                                    <CreditCard size={16} /> Pasarela de Pago
                                </h3>
                                <p className="text-xs text-neutral-500 mb-4">
                                    Serás redirigido a una pasarela segura para completar tu pago. Aceptamos tarjetas, PSE y efectivo.
                                </p>
                                <div className="flex gap-4 opacity-50">
                                    {/* Placeholders for payment icons */}
                                    <div className="w-10 h-6 bg-white/20 rounded" />
                                    <div className="w-10 h-6 bg-white/20 rounded" />
                                    <div className="w-10 h-6 bg-white/20 rounded" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="mt-4 bg-gold text-black font-bold uppercase py-4 hover:bg-white transition-colors tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "Procesando..." : "Proceder al Pago"}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white/5 border border-white/10 p-8 sticky top-32 backdrop-blur-sm">
                            <h2 className="text-xl font-serif mb-6 border-b border-white/10 pb-4">Resumen</h2>

                            <div className="flex flex-col gap-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-16 bg-white shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-1 mix-blend-multiply"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">{item.brand}</p>
                                            <p className="text-sm font-serif line-clamp-1">{item.name}</p>
                                            <p className="text-xs font-mono text-gold mt-1">
                                                {item.quantity} x ${item.price.toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-sm font-mono text-neutral-400 border-t border-white/10 pt-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${total.toLocaleString('es-CO')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Envío</span>
                                    <span>Calculado en el siguiente paso</span>
                                </div>
                                <div className="flex justify-between text-white text-lg font-bold border-t border-white/10 pt-4 mt-2">
                                    <span>Total</span>
                                    <span>${total.toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
