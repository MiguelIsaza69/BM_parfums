import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: Request) {
    try {
        const auth = await requireAdmin(request);
        if (!auth.ok) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
        }

        const payload = await request.json();
        const isUpdate = !!payload.id;
        const { id, ...data } = payload;

        const result = isUpdate
            ? await supabaseAdmin.from('products').update(data).eq('id', id).select('*, brands(name), genders(name)')
            : await supabaseAdmin.from('products').insert([data]).select('*, brands(name), genders(name)');

        if (result.error) {
            console.error('[products/create] supabase error:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error.message,
                details: result.error.details,
                hint: result.error.hint,
                code: result.error.code,
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });

    } catch (e: any) {
        console.error('[products/create] unhandled error:', e);
        return NextResponse.json({ success: false, error: e?.message ?? 'Server error' }, { status: 500 });
    }
}
