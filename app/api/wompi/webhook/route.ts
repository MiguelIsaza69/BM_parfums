import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for database updates from webhook
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Wompi Webhook received:", body);

        // Verify the event type
        if (body.event === 'transaction.updated') {
            const transaction = body.data.transaction;
            const reference = transaction.reference; // This is our Order ID
            const status = transaction.status; // APPROVED, DECLINED, VOIDED, etc.

            // Mapping Wompi status to our DB status
            let orderStatus = 'pending';
            if (status === 'APPROVED') {
                orderStatus = 'processing';
            } else if (status === 'DECLINED' || status === 'ERROR') {
                orderStatus = 'failed';
            }

            // Update order in Supabase
            const { error } = await supabase
                .from('orders')
                .update({
                    status: orderStatus,
                    payment_id: transaction.id,
                    payment_method: transaction.payment_method_type
                })
                .eq('id', reference);

            if (error) {
                console.error("Error updating order from webhook:", error);
                return NextResponse.json({ error: 'DB Update failed' }, { status: 500 });
            }

            // If approved, you might want to trigger the invoice email here too 
            // if you didn't send it at the start of the checkout.
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Wompi Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
