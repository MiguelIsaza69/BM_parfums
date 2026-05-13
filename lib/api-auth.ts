import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export type AuthResult =
    | { ok: true; user: { id: string; email?: string }; role: string | null }
    | { ok: false; status: number; error: string };

function getBearer(req: Request): string | null {
    const h = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!h) return null;
    const [scheme, token] = h.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
    return token.trim();
}

export async function getAuthedUser(req: Request): Promise<AuthResult> {
    const token = getBearer(req);
    if (!token) return { ok: false, status: 401, error: 'Missing bearer token' };

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return { ok: false, status: 401, error: 'Invalid session' };

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

    return { ok: true, user: { id: data.user.id, email: data.user.email }, role: profile?.role ?? null };
}

export async function requireAdmin(req: Request): Promise<AuthResult> {
    const result = await getAuthedUser(req);
    if (!result.ok) return result;
    if (result.role !== 'admin') return { ok: false, status: 403, error: 'Forbidden' };
    return result;
}

export function hasInternalSecret(req: Request): boolean {
    const expected = process.env.INTERNAL_API_SECRET;
    if (!expected) return false;
    const got = req.headers.get('x-internal-secret');
    if (!got) return false;
    if (got.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
    return diff === 0;
}
