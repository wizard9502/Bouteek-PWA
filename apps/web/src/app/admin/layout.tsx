import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />

            {/* Main Content */}
            <main className="md:pl-72 min-h-screen transition-all">
                {children}
            </main>
        </div>
    );
}
