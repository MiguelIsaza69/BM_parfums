
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client
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
        const payload = await request.json();
        const isUpdate = !!payload.id;
        console.log(`Admin API: Received ${isUpdate ? 'UPDATE' : 'CREATE'} payload:`, payload);

        // 1. Try sending images as Array (Standard for TEXT[] or JSONB)
        console.log("Admin API: Attempting standard operation with Array images...");

        let query = supabaseAdmin.from('products');
        let result;

        if (isUpdate) {
            const { id, ...updateData } = payload;
            result = await query.update(updateData).eq('id', id).select('*, brands(name), genders(name)');
        } else {
            // CRITICAL: Remove 'id' if null/undefined to let Postgres generate it
            const { id, ...insertData } = payload;
            result = await query.insert([insertData]).select('*, brands(name), genders(name)');
        }

        const { data: dataArr, error: errorArr } = result;

        if (!errorArr) {
            console.log("Admin API: Success with Array images!");
            return NextResponse.json({ success: true, data: dataArr });
        }

        console.error("Admin API: Array operation failed:", errorArr);

        // 2. Fallback: Try sending images as String (Standard for TEXT)
        if (Array.isArray(payload.images)) {
            console.log("Admin API: Attempting fallback with String images...");
            const payloadString = { ...payload, images: payload.images.join(',') };

            let resultStr;
            if (isUpdate) {
                const { id, ...updateDataStr } = payloadString;
                resultStr = await supabaseAdmin.from('products').update(updateDataStr).eq('id', id).select('*, brands(name), genders(name)');
            } else {
                // CRITICAL: Remove 'id' here too
                const { id, ...insertDataStr } = payloadString;
                resultStr = await supabaseAdmin.from('products').insert([insertDataStr]).select('*, brands(name), genders(name)');
            }

            const { data: dataStr, error: errorStr } = resultStr;

            if (!errorStr) {
                console.log("Admin API: Success with String images!");
                return NextResponse.json({ success: true, data: dataStr });
            }
            console.error("Admin API: String operation failed:", errorStr);
            return NextResponse.json({ success: false, error: errorStr }, { status: 500 });
        }

        return NextResponse.json({ success: false, error: errorArr }, { status: 500 });

    } catch (e: any) {
        console.error("Admin API: Critical Exception:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
