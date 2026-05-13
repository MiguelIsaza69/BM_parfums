import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_PATHS = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];
const AUTH_REQUIRED_PATHS = [/^\/dashboard(\/|$)/];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isAdminRoute = ADMIN_PATHS.some(re => re.test(pathname));
    const isAuthRoute = AUTH_REQUIRED_PATHS.some(re => re.test(pathname));

    if (!isAdminRoute && !isAuthRoute) return NextResponse.next();

    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll(),
                setAll: (cookies) => {
                    cookies.forEach(({ name, value, options }) => {
                        res.cookies.set({ name, value, ...options });
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = req.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    if (isAdminRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            const url = req.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return res;
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/api/admin/:path*',
    ],
};
