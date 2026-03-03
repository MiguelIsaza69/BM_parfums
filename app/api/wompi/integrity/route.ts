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
            console.error("[Wompi] ERROR: WOMPI_INTEGRITY_SECRET no definida");
            return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
        }

        // Formula: SHA256(reference + amountInCents + currency + secret)
        const chain = `${cleanReference}${cleanAmount}${cleanCurrency}${integritySecret}`;
        const signature = crypto.createHash('sha256').update(chain).digest('hex').trim();

        console.log(`[Wompi Integrity]
        - Reference: "${cleanReference}"
        - Amount: "${cleanAmount}"
        - Currency: "${cleanCurrency}"
        - Chain Masked: ${cleanReference}${cleanAmount}${cleanCurrency}***${integritySecret.substring(integritySecret.length - 4)}
        - Secret Preview: ${integritySecret.substring(0, 8)}... (Length: ${integritySecret.length})
        - Signature: ${signature}`);

        return NextResponse.json({
            signature,
            debug: {
                reference: cleanReference,
                amount: cleanAmount,
                currency: cleanCurrency,
                chain_prefix: `${cleanReference}${cleanAmount}${cleanCurrency}`
            }
        });
    } catch (error) {
        console.error('Error in /api/wompi/integrity:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
