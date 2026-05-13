import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.event === 'transaction.updated') {
            const transaction = body.data.transaction;
            const reference = transaction.reference;
            const status = transaction.status;

            if (status === 'APPROVED') {
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
                    return NextResponse.json({ error: 'DB Update failed' }, { status: 500 });
                }

                if (updatedOrder) {
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
                                }
                            }
                            await supabase.from('orders').update({ stock_deducted: true }).eq('id', updatedOrder.id);
                        } catch {
                        }
                    }

                    try {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${request.headers.get('host')}`;
                        const internalSecret = process.env.INTERNAL_API_SECRET;
                        await fetch(`${baseUrl}/api/send-invoice`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(internalSecret ? { 'x-internal-secret': internalSecret } : {})
                            },
                            body: JSON.stringify({ orderId: updatedOrder.id })
                        });
                    } catch {
                    }
                }
                return NextResponse.json({ received: true });

            } else if (['DECLINED', 'VOIDED', 'ERROR'].includes(status)) {
                await supabase.from('orders').delete().eq('id', reference);
                return NextResponse.json({ received: true, action: 'deleted_failed_order' });
            }
        }

        return NextResponse.json({ received: true });
    } catch {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
