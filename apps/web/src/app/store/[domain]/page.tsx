
export default async function StorePage({
    params,
}: {
    params: { domain: string };
}) {
    const domain = decodeURIComponent(params.domain);
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Store: {domain}</h1>
            <p>This is a custom storefront for {domain}</p>
        </div>
    );
}

