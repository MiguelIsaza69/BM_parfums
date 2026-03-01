"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Printer, Mail, ArrowLeft, ShoppingBag, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sileo } from "sileo";

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAdmin = searchParams.get('from') === 'admin';

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!params?.id) return;

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error("Error fetching order:", error);
                router.push(isAdmin ? '/admin' : '/catalogo'); // Fallback
                return;
            }

            setOrder(data);
            setLoading(false);
        };

        fetchOrder();
    }, [params?.id, router, isAdmin]);

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const handleSendEmail = async () => {
        if (!order) return;
        setSendingEmail(true);

        try {
            console.log("Attempting to send email...");

            // Check essential data
            if (!order.shipping_info?.email) {
                sileo.error({
                    title: "Correo no encontrado",
                    description: "No hay un correo asociado a este pedido."
                });
                setSendingEmail(false);
                return;
            }

            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order.id,
                    email: order.shipping_info.email,
                    name: order.shipping_info.name || "Cliente",
                    items: order.items || [],
                    total: order.total || 0,
                    shipping_info: order.shipping_info
                }),
                signal: AbortSignal.timeout(8000) // 8 second timeout
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setEmailSent(true);
                // Alert removed for smoother UX
                setTimeout(() => setEmailSent(false), 5000);
            } else {
                console.error("Server responded with error:", data);
                sileo.error({
                    title: "Error al enviar",
                    description: data.error || "Error desconocido"
                });
            }
        } catch (error: any) {
            console.error("Catch Error sending email:", error);
            sileo.error({
                title: "Error de red",
                description: "Hubo un problema al intentar enviar el correo. Por favor intenta nuevamente."
            });
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-pulse text-gold font-mono text-xl">Cargando pedido...</div>
            </main>
        );
    }

    if (!order) return null;

    const { shipping_info, items, total, id, created_at, status } = order;

    return (
        <main className="min-h-screen bg-black text-white print:bg-white print:text-black">
            <div className="print:hidden">
                <Header />
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-24 print:pt-8 print:pb-8">

                {/* Status Banner - Only for Customers */}
                {!isAdmin && (
                    <div className="bg-gold/10 border border-gold/20 p-8 rounded-lg mb-12 flex flex-col items-center text-center print:hidden">
                        <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mb-4 text-black">
                            <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <h1 className="text-3xl font-serif text-white mb-2">¡Pedido Recibido!</h1>
                        <p className="text-neutral-400 font-mono text-sm max-w-md">
                            Tu pedido ha sido tomado exitosamente. Recibirás tus productos en un lapso de <strong>3 a 5 días hábiles</strong>.
                        </p>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap gap-4 mb-8 print:hidden">
                    {isAdmin ? (
                        <>
                            <Link href="/admin" className="flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-white/20 hover:bg-neutral-800 rounded transition-colors text-sm font-mono uppercase tracking-widest text-white">
                                <LayoutDashboard size={16} /> Volver al Panel Admin
                            </Link>
                            <div className="flex-1"></div>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 bg-gold text-black hover:bg-white rounded transition-colors text-sm font-mono uppercase tracking-widest font-bold"
                            >
                                <Printer size={16} /> Imprimir Factura
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/catalogo" className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:bg-white/10 rounded transition-colors text-sm font-mono uppercase tracking-widest text-neutral-300">
                                <ArrowLeft size={16} /> Volver a la Tienda
                            </Link>
                            {order.user_id && (
                                <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:bg-white/10 rounded transition-colors text-sm font-mono uppercase tracking-widest text-neutral-300">
                                    <ShoppingBag size={16} /> Mis Pedidos
                                </Link>
                            )}
                            <div className="flex-1"></div>
                            <button
                                onClick={handleSendEmail}
                                disabled={sendingEmail || emailSent}
                                className={`flex items-center gap-2 px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-black rounded transition-colors text-sm font-mono uppercase tracking-widest ${sendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Mail size={16} />
                                {sendingEmail ? 'Enviando...' : emailSent ? '¡Enviado!' : 'Enviar a Correo'}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded transition-colors text-sm font-mono uppercase tracking-widest font-bold"
                            >
                                <Printer size={16} /> Imprimir Factura
                            </button>
                        </>
                    )}
                </div>

                {/* Invoice Container */}
                <div className="bg-white text-black p-8 md:p-12 max-w-4xl mx-auto shadow-2xl print:shadow-none print:w-full print:max-w-none">

                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                        <div>
                            <h2 className="text-3xl font-serif font-bold tracking-tighter mb-2">BM PARFUMS</h2>
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Factura de Venta</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-sm font-bold">Pedido #{id.slice(0, 8).toUpperCase()}</p>
                            <p className="font-mono text-xs text-neutral-500">{new Date(created_at).toLocaleDateString()} {new Date(created_at).toLocaleTimeString()}</p>
                            <div className="mt-2 inline-block px-3 py-1 bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded border border-neutral-200">
                                Pendiente
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 border-b border-neutral-200 pb-2">Cliente</h3>
                            <p className="font-serif font-bold text-lg">{shipping_info.name}</p>
                            <p className="font-mono text-sm text-neutral-600">{shipping_info.email}</p>
                            <p className="font-mono text-sm text-neutral-600">{shipping_info.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 border-b border-neutral-200 pb-2">Dirección de Envío</h3>
                            <p className="font-serif text-lg">{shipping_info.address}</p>
                            {shipping_info.apartment && <p className="font-mono text-sm text-neutral-600">Apto/Unidad: {shipping_info.apartment}</p>}
                            <p className="font-mono text-sm text-neutral-600">
                                {shipping_info.neighborhood}, {shipping_info.city}
                            </p>
                            <p className="font-mono text-sm text-neutral-600 uppercase">{shipping_info.department}, COLOMBIA</p>
                            {shipping_info.details && <p className="font-mono text-xs text-neutral-500 mt-2 italic">Ref: {shipping_info.details}</p>}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="py-3 text-xs font-mono uppercase tracking-widest text-neutral-500 w-[50%]">Producto</th>
                                    <th className="py-3 text-xs font-mono uppercase tracking-widest text-neutral-500 text-center">Cant.</th>
                                    <th className="py-3 text-xs font-mono uppercase tracking-widest text-neutral-500 text-right">Precio Unit.</th>
                                    <th className="py-3 text-xs font-mono uppercase tracking-widest text-neutral-500 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <p className="font-serif font-bold text-sm">{item.name}</p>
                                            <p className="text-[10px] font-mono uppercase text-neutral-500">{item.brand}</p>
                                        </td>
                                        <td className="py-4 text-center font-mono text-sm">{item.quantity}</td>
                                        <td className="py-4 text-right font-mono text-sm">${item.price.toLocaleString('es-CO')}</td>
                                        <td className="py-4 text-right font-mono text-sm font-bold">${(item.price * item.quantity).toLocaleString('es-CO')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 space-y-3">
                            <div className="flex justify-between text-sm font-mono text-neutral-600">
                                <span>Subtotal</span>
                                <span>${total.toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between text-sm font-mono text-neutral-600">
                                <span>Envío</span>
                                <span>$0 (Envío Gratis)</span>
                            </div>
                            <div className="flex justify-between text-xl font-serif font-bold border-t-2 border-black pt-4 mt-4">
                                <span>Total</span>
                                <span>${total.toLocaleString('es-CO')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="mt-16 pt-8 border-t border-neutral-200 text-center">
                        <p className="text-[10px] font-mono uppercase text-neutral-400">
                            Gracias por tu compra. Si tienes alguna pregunta, contáctanos en Bmparfums.med@gmail.com
                        </p>
                    </div>

                </div>
            </div>

            <div className="print:hidden">
                <Footer />
            </div>
        </main>
    );
}
