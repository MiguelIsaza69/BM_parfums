import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the provided API Key
const resend = new Resend('re_jW4y5fAj_GnFcrF6f1Qd7bZtkyVvggMAA');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, email, name, items, total, shipping_info } = body;

        console.log("---------------------------------------------------------");
        console.log(`[EMAIL SERVICE] Preparing invoice for Order #${orderId}`);
        console.log(`To: ${name} <${email}>`);
        console.log("---------------------------------------------------------");

        // Construct HTML Email
        const itemsHtml = items.map((item: any) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br/>
                    <span style="font-size: 12px; color: #666;">${item.brand}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString('es-CO')}</td>
            </tr>
        `).join('');

        // NOTE: For now, we keep the original logic.
        // Once you verify your domain on Resend (e.g. bmparfums.com), emails will go to any user.
        // Currently, without a verified domain, it will only work for your own email.

        // Use the actual customer email
        const finalRecipient = email;

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #000; padding: 20px; text-align: center;">
                    <h1 style="color: #D4AF37; margin: 0; font-family: serif;">BM PARFUMS</h1>
                </div>
                
                <div style="padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #000; margin-top: 0;">¡Gracias por tu compra, ${name}!</h2>
                    <p>Tu pedido <strong>#${orderId.slice(0, 8)}</strong> ha sido confirmado.</p>
                    
                    <h3 style="border-bottom: 2px solid #D4AF37; padding-bottom: 5px; margin-top: 20px;">Resumen del Pedido</h3>
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
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">$${total.toLocaleString('es-CO')}</td>
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
                    <p>Si tienes alguna pregunta, contáctanos respondiendo a este correo.</p>
                    <p>&copy; ${new Date().getFullYear()} BM Parfums. Todos los derechos reservados.</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'BM Parfums <onboarding@resend.dev>', // Default sender for testing
            to: [finalRecipient],
            subject: `Confirmación de Pedido #${orderId.slice(0, 8).toUpperCase()} - BM Parfums`,
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
