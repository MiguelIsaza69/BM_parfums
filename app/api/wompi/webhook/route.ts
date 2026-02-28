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
            let orderStatus = 'pending'; // Always keep as pending per user request
            if (status === 'APPROVED') {
                orderStatus = 'pending'; // Keep as pending even if approved
            } else if (status === 'DECLINED' || status === 'ERROR') {
                orderStatus = 'failed';
            }

            // Update order in Supabase
            const { data: updatedOrder, error } = await supabase
                .from('orders')
                .update({
                    status: orderStatus,
                    payment_id: transaction.id,
                    payment_method: transaction.payment_method_type
                })
                .eq('id', reference)
                .select()
                .single();

            if (error) {
                console.error("Error updating order from webhook:", error);
                return NextResponse.json({ error: 'DB Update failed' }, { status: 500 });
            }

            // If approved, trigger the invoice email automatically
            if (status === 'APPROVED' && updatedOrder) {
                console.log(`[WEBHOOK] Triggering automatic email for Order #${reference}`);
                try {
                    // Call our own internal API route
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${request.headers.get('host')}`;
                    await fetch(`${baseUrl}/api/send-invoice`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: updatedOrder.id,
                            email: updatedOrder.shipping_info.email,
                            name: updatedOrder.shipping_info.name || "Cliente",
                            items: updatedOrder.items || [],
                            total: updatedOrder.total || 0,
                            shipping_info: updatedOrder.shipping_info
                        })
                    });
                } catch (emailError) {
                    console.error("[WEBHOOK] Failed to send automatic email:", emailError);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Wompi Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
