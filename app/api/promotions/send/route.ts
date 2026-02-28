import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subject, title, htmlBody, images, recipients } = body;

        if (!subject || !htmlBody || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ success: false, error: "Faltan datos requeridos (asunto, cuerpo o destinatarios)." }, { status: 400 });
        }

        console.log(`[PROMOTION SERVICE] Sending promotions to ${recipients.length} recipients`);

        // Construct images HTML
        const imagesHtml = images && Array.isArray(images) ? images.map((img: string) => `
            <div style="margin-bottom: 20px; text-align: center;">
                <img src="${img}" alt="Promoción BM Parfums" style="max-width: 100%; border-radius: 8px; display: block; margin: 0 auto;" />
            </div>
        `).join('') : '';

        // Construct the full HTML with brand styling
        const emailTemplate = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9f9f9; padding: 20px;">
                <div style="background-color: #000; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #D4AF37; margin: 0; font-family: serif; font-weight: normal; letter-spacing: 4px;">BM PARFUMS</h1>
                </div>
                
                <div style="padding: 40px; border: 1px solid #eee; background-color: #fff; line-height: 1.6; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    ${title ? `<h2 style="color: #000; font-family: serif; font-size: 24px; margin-top: 0; border-bottom: 1px solid #D4AF37; padding-bottom: 15px; margin-bottom: 25px; text-align: center;">${title}</h2>` : ''}
                    
                    <div style="margin-bottom: 30px; font-size: 16px; color: #444;">
                        ${htmlBody}
                    </div>

                    ${imagesHtml}
                </div>

                <div style="text-align: center; padding: 30px 20px; font-size: 12px; color: #888;">
                    <p style="margin-bottom: 10px;">Has recibido este correo porque estás registrado en BM Parfums y aceptaste recibir nuestras promociones.</p>
                    <p style="margin-bottom: 20px;">Si deseas dejar de recibir estos correos, por favor contáctanos a <a href="mailto:Bmparfums.med@gmail.com" style="color: #D4AF37; text-decoration: none; font-weight: bold;">Bmparfums.med@gmail.com</a></p>
                    <div style="border-top: 1px solid #eee; pt-20; margin-top: 20px; padding-top: 20px;">
                        <p style="letter-spacing: 2px; text-transform: uppercase;">&copy; ${new Date().getFullYear()} BM Parfums</p>
                    </div>
                </div>
            </div>
        `;

        // We'll send emails individually for small lists (under 100) to ensure better deliverability
        // and more granular reporting. For larger lists, we could use BCC but it's often 
        // better to use the Resend Batch API which is more efficient for many distinct recipients.

        console.log(`[PROMOTION SERVICE] Processing ${recipients.length} recipients...`);

        const results = [];

        // Using Resend Batch API is the modern way to send to many people individually
        // This avoids BCC issues and ensures each user gets their own copy.
        const batchSize = 100;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);

            // Map batch to Resend batch format
            const emailBatch = batch.map(email => ({
                from: 'BM Parfums <promociones@bmparfums.com>',
                to: email,
                subject: subject,
                html: emailTemplate,
            }));

            try {
                const { data, error } = await resend.batch.send(emailBatch);

                if (error) {
                    console.error(`[PROMOTION SERVICE] Error in batch ${i / batchSize}:`, error);
                    results.push({ batch: i / batchSize, success: false, error });
                } else {
                    console.log(`[PROMOTION SERVICE] Batch ${i / batchSize} sent successfully. ID:`, data);
                    results.push({ batch: i / batchSize, success: true, count: batch.length });
                }
            } catch (err: any) {
                console.error(`[PROMOTION SERVICE] Critical error in batch ${i / batchSize}:`, err);
                results.push({ batch: i / batchSize, success: false, error: err.message });
            }
        }

        const allSuccessful = results.some(r => r.success); // At least some success?

        return NextResponse.json({
            success: allSuccessful,
            results,
            message: allSuccessful ? "Promociones procesadas." : "No se pudo enviar ninguna promoción."
        });

    } catch (error: any) {
        console.error("Error in send-promotions route:", error);
        return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
    }
}
