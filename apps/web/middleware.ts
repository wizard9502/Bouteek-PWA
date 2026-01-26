import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
    matcher: [
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers
        .get("host")!
        .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    // 1. AUTH GUARD (Critical Fix)
    // Check if accessing dashboard or admin
    const isDashboard = hostname.startsWith("dashboard."); // or path starts with /dashboard if checking root domain rewrite
    // Wait, the rewrite happens LATER. The request comes in as dashboard.bouteek.shop

    // We need to create a supabase client to check session
    const res = NextResponse.next();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
                    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // 2. Handle Subdomains
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
    const isSubdomain = hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`;

    if (isSubdomain) {
        const subdomainSafe = hostname.slice(0, -1 * (rootDomain.length + 1));

        // PROTECTED: Dashboard
        if (subdomainSafe === "dashboard") {
            if (!user && path !== '/login' && path !== '/register') {
                return NextResponse.redirect(new URL('/login', req.url));
            }
            return NextResponse.rewrite(new URL(`/dashboard${path === "/" ? "" : path}`, req.url));
        }

        // PROTECTED: Admin
        if (subdomainSafe === "admin") {
            // ideally check role here too, but at least check user
            if (!user) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
            return NextResponse.rewrite(new URL(`/admin${path === "/" ? "" : path}`, req.url));
        }

        // PUBLIC: Storefronts
        return NextResponse.rewrite(new URL(`/store/${subdomainSafe}${path}`, req.url));
    }

    // 3. Root Domain
    if (
        hostname === "localhost:3000" ||
        hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
        hostname === `www.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    ) {
        return NextResponse.next();
    }

    // 4. Custom Domains (Storefronts - Public)
    return NextResponse.rewrite(new URL(`/store/${hostname}${path}`, req.url));
}
