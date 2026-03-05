import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the provided API Key from env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, email, name, items, total, shipping_info } = body;

        // 1. Precise Calculations
        console.log(`[EMAIL] Processing Order #${orderId} - Items: ${items?.length}, Total: ${total}`);

        const safeItems = Array.isArray(items) ? items : [];
        const itemsSubtotal = safeItems.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);

        // Use saved shipping cost or fallback
        const savedShipping = shipping_info?.shipping_cost;
        const shippingCost = Number(savedShipping !== undefined && savedShipping !== null
            ? savedShipping
            : (Number(total) >= 180000 ? 0 : 15000));

        const discountAmount = Math.max(0, Math.round((itemsSubtotal + shippingCost) - Number(total)));
        const finalTotal = Number(total);

        console.log(`[EMAIL] Stats: Subtotal=${itemsSubtotal}, Shipping=${shippingCost}, Discount=${discountAmount}, Final=${finalTotal}`);

        // Construct HTML Email
        const itemsHtml = safeItems.map((item: any) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br/>
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
                    <h2 style="color: #000; margin-top: 0;">¡Tu pago ha sido confirmado, ${name}!</h2>
                    <p>Tu pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> ha sido verificado y se encuentra en estado <strong>PROCESANDO</strong>.</p>
                    
                    <div style="background-color: #fcf8e3; border: 1px solid #faebcc; color: #8a6d3b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <strong>Información importante:</strong> Tu pedido tardará de <strong>3 a 5 días hábiles</strong> en llegar a su destino. Te mantendremos informado sobre cualquier cambio en el estado de tu envío.
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
            subject: `Pedido Recibido #${orderId.slice(0, 8).toUpperCase()} - BM Parfums`,
            html: emailHtml,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        console.log("Email sent successfully via Resend:", data?.id);
        return NextResponse.json({ success: true, message: "Email sent successfully", id: data?.id });

    } catch (error: any) {
        console.error("Error in send-invoice route:", error);
        return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
    }
}
