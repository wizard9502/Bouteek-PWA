
import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
    const hostname = req.headers
        .get("host")!
        .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

    const searchParams = req.nextUrl.searchParams.toString();
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    // specialized domain for App (if we separate later)
    // const appDomain = `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

    // 1. Handle "Root" Domain - The Landing Page
    if (
        hostname === "localhost:3000" ||
        hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
        hostname === `www.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` ||
        hostname.endsWith(".vercel.app") // Treat Vercel deployments as root (landing page)
    ) {
        // Just serve the app normally
        return NextResponse.next();
    }

    // 2. Handle Subdomains (e.g. merchant.bouteek.shop)
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
    const isSubdomain = hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`;

    if (isSubdomain) {
        // e.g. merchant.bouteek.shop -> merchant
        // const subdomain = hostname.replace(`.${rootDomain}`, ""); 
        // Safer: 
        const subdomainSafe = hostname.slice(0, -1 * (rootDomain.length + 1));

        // SPECIAL CASE: Dashboard
        if (subdomainSafe === "dashboard") {
            // Rewrite dashboard.bouteek.shop to /dashboard
            const dashboardPath = path === "/" ? "" : path;
            // console.log(`Rewriting dashboard subdomain to /dashboard${path}`);
            return NextResponse.rewrite(new URL(`/dashboard${dashboardPath}`, req.url));
        }

        // SPECIAL CASE: Admin
        if (subdomainSafe === "admin") {
            // Rewrite admin.bouteek.shop to /admin
            const adminPath = path === "/" ? "" : path;
            return NextResponse.rewrite(new URL(`/admin${adminPath}`, req.url));
        }

        console.log(`Rewriting subdomain ${hostname} to /store/${subdomainSafe}${path}`);
        return NextResponse.rewrite(new URL(`/store/${subdomainSafe}${path}`, req.url));
    }

    // 3. Handle Custom Domains (e.g. mariam-fashion.com)
    // For external domains, we pass the full domain.
    console.log(`Rewriting custom domain ${hostname} to /store/${hostname}${path}`);
    return NextResponse.rewrite(new URL(`/store/${hostname}${path}`, req.url));
}
