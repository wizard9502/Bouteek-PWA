import { Metadata } from "next";
import { getSubdomain, getStorefrontByDomain } from "@/lib/subdomain-router";
import { notFound } from "next/navigation";
import StorefrontView from "@/components/storefront/StorefrontView";

// Dynamic metadata based on storefront
export async function generateMetadata(): Promise<Metadata> {
    const subdomain = await getSubdomain();
    if (!subdomain) {
        return {
            title: "Bouteek - Your Store",
        };
    }

    const storefront = await getStorefrontByDomain(subdomain);
    if (!storefront) {
        return {
            title: "Store Not Found | Bouteek",
        };
    }

    return {
        title: `${storefront.name || "Shop"} | Bouteek`,
        description: storefront.description || "Shop with us on Bouteek",
    };
}

export default async function StorefrontPage() {
    const subdomain = await getSubdomain();

    if (!subdomain) {
        // Main domain - redirect to homepage or show landing
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-black">Welcome to Bouteek</h1>
                    <p className="text-gray-600 mt-2">
                        The easiest way to sell online in Senegal
                    </p>
                </div>
            </div>
        );
    }

    const storefront = await getStorefrontByDomain(subdomain);

    if (!storefront) {
        notFound();
    }

    return <StorefrontView storefront={storefront} />;
}
