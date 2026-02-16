"use client";

import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
    const { items, total } = useCart();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        phone: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = async () => {
        // 0. Validations
        if (!formData.name || !formData.email || !formData.address || !formData.phone) {
            alert("Por favor completa todos los campos de envío.");
            return;
        }

        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Create Order in DB
        const { data: order, error } = await supabase.from('orders').insert([{
            user_id: user?.id || null,
            total: total,
            status: 'pending',
            shipping_info: formData,
            items: items
        }]).select().single();

        if (error) {
            console.error("Error creating order:", error);
            alert("Hubo un error al procesar tu pedido. Por favor intenta nuevamente.");
            return;
        }

        // 3. Configuración de Wompi
        const PUBLIC_KEY = "pub_test_X5w5X5w5X5w5X5w5X5w5X5w5X5w5X5w5"; // Llave de prueba de Wompi
        const currency = "COP";
        const totalInCents = total * 100; // Wompi usa centavos
        const reference = order.id; // Usar ID real del pedido
        const redirectUrl = `${window.location.origin}/catalogo?status=success&order_id=${order.id}`;

        // 4. Construir URL de Wompi
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${PUBLIC_KEY}&currency=${currency}&amount-in-cents=${totalInCents}&reference=${reference}&redirect-url=${redirectUrl}`;

        // 5. Redirigir al usuario
        window.location.href = wompiUrl;
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

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-mono uppercase text-neutral-400">Dirección</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono uppercase text-neutral-400">Ciudad</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-transparent border-b border-white/20 py-2 focus:border-gold outline-none transition-colors"
                                    />
                                </div>
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

                            <button type="submit" className="mt-4 bg-gold text-black font-bold uppercase py-4 hover:bg-white transition-colors tracking-widest">
                                Proceder al Pago
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
