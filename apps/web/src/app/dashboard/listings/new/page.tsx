"use client";

import { ListingEditor } from "@/components/listings";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewListingPage() {
    return (
        <div className="min-h-screen">
            {/* Back button */}
            <div className="mb-6">
                <Link href="/dashboard/listings">
                    <Button variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
                        <ChevronLeft size={18} className="mr-1" />
                        Back to Listings
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black">Create New Listing</h1>
                <p className="text-muted-foreground mt-2">
                    Add a product, rental, or service to your store
                </p>
            </div>

            {/* Editor */}
            <ListingEditor />
        </div>
    );
}
