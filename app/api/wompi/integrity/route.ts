import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const reference = body.reference;
        const amountInCents = body.amountInCents || body.amount_in_cents;
        const currency = body.currency || 'COP';

        // Limpiar inputs
        const cleanReference = String(reference).trim();
        const cleanAmount = String(Math.round(Number(amountInCents)));
        const cleanCurrency = String(currency).trim();

        // Wompi Integrity Secret
        const integritySecret = (process.env.WOMPI_INTEGRITY_SECRET || '').trim();

        if (!integritySecret) {
            return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
        }

        const chain = `${cleanReference}${cleanAmount}${cleanCurrency}${integritySecret}`;
        const signature = crypto.createHash('sha256').update(chain).digest('hex').trim();

        return NextResponse.json({ signature });
    } catch {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
