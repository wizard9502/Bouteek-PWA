import { headers } from "next/headers";

/**
 * Get the subdomain from the host header.
 * Returns null if on the main domain or localhost without subdomain.
 */
export async function getSubdomain(): Promise<string | null> {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    // Main domain patterns
    const mainDomains = [
        "bouteek.shop",
        "www.bouteek.shop",
        "localhost:3000",
        "localhost:3001",
        "127.0.0.1:3000",
    ];

    // Check if this is the main domain
    if (mainDomains.includes(host)) {
        return null;
    }

    // Extract subdomain from bouteek.shop domain
    const bouteekMatch = host.match(/^([a-zA-Z0-9-]+)\.bouteek\.shop$/);
    if (bouteekMatch) {
        return bouteekMatch[1].toLowerCase();
    }

    // For local development: check for subdomain.localhost pattern
    const localMatch = host.match(/^([a-zA-Z0-9-]+)\.localhost/);
    if (localMatch) {
        return localMatch[1].toLowerCase();
    }

    // For custom domains, return the full host
    // This will be matched against storefront custom_domain field
    if (!host.includes("bouteek.shop") && !host.includes("localhost")) {
        return `custom:${host}`;
    }

    return null;
}

/**
 * Check if the current request is for a store subdomain.
 */
export async function isStorefrontRequest(): Promise<boolean> {
    const subdomain = await getSubdomain();
    return subdomain !== null && subdomain !== "www" && subdomain !== "api";
}

/**
 * Get storefront data by subdomain or custom domain.
 */
export async function getStorefrontByDomain(subdomain: string): Promise<any> {
    const { createClient } = await import("@/lib/supabaseClient");
    const supabase = createClient();

    // Check if it's a custom domain lookup
    if (subdomain.startsWith("custom:")) {
        const customDomain = subdomain.replace("custom:", "");
        const { data } = await supabase
            .from("storefronts")
            .select("*, merchants(*)")
            .eq("custom_domain", customDomain)
            .single();
        return data;
    }

    // Otherwise lookup by slug
    const { data } = await supabase
        .from("storefronts")
        .select("*, merchants(*)")
        .eq("slug", subdomain)
        .single();

    return data;
}
