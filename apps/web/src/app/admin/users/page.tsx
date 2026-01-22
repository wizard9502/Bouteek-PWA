"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Shield,
    UserCog,
    Loader2,
    Mail,
    Calendar,
    Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    role: "admin" | "merchant" | "customer";
    is_banned: boolean;
    created_at: string;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSubdomain, setIsSubdomain] = useState(false);

    // Detect subdomain
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bouteek.shop";
            setIsSubdomain(hostname === `admin.${rootDomain}` || hostname.startsWith("admin."));
        }
    }, []);

    const getHref = (path: string) => {
        if (isSubdomain) {
            return path === "/admin" ? "/" : path.replace("/admin", "");
        }
        return path;
    };

    const pageSize = 20;

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            // Build query
            let query = supabase
                .from("users")
                .select("id, email, role, is_banned, created_at, last_sign_in_at, email_confirmed_at", { count: "exact" });

            // Apply search filter
            if (search.trim()) {
                query = query.ilike("email", `%${search.trim()}%`);
            }

            // Apply role filter
            if (roleFilter !== "all") {
                query = query.eq("role", roleFilter);
            }

            // Pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, count, error } = await query
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;

            setUsers(data || []);
            setTotal(count || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleBan = async (user: User) => {
        const action = user.is_banned ? "unban" : "ban";
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from("users")
                .update({ is_banned: !user.is_banned })
                .eq("id", user.id);

            if (error) throw error;

            // Log the action
            const { data: { user: adminUser } } = await supabase.auth.getUser();
            await supabase.from("admin_audit_logs").insert({
                admin_id: adminUser?.id,
                action: user.is_banned ? "UNBAN_USER" : "BAN_USER",
                target_type: "user",
                target_id: user.id,
                details: { email: user.email },
            });

            toast.success(`User ${action}ned successfully`);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(`Failed to ${action} user`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from("users")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;

            // Log the action
            const { data: { user: adminUser } } = await supabase.auth.getUser();
            await supabase.from("admin_audit_logs").insert({
                admin_id: adminUser?.id,
                action: "CHANGE_USER_ROLE",
                target_type: "user",
                target_id: userId,
                details: { new_role: newRole },
            });

            toast.success("User role updated");
            fetchUsers();
            setIsDetailOpen(false);
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role");
        } finally {
            setIsUpdating(false);
        }
    };

    const openUserDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
    };

    const getRoleBadge = (role: string, isBanned: boolean) => {
        if (isBanned) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <ShieldAlert size={12} />
                    Banned
                </Badge>
            );
        }

        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
                        <Shield size={12} />
                        Admin
                    </Badge>
                );
            case "merchant":
                return (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                        <UserCog size={12} />
                        Merchant
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="gap-1">
                        Customer
                    </Badge>
                );
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">User Management</h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Manage all platform users, roles, and access.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email..."
                            className="pl-9 w-[300px] rounded-xl"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 pb-4 overflow-x-auto">
                {["all", "admin", "merchant", "customer"].map((f) => (
                    <button
                        key={f}
                        onClick={() => {
                            setRoleFilter(f);
                            setPage(1);
                        }}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
                            roleFilter === f
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-border/50">
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider">
                                User
                            </th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider">
                                Role
                            </th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="text-right py-4 px-6 text-gray-600 font-black uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <Loader2 className="animate-spin mx-auto text-muted-foreground" size={32} />
                                    <p className="mt-2 text-muted-foreground">Loading users...</p>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <UsersIcon className="mx-auto text-muted-foreground mb-4" size={48} />
                                    <p className="font-bold text-lg">No Users Found</p>
                                    <p className="text-muted-foreground mt-1">
                                        {search ? "Try adjusting your search term" : "No users match the current filter"}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500">
                                                {user.email.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 truncate max-w-[200px]">
                                                    {user.email}
                                                </p>
                                                <p className="text-xs text-gray-600 font-mono">
                                                    {user.id.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getRoleBadge(user.role, false)}
                                    </td>
                                    <td className="py-4 px-6">
                                        {user.is_banned ? (
                                            <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-md">
                                                <XCircle size={12} /> Banned
                                            </span>
                                        ) : user.email_confirmed_at ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">
                                                <CheckCircle2 size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl">
                                                    <MoreHorizontal size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openUserDetail(user)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openUserDetail(user)}>
                                                    Change Role
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className={user.is_banned ? "text-green-600" : "text-red-600"}
                                                    onClick={() => handleToggleBan(user)}
                                                    disabled={isUpdating}
                                                >
                                                    {user.is_banned ? "Unban User" : "Ban User"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} users
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* User Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            View and manage user information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-xl text-gray-500">
                                    {selectedUser.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{selectedUser.email}</p>
                                    <p className="text-sm text-gray-600 font-mono">{selectedUser.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Calendar size={14} />
                                        <span className="text-xs font-bold uppercase">Joined</span>
                                    </div>
                                    <p className="font-medium">
                                        {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Mail size={14} />
                                        <span className="text-xs font-bold uppercase">Email Status</span>
                                    </div>
                                    <p className="font-medium">
                                        {selectedUser.email_confirmed_at ? "Verified" : "Pending"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Role</label>
                                <Select
                                    value={selectedUser.role}
                                    onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="customer">Customer</SelectItem>
                                        <SelectItem value="merchant">Merchant</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                            Close
                        </Button>
                        {selectedUser && (
                            <Button
                                variant={selectedUser.is_banned ? "default" : "destructive"}
                                onClick={() => {
                                    handleToggleBan(selectedUser);
                                    setIsDetailOpen(false);
                                }}
                                disabled={isUpdating}
                            >
                                {isUpdating && <Loader2 className="animate-spin mr-2" size={16} />}
                                {selectedUser.is_banned ? "Unban User" : "Ban User"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
