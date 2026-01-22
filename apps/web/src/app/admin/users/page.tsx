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
    ArrowUpRight,
    Filter
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
import { motion } from "framer-motion";

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
                <Badge variant="destructive" className="gap-1 px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                    <ShieldAlert size={12} />
                    Banned
                </Badge>
            );
        }

        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1 px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-widest">
                        <Shield size={12} />
                        Admin
                    </Badge>
                );
            case "merchant":
                return (
                    <Badge className="bg-bouteek-green/10 text-bouteek-green border-bouteek-green/30 gap-1 px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(0,255,65,0.1)]">
                        <UserCog size={12} />
                        Merchant
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-white/5 text-gray-400 border-white/10 gap-1 px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-widest">
                        Customer
                    </Badge>
                );
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-12 pb-20">
            {/* Advanced Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-4 border-b border-white/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3B82F6]" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Identity Services</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                        USERS <span className="text-white/10">REGISTRY</span>
                    </h1>
                    <p className="text-gray-500 font-bold tracking-[0.1em] text-sm uppercase">Comprehensive Authentication & Permissions Matrix</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-bouteek-green opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <Input
                            placeholder="QUERY SYSTEM ID OR EMAIL..."
                            className="pl-12 w-[350px] h-14 bg-white/5 border-white/5 rounded-full text-[11px] font-black uppercase tracking-widest focus:ring-bouteek-green focus:border-bouteek-green/50 placeholder:text-gray-700"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-bouteek-green/20 transition-all">
                    <div>
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Total Nodes</p>
                        <p className="text-2xl font-black text-white mt-1">{total}</p>
                    </div>
                    <UsersIcon className="text-gray-700 group-hover:text-bouteek-green transition-colors" size={24} />
                </div>
                {["admin", "merchant", "customer"].map(role => (
                    <div key={role} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-white/10 transition-all">
                        <div>
                            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{role}</p>
                            <p className="text-2xl font-black text-white mt-1">--</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-white transition-colors" />
                    </div>
                ))}
            </div>

            {/* Entity Filters */}
            <div className="flex flex-wrap gap-3">
                {["all", "admin", "merchant", "customer"].map((f) => (
                    <button
                        key={f}
                        onClick={() => {
                            setRoleFilter(f);
                            setPage(1);
                        }}
                        className={cn(
                            "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border backdrop-blur-xl",
                            roleFilter === f
                                ? "bg-bouteek-green text-black border-bouteek-green shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                                : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-white"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Advanced Registry Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden"
            >
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Identity Identifier</th>
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Access Tier</th>
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Status</th>
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Node Sync</th>
                                <th className="text-right py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-bouteek-green/20 border-t-bouteek-green rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-bouteek-green uppercase tracking-[0.3em] animate-pulse">Syncing User Matrix</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <UsersIcon size={48} className="text-gray-500" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Identities Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.03] transition-all">
                                        <td className="py-8 px-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center font-black text-gray-500 group-hover:text-bouteek-green group-hover:border-bouteek-green/30 transition-all shadow-inner relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="relative z-10">{user.email.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm uppercase tracking-wider group-hover:text-bouteek-green transition-colors underline-offset-4 group-hover:underline">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-1 font-mono">
                                                        ID: {user.id.substring(0, 16)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            {getRoleBadge(user.role, false)}
                                        </td>
                                        <td className="py-8 px-8">
                                            {user.is_banned ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#EF4444]" />
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Compromised</span>
                                                </div>
                                            ) : user.email_confirmed_at ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-bouteek-green shadow-[0_0_8px_#00FF41]" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Sync</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-40">
                                                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Awaiting Verification</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-8 px-8 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-8 px-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 hover:bg-bouteek-green hover:text-black hover:rotate-90 transition-all duration-500 border border-transparent hover:border-bouteek-green/30">
                                                        <MoreHorizontal size={20} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-black/95 backdrop-blur-2xl border-white/10 rounded-[2rem] p-4 p-w-64 shadow-2xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Protocol Menu</DropdownMenuLabel>
                                                    <DropdownMenuItem className="rounded-xl py-3 focus:bg-bouteek-green focus:text-black font-bold uppercase text-[9px] tracking-widest" onClick={() => openUserDetail(user)}>
                                                        Deep Audit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl py-3 focus:bg-bouteek-green focus:text-black font-bold uppercase text-[9px] tracking-widest" onClick={() => openUserDetail(user)}>
                                                        Adjust Credentials
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                                                    <DropdownMenuItem
                                                        className={cn(
                                                            "rounded-xl py-3 font-black uppercase text-[9px] tracking-widest",
                                                            user.is_banned ? "text-emerald-500 focus:bg-emerald-500 focus:text-black" : "text-red-500 focus:bg-red-500 focus:text-black"
                                                        )}
                                                        onClick={() => handleToggleBan(user)}
                                                        disabled={isUpdating}
                                                    >
                                                        {user.is_banned ? "Reauthorize Node" : "Sever Connection"}
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

                {/* Advanced Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-10 bg-white/[0.01] border-t border-white/5">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                            Registry Page {page} of {totalPages} <span className="mx-2 text-white/10">|</span> Total Entities: {total}
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-full px-8 h-12 bg-white/5 hover:bg-bouteek-green hover:text-black font-black text-[9px] uppercase tracking-widest disabled:opacity-20"
                            >
                                PREVIOUS
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-full px-8 h-12 bg-white/5 hover:bg-bouteek-green hover:text-black font-black text-[9px] uppercase tracking-widest disabled:opacity-20"
                            >
                                NEXT
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Deep Audit Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[3rem] p-10 max-w-2xl shadow-[0_0_100px_rgba(0,0,0,1)]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Identity <span className="text-bouteek-green">Profile</span></DialogTitle>
                        <DialogDescription className="text-gray-500 font-bold tracking-[0.1em] text-[10px] uppercase mt-2">
                            Secure Deep-Packet User Audit
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-10 py-10">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-black border border-white/5 flex items-center justify-center font-black text-3xl text-bouteek-green shadow-[inset_0_0_20px_rgba(0,255,65,0.05)] shadow-inner">
                                    {selectedUser.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-2xl text-white uppercase tracking-tight">{selectedUser.email}</p>
                                    <p className="text-[10px] font-bold text-gray-600 font-mono tracking-widest uppercase opacity-50">{selectedUser.id}</p>
                                    <div className="pt-2">{getRoleBadge(selectedUser.role, selectedUser.is_banned)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-4">
                                    <div className="flex items-center gap-2 text-gray-500 uppercase tracking-widest">
                                        <Calendar size={14} className="text-bouteek-green" />
                                        <span className="text-[9px] font-black">Sync Date</span>
                                    </div>
                                    <p className="font-black text-white text-sm">
                                        {new Date(selectedUser.created_at).toLocaleDateString("en-GB", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }).toUpperCase()}
                                    </p>
                                </div>
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-4">
                                    <div className="flex items-center gap-2 text-gray-500 uppercase tracking-widest">
                                        <Mail size={14} className="text-bouteek-green" />
                                        <span className="text-[9px] font-black">Auth Sync</span>
                                    </div>
                                    <p className="font-black text-white text-sm uppercase">
                                        {selectedUser.email_confirmed_at ? "ENCRYPTED & VERIFIED" : "AWAITING HANDSHAKE"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Access Permissions Override</label>
                                <Select
                                    value={selectedUser.role}
                                    onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="h-16 rounded-full bg-white/5 border-white/5 text-[11px] font-black uppercase tracking-widest px-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/95 border-white/10 rounded-3xl p-2 shadow-2xl">
                                        <SelectItem value="customer" className="rounded-xl py-3 focus:bg-bouteek-green focus:text-black font-bold uppercase text-[9px] tracking-widest cursor-pointer">Customer Node</SelectItem>
                                        <SelectItem value="merchant" className="rounded-xl py-3 focus:bg-bouteek-green focus:text-black font-bold uppercase text-[9px] tracking-widest cursor-pointer">Merchant Node</SelectItem>
                                        <SelectItem value="admin" className="rounded-xl py-3 focus:bg-bouteek-green focus:text-black font-bold uppercase text-[9px] tracking-widest cursor-pointer">Administrator Node</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-4">
                        <Button variant="ghost" className="rounded-full h-14 px-10 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5" onClick={() => setIsDetailOpen(false)}>
                            CANCEL
                        </Button>
                        {selectedUser && (
                            <Button
                                className={cn(
                                    "rounded-full h-14 px-10 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl",
                                    selectedUser.is_banned
                                        ? "bg-bouteek-green text-black hover:bg-white shadow-bouteek-green/20"
                                        : "bg-red-600 text-white hover:bg-black border border-transparent hover:border-red-600 shadow-red-600/20"
                                )}
                                onClick={() => {
                                    handleToggleBan(selectedUser);
                                    setIsDetailOpen(false);
                                }}
                                disabled={isUpdating}
                            >
                                {isUpdating && <Loader2 className="animate-spin mr-2" size={16} />}
                                {selectedUser.is_banned ? "REAUTHORIZE ACCESS" : "KILL CONNECTION"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
