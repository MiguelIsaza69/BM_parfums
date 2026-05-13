import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getAuthedUser, hasInternalSecret } from '@/lib/api-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const RECENT_ORDER_WINDOW_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
        }

        let authorized = false;

        if (hasInternalSecret(request)) {
            authorized = true;
        } else {
            const auth = await getAuthedUser(request);
            if (auth.ok) {
                if (auth.role === 'admin' || (order.user_id && order.user_id === auth.user.id)) {
                    authorized = true;
                }
            }
        }

        if (!authorized) {
            const createdAt = order.created_at ? new Date(order.created_at).getTime() : 0;
            if (createdAt && Date.now() - createdAt <= RECENT_ORDER_WINDOW_MS) {
                authorized = true;
            }
        }

        if (!authorized) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const email = order.shipping_info?.email;
        if (!email) {
            return NextResponse.json({ success: false, error: 'Orden sin correo' }, { status: 400 });
        }

        const name = order.shipping_info?.name || 'Cliente';
        const items = Array.isArray(order.items) ? order.items : [];
        const total = Number(order.total) || 0;
        const shipping_info = order.shipping_info || {};
        const payment_method = order.payment_method;

        const itemsSubtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
        const shippingCost = Number(shipping_info?.shipping_cost ?? (total >= 180000 ? 0 : 15000));

        const isCOD = payment_method === 'CASH_ON_DELIVERY';
        const baseAmountBeforeFee = isCOD ? Math.round((total - shippingCost) / 1.06) : (total - shippingCost);
        const codFee = total - shippingCost - baseAmountBeforeFee;
        const discountAmount = Math.max(0, itemsSubtotal - baseAmountBeforeFee);
        const finalTotal = total;

        const itemsHtml = items.map((item: any) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name} (${item.quality || '1.1'}${item.ml ? ` - ${item.ml}ml` : ''})</strong><br/>
                    <span style="font-size: 12px; color: #666;">${item.brand}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.price || 0).toLocaleString('es-CO')}</td>
            </tr>
        `).join('');

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #000; padding: 20px; text-align: center;">
                    <h1 style="color: #D4AF37; margin: 0; font-family: serif;">BM PARFUMS</h1>
                </div>

                <div style="padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #000; margin-top: 0;">
                        ${payment_method === 'CASH_ON_DELIVERY' ? `¡Pedido Recibido, ${name}!` : `¡Tu pago ha sido confirmado, ${name}!`}
                    </h2>
                    <p>Tu pedido <strong>#${String(orderId).slice(0, 8).toUpperCase()}</strong> ha sido verificado y se encuentra en estado <strong>${payment_method === 'CASH_ON_DELIVERY' ? 'RECIBIDO' : 'PROCESANDO'}</strong>.</p>
                    <p style="font-size: 14px; margin-top: 10px;"><strong>Método de Pago:</strong> ${payment_method === 'CASH_ON_DELIVERY' ? 'Contra Entrega (Efectivo)' : payment_method === 'BANCOLOMBIA_TRANSFER' ? 'Transferencia Bancolombia' : 'Tarjeta / PSE'}</p>

                    <div style="background-color: #fcf8e3; border: 1px solid #faebcc; color: #8a6d3b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <strong>Información importante:</strong> ${payment_method === 'CASH_ON_DELIVERY' ? 'Recuerda tener el dinero listo al recibir tus productos.' : 'Tu pago ha sido confirmado.'} Tu pedido tardará de <strong>3 a 5 días hábiles</strong> en llegar a su destino.
                    </div>

                    <h3 style="border-bottom: 2px solid #D4AF37; padding-bottom: 5px; margin-top: 20px;">Recibo de Compra</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9; text-transform: uppercase; font-size: 12px;">
                                <th style="padding: 10px; text-align: left;">Producto</th>
                                <th style="padding: 10px; text-align: center;">Cant.</th>
                                <th style="padding: 10px; text-align: right;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #D4AF37;">Subtotal:</td>
                                <td style="padding: 10px; text-align: right; border-top: 2px solid #D4AF37;">$${itemsSubtotal.toLocaleString('es-CO')}</td>
                            </tr>
                            ${discountAmount > 50 ? `
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; color: #2e7d32;">Descuento:</td>
                                <td style="padding: 10px; text-align: right; color: #2e7d32;">-$${discountAmount.toLocaleString('es-CO')}</td>
                            </tr>` : ''}
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right;">Envío:</td>
                                <td style="padding: 10px; text-align: right;">${shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-CO')}`}</td>
                            </tr>
                            ${codFee > 0 ? `
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right;">Comisión Contra Entrega (6%):</td>
                                <td style="padding: 10px; text-align: right;">+$${codFee.toLocaleString('es-CO')}</td>
                            </tr>` : ''}
                            <tr style="background-color: #f9f9f9; font-size: 18px;">
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold; color: #D4AF37;">$${finalTotal.toLocaleString('es-CO')}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <h3 style="border-bottom: 2px solid #D4AF37; padding-bottom: 5px; margin-top: 20px;">Datos de Envío</h3>
                    <p style="margin-bottom: 5px;"><strong>Dirección:</strong> ${shipping_info.address}</p>
                    <p style="margin-bottom: 5px;"><strong>Ciudad:</strong> ${shipping_info.city}, ${shipping_info.department}</p>
                    ${shipping_info.details ? `<p style="margin-bottom: 5px;"><strong>Detalles:</strong> ${shipping_info.details}</p>` : ''}
                    <p><strong>Teléfono:</strong> ${shipping_info.phone}</p>
                </div>

                <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
                    <p>Si tienes alguna pregunta, contáctanos escribiendo a <strong>Bmparfums.med@gmail.com</strong></p>
                    <p>&copy; ${new Date().getFullYear()} BM Parfums. Todos los derechos reservados.</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'BM Parfums <ventas@bmparfums.com>',
            to: [email],
            subject: `Pedido Recibido #${String(orderId).slice(0, 8).toUpperCase()} - BM Parfums`,
            html: emailHtml,
        });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Email sent successfully", id: data?.id });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
