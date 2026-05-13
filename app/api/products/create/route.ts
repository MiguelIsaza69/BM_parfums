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

        let query = supabaseAdmin.from('products');
        let result;

        if (isUpdate) {
            const { id, ...updateData } = payload;
            result = await query.update(updateData).eq('id', id).select('*, brands(name), genders(name)');
        } else {
            const { id, ...insertData } = payload;
            result = await query.insert([insertData]).select('*, brands(name), genders(name)');
        }

        const { data: dataArr, error: errorArr } = result;

        if (!errorArr) {
            return NextResponse.json({ success: true, data: dataArr });
        }

        if (Array.isArray(payload.images)) {
            const payloadString = { ...payload, images: payload.images.join(',') };

            let resultStr;
            if (isUpdate) {
                const { id, ...updateDataStr } = payloadString;
                resultStr = await supabaseAdmin.from('products').update(updateDataStr).eq('id', id).select('*, brands(name), genders(name)');
            } else {
                const { id, ...insertDataStr } = payloadString;
                resultStr = await supabaseAdmin.from('products').insert([insertDataStr]).select('*, brands(name), genders(name)');
            }

            const { data: dataStr, error: errorStr } = resultStr;

            if (!errorStr) {
                return NextResponse.json({ success: true, data: dataStr });
            }
            return NextResponse.json({ success: false, error: errorStr.message }, { status: 500 });
        }

        return NextResponse.json({ success: false, error: errorArr.message }, { status: 500 });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
