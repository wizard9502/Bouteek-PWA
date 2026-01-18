
export default async function StorePage({
    params,
}: {
    params: { domain: string };
}) {
    const identifier = decodeURIComponent(params.domain);
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Store: {identifier}</h1>
            <p>Looking up merchant where <code>slug</code> OR <code>custom_domain</code> equals: <strong>{identifier}</strong></p>
        </div>
    );
}

