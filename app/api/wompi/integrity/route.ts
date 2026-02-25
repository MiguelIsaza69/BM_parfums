import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { reference, amountInCents, currency } = await request.json();

        // Limpiar inputs
        const cleanReference = String(reference).trim();
        const cleanAmount = String(Math.round(Number(amountInCents)));
        const cleanCurrency = String(currency).trim();

        // Wompi Integrity Secret - Limpieza profunda
        const integritySecret = (process.env.WOMPI_INTEGRITY_SECRET || '').replace(/\s/g, '');

        if (!integritySecret) {
            console.error("[Wompi] ERROR: WOMPI_INTEGRITY_SECRET no definida en .env.local");
            return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
        }

        // Formula: SHA256(reference + amountInCents + currency + secret)
        const chain = `${cleanReference}${cleanAmount}${cleanCurrency}${integritySecret}`;
        const signature = crypto.createHash('sha256').update(chain).digest('hex');

        console.log(`[Wompi Server] Generando firma:
        - Ref: ${cleanReference}
        - Monto: ${cleanAmount}
        - Secret empieza por: ${integritySecret.substring(0, 8)}...
        - Hash generado: ${signature.substring(0, 10)}...`);

        return NextResponse.json({ signature });
    } catch (error) {
        console.error('Error generating Wompi signature:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
