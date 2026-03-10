"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Printer, Mail, ArrowLeft, ShoppingBag, LayoutDashboard, X } from "lucide-react";
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
    const [paymentStatus, setPaymentStatus] = useState<'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR' | 'VOIDED' | null>(null);

    useEffect(() => {
        const fetchOrderAndVerifyStatus = async () => {
            if (!params?.id) return;

            // 1. Fetch current order from DB
            const { data: dbOrder, error: dbError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', params.id)
                .single();

            if (dbError || !dbOrder) {
                console.error("Error fetching order:", dbError);
                router.push(isAdmin ? '/admin' : '/catalogo');
                return;
            }

            // 2. Check Wompi Transaction ID in query params (if redirected from successful/failed payment)
            const transactionId = searchParams.get('id');

            if (transactionId) {
                console.log("[Confirmation] Verifying transaction:", transactionId);
                try {
                    const statusRes = await fetch(`/api/wompi/check-status?id=${transactionId}`);
                    const statusData = await statusRes.json();

                    if (statusData && statusData.status) {
                        setPaymentStatus(statusData.status);

                        // 3. Explicitly update DB from client if status changed and webhook hasn't hit yet
                        if (statusData.status === 'APPROVED' && dbOrder.status === 'pending') {
                            await supabase.from('orders').update({
                                status: 'pending', // Reverted to pending per user request
                                payment_id: transactionId,
                                payment_method: statusData.payment_method_type
                            }).eq('id', params.id);
                        } else if (['DECLINED', 'VOIDED', 'ERROR'].includes(statusData.status)) {
                            // Mark as failed instead of deleting so the user can see the error screen
                            await supabase.from('orders').update({ status: 'failed' }).eq('id', params.id);
                            dbOrder.status = 'failed';
                        }
                    }
                } catch (e) {
                    console.error("[Confirmation] Verification failed:", e);
                }
            }

            setOrder(dbOrder);
            setLoading(false);
        };

        fetchOrderAndVerifyStatus();
    }, [params?.id, searchParams, router, isAdmin]);

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    email: order.shipping_info.email,
                    name: order.shipping_info.name || "Cliente",
                    items: order.items || [],
                    total: order.total || 0,
                    shipping_info: order.shipping_info,
                    payment_method: order.payment_method
                }),
                signal: AbortSignal.timeout(8000)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setEmailSent(true);
                setTimeout(() => setEmailSent(false), 5000);
            } else {
                sileo.error({
                    title: "Error al enviar",
                    description: data.error || "Error desconocido"
                });
            }
        } catch (error: any) {
            sileo.error({
                title: "Error de red",
                description: "Hubo un problema al intentar enviar el correo."
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
    const isCOD = order.payment_method === 'CASH_ON_DELIVERY';
    const itemsSubtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    const shippingCost = shipping_info.shipping_cost ?? (total >= 180000 ? 0 : 15000);

    // Reverse calculation to extract fee and discount correctly
    // total = (itemsSubtotal - couponDiscount) * 1.06 + shippingCost
    const baseAmountBeforeFee = isCOD ? Math.round((total - shippingCost) / 1.06) : (total - shippingCost);
    const codFee = total - shippingCost - baseAmountBeforeFee;
    const discountAmount = Math.max(0, itemsSubtotal - baseAmountBeforeFee);
    const hasDiscount = discountAmount > 50;

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="print:hidden">
                <Header />
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-24 print:pt-8 print:bg-white print:text-black">

                {/* Status Banner */}
                {!isAdmin && (
                    <div className={`border p-8 rounded-lg mb-12 flex flex-col items-center text-center print:hidden ${(status === 'processing' || status === 'completed' || status === 'pending')
                        ? 'bg-gold/10 border-gold/20'
                        : status === 'failed'
                            ? 'bg-red-900/10 border-red-900/20'
                            : 'bg-neutral-900/50 border-white/10'
                        }`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-black ${(status === 'processing' || status === 'completed' || status === 'pending')
                            ? 'bg-gold'
                            : status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-neutral-500'
                            }`}>
                            {status === 'failed' ? <X size={32} strokeWidth={3} /> : <CheckCircle size={32} strokeWidth={3} />}
                        </div>

                        {(status === 'processing' || status === 'completed' || status === 'pending') ? (
                            <>
                                <h1 className="text-3xl font-serif text-white mb-2">
                                    {order.payment_method === 'CASH_ON_DELIVERY' ? '¡Pedido Recibido!' : '¡Pedido Confirmado!'}
                                </h1>
                                <p className="text-neutral-400 font-mono text-sm max-w-md">
                                    {order.payment_method === 'CASH_ON_DELIVERY'
                                        ? 'Hemos recibido tu solicitud. Recuerda tener el dinero listo para pagar al momento de recibir tus productos.'
                                        : 'Tu pago ha sido procesado exitosamente.'} Recibirás tus productos en un lapso de <strong>3 a 5 días hábiles</strong>.
                                </p>
                            </>
                        ) : status === 'failed' ? (
                            <>
                                <h1 className="text-3xl font-serif text-white mb-2">Transacción Fallida</h1>
                                <p className="text-red-400 font-mono text-sm max-w-md">
                                    ¡Lo sentimos! Hubo un error en la transacción y <strong>la compra no fue aprobada</strong>.
                                </p>
                                <Link
                                    href="/catalogo"
                                    className="mt-6 bg-white text-black px-8 py-3 rounded font-mono uppercase text-xs font-bold hover:bg-gold transition-colors"
                                >
                                    Intentar Nuevamente
                                </Link>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-serif text-white mb-2">Pedido Pendiente</h1>
                                <p className="text-neutral-400 font-mono text-sm max-w-md">
                                    Estamos esperando la confirmación de tu pago.
                                </p>
                            </>
                        )}
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
                            <div className="flex-1"></div>
                            {(status === 'processing' || status === 'completed' || status === 'pending') && (
                                <>
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={sendingEmail || emailSent}
                                        className={`flex items-center gap-2 px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-black rounded transition-colors text-sm font-mono uppercase tracking-widest ${sendingEmail ? 'opacity-50' : ''}`}
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
                        </>
                    )}
                </div>

                {/* Invoice Structure - Only show if processing/completed/pending or admin */}
                {(status === 'processing' || status === 'completed' || status === 'pending' || isAdmin) ? (
                    <div className="bg-white text-black p-8 md:p-12 rounded shadow-2xl relative overflow-hidden flex flex-col print:shadow-none print:p-0">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                            <div>
                                <h2 className="text-3xl font-serif font-bold tracking-tighter mb-2">BM PARFUMS</h2>
                                <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Factura de Venta</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-sm font-bold">Pedido #{id.slice(0, 8).toUpperCase()}</p>
                                <p className="font-mono text-xs text-neutral-500">{new Date(created_at).toLocaleDateString()} {new Date(created_at).toLocaleTimeString()}</p>
                                <div className={`mt-2 inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${(status === 'processing' || status === 'completed')
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                                    }`}>
                                    {status === 'processing' || (status === 'pending' && order?.payment_id) ? 'Aprobado' : status === 'completed' ? 'Entregado' : 'Pendiente'}
                                </div>
                                <div className="mt-2 block">
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Método de Pago:</p>
                                    <p className="text-xs font-bold uppercase text-neutral-600">
                                        {order.payment_method === 'CASH_ON_DELIVERY' ? 'Contra Entrega' :
                                            order.payment_method === 'BANCOLOMBIA_TRANSFER' ? 'Transferencia Bancolombia' :
                                                'Tarjeta / PSE'}
                                    </p>
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
                                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 border-b border-neutral-200 pb-2">Envío</h3>
                                <p className="font-serif text-lg">{shipping_info.address}</p>
                                {shipping_info.apartment && <p className="font-mono text-sm text-neutral-600">Apto: {shipping_info.apartment}</p>}
                                <p className="font-mono text-sm text-neutral-600">{shipping_info.neighborhood}, {shipping_info.city}</p>
                                <p className="font-mono text-sm text-neutral-600 uppercase">{shipping_info.department}, COLOMBIA</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-12 overflow-x-auto">
                            <table className="w-full text-left font-mono text-sm">
                                <thead>
                                    <tr className="border-b-2 border-black">
                                        <th className="py-3 uppercase tracking-widest text-neutral-500">Producto</th>
                                        <th className="py-3 uppercase tracking-widest text-neutral-500 text-center">Cant.</th>
                                        <th className="py-3 uppercase tracking-widest text-neutral-500 text-right">Precio</th>
                                        <th className="py-3 uppercase tracking-widest text-neutral-500 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {items.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="py-4">
                                                <p className="font-bold">{item.name} <span className="text-[10px] text-neutral-500 font-mono">({item.quality || '1.1'}{item.ml ? ` - ${item.ml}ml` : ""})</span></p>
                                                <p className="text-[10px] uppercase text-neutral-400">{item.brand}</p>
                                            </td>
                                            <td className="py-4 text-center">{item.quantity}</td>
                                            <td className="py-4 text-right">${item.price.toLocaleString('es-CO')}</td>
                                            <td className="py-4 text-right font-bold">${(item.price * item.quantity).toLocaleString('es-CO')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 space-y-3 font-mono">
                                <div className="flex justify-between text-neutral-600">
                                    <span>Subtotal</span>
                                    <span>${itemsSubtotal.toLocaleString('es-CO')}</span>
                                </div>
                                {hasDiscount && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Descuento</span>
                                        <span>-${discountAmount.toLocaleString('es-CO')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-600">
                                    <span>Envío</span>
                                    <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString('es-CO')}`}</span>
                                </div>
                                {codFee > 0 && (
                                    <div className="flex justify-between text-neutral-600 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <span>Comisión Contra Entrega (6%)</span>
                                        <span className="font-bold">+${codFee.toLocaleString('es-CO')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-serif font-bold border-t-2 border-black pt-4 mt-4">
                                    <span>Total</span>
                                    <span>${total.toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Warning */}
                        <div className="mt-auto pt-16 text-center">
                            <p className="text-[10px] font-mono uppercase text-neutral-400">
                                Gracias por elegir BM PARFUMS. Tu factura ha sido generada exitosamente.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center border border-white/10 rounded-lg bg-neutral-900/30 backdrop-blur-sm">
                        <ShoppingBag size={48} className="mx-auto text-neutral-700 mb-4" />
                        <h2 className="text-xl font-serif text-neutral-400">Factura no disponible</h2>
                        <p className="text-neutral-500 font-mono text-xs mt-2 uppercase tracking-widest">
                            {status === 'failed' ? 'La compra no fue aprobada' : 'Esperando confirmación de pago'}
                        </p>
                    </div>
                )}
            </div>

            <div className="print:hidden">
                <Footer />
            </div>
        </main>
    );
}
