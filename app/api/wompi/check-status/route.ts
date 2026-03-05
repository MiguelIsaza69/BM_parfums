import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
        return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    try {
        const publicKey = (process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '').trim();
        const isTest = publicKey.startsWith('pub_test_');
        const baseUrl = isTest ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';

        console.log(`[Wompi Check] Checking transaction ${transactionId} in ${isTest ? 'Sandbox' : 'Production'}...`);

        const response = await fetch(`${baseUrl}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${publicKey}`
            }
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error("[Wompi Check] Failed to check status:", data.error);
            return NextResponse.json({ error: 'Failed to verify status with Wompi' }, { status: 500 });
        }

        return NextResponse.json({
            status: data.data.status,
            reference: data.data.reference,
            amount_in_cents: data.data.amount_in_cents,
            payment_method_type: data.data.payment_method_type
        });
    } catch (error) {
        console.error("[Wompi Check] Error:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
