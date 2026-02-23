import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { reference, amountInCents, currency } = await request.json();

        // Wompi Integrity Secret (from Dashboard)
        const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

        if (!integritySecret) {
            console.error("WOMPI_INTEGRITY_SECRET is not defined");
            return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
        }

        // Formula: SHA256(reference + amountInCents + currency + secret)
        const chain = `${reference}${amountInCents}${currency}${integritySecret}`;
        const signature = crypto.createHash('sha256').update(chain).digest('hex');

        return NextResponse.json({ signature });
    } catch (error) {
        console.error('Error generating Wompi signature:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
