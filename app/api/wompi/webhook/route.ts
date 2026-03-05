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
            if (status === 'APPROVED') {
                // Update order status to 'pending'
                const { data: updatedOrder, error } = await supabase
                    .from('orders')
                    .update({
                        status: 'pending',
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

                // If approved, decrement stock (if not already done) and trigger the invoice email automatically
                if (updatedOrder) {
                    console.log(`[WEBHOOK] APPROVED Order #${reference}. Current stock_deducted: ${updatedOrder.stock_deducted}`);

                    if (!updatedOrder.stock_deducted) {
                        try {
                            const items = updatedOrder.items || [];
                            for (const item of items) {
                                const { data: product, error: fetchError } = await supabase
                                    .from('products')
                                    .select('stock')
                                    .eq('id', item.id)
                                    .single();

                                if (product && !fetchError) {
                                    const newStock = Math.max(0, (product.stock || 0) - item.quantity);
                                    const updateData: any = { stock: newStock };
                                    if (newStock <= 0) updateData.is_active = false;

                                    await supabase.from('products').update(updateData).eq('id', item.id);
                                    console.log(`[WEBHOOK] Stock updated for product ${item.id}: ${product.stock} -> ${newStock}`);
                                }
                            }
                            // Mark as deducted to avoid duplicates
                            await supabase.from('orders').update({ stock_deducted: true }).eq('id', updatedOrder.id);
                        } catch (stockError) {
                            console.error("[WEBHOOK] Critical error updating stock:", stockError);
                        }
                    }

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
                return NextResponse.json({ received: true });

            } else if (['DECLINED', 'VOIDED', 'ERROR'].includes(status)) {
                console.log(`[WEBHOOK] Deleting failed order #${reference} per user preference.`);
                await supabase.from('orders').delete().eq('id', reference);
                return NextResponse.json({ received: true, action: 'deleted_failed_order' });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Wompi Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
