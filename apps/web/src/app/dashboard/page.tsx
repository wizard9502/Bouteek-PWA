
export default function DashboardHome() {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Revenue (XOF)</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Active Products</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 text-center py-12">
                <p className="text-gray-500">No recent activity.</p>
                <p className="text-sm text-gray-400">Go to Settings to complete your profile.</p>
            </div>
        </div>
    );
}
