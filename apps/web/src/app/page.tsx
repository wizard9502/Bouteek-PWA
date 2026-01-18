import Link from "next/link";
import { FileText, ShoppingBag, Users, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to Bouteek
        </h1>
        <p className="text-lg text-gray-600">
          The unified platform for social sellers and administrators.
          Manage your inventory, orders, and customers in one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Link href="/dashboard" className="group block space-y-3 rounded-lg border border-gray-200 p-6 hover:border-gray-400 hover:shadow-md transition">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <h3 className="font-semibold text-lg">Seller Dashboard</h3>
            <p className="text-sm text-gray-500">Manage products, orders, and view analytics.</p>
          </Link>

          <Link href="/admin" className="group block space-y-3 rounded-lg border border-gray-200 p-6 hover:border-gray-400 hover:shadow-md transition">
            <Users className="h-8 w-8 text-purple-600" />
            <h3 className="font-semibold text-lg">Admin Console</h3>
            <p className="text-sm text-gray-500">System administration and user management.</p>
          </Link>
        </div>

        <div className="mt-8 flex gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>PWA Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Offline Capable</span>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-gray-400 text-sm">
        <p>&copy; 2024 Bouteek Ecosystem</p>
      </footer>
    </div>
  );
}
