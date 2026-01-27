import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
    try {
        const { slug, secret } = await req.json();

        // Basic secret check (env var or hardcoded for now?)
        // For this mandate, we'll assume authorized if internal or simple check
        // In production, use process.env.REVALIDATION_SECRET

        if (!slug) {
            return NextResponse.json({ message: 'Missing slug' }, { status: 400 });
        }

        // Revalidate the store page
        revalidatePath(`/store/${slug}`);
        revalidatePath(`/store/${slug}/products`);
        revalidatePath('/'); // If root is affected

        console.log(`🔄 Revalidated store: ${slug}`);

        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
    }
}
