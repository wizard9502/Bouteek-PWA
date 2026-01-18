
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
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
        }`;

    // specialized domain for App (if we separate later)
    // const appDomain = `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

    // 1. Handle "Root" Domain - The Landing Page
    if (
        hostname === "localhost:3000" ||
        hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
        hostname === `www.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    ) {
        // Just serve the app normally
        return NextResponse.next();
    }

    // 2. Handle Subdomains (e.g. app.bouteek.shop or admin.bouteek.shop)
    // Logic: if subdomain is 'app', rewrite to /app (if we had a separate app folder)
    // For this monorepo, everything is in app, so we might not need this if we rely on paths.
    // But if the user wants custom domains for stores:

    // 3. Handle Custom Domains (Vendor Stores)
    // Assuming any other hostname is a vendor store
    // Rewrite to /store/[domain]/[path]

    // NOTE: We need a way to distinguish between "app" subdomains and "store" subdomains if they share the same root.
    // For now, assuming all unknown domains map to a store.

    console.log(`Rewriting ${hostname}${path} to /store/${hostname}${path}`);
    return NextResponse.rewrite(new URL(`/store/${hostname}${path}`, req.url));
}
