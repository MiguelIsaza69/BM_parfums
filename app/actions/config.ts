'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function updateHeroSlide(id: string, imageUrl: string) {
    if (!id || !imageUrl) return { error: 'Missing id or url' };

    try {
        const { error } = await supabaseAdmin
            .from('hero_slides')
            .update({ image_url: imageUrl })
            .eq('id', id);

        if (error) {
            console.error("Supabase update error:", error);
            return { error: error.message };
        }
        return { success: true };
    } catch (e: any) {
        console.error("Server action error:", e);
        return { error: e.message };
    }
}

export async function updateBrand(id: string, name: string) {
    if (!id || !name) return { error: 'Missing id or name' };

    try {
        const { error } = await supabaseAdmin
            .from('brands')
            .update({ name: name })
            .eq('id', id);

        if (error) {
            console.error("Supabase update error:", error);
            return { error: error.message };
        }
        return { success: true };
    } catch (e: any) {
        console.error("Server action error:", e);
        return { error: e.message };
    }
}
