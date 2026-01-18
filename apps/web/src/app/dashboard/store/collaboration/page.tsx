"use client";

import { useState } from "react";
import {
    Users,
    UserPlus,
    ShieldCheck,
    Mail,
    Lock,
    Trash2,
    Settings,
    MoreHorizontal,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";


export default function TeamPage() {
    const { language } = useTranslation();
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("editor");
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
            if (!merchant) return;

            // Fetch staff joined with public.users
            const { data } = await supabase
                .from('store_staff')
                .select(`
                    id,
                    role,
                    created_at,
                    user:users(id, name, email)
                `)
                .eq('merchant_id', merchant.id);

            setTeam(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setIsInviting(true);
        try {
            // In a real app, we'd find the user by email or send an invitation link
            // For this demo/impl, we'll try to find user by email in public.users
            const { data: targetUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', inviteEmail)
                .single();

            if (!targetUser) {
                throw new Error("User with this email not found on Bouteek. They must sign up first.");
            }

            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();

            const { error } = await supabase.from('store_staff').insert({
                merchant_id: merchant?.id,
                user_id: targetUser.id,
                role: inviteRole
            });

            if (error) throw error;
            toast.success(`${inviteEmail} invited!`);
            setIsInviteOpen(false);
            setInviteEmail("");
            fetchTeam();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('store_staff').delete().eq('id', id);
            if (error) throw error;
            setTeam(team.filter(m => m.id !== id));
            toast.success("Team member removed");
        } catch (error: any) {
            toast.error(error.message);
        }
    };


    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Collaboration d'Équipe" : "Team Collaboration"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Gérez vos employés et leurs permissions d'accès." : "Manage your staff members and their access permissions."}</p>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl bg-bouteek-green text-black font-bold h-12 px-6">
                            <UserPlus className="mr-2" size={20} />
                            {language === 'fr' ? "Inviter Membre" : "Invite Member"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none p-8 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">{language === 'fr' ? "Inviter un Co-équipier" : "Invite Team Member"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                <Input
                                    placeholder="colleague@email.com"
                                    className="h-12 rounded-xl bg-muted/30 font-bold"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleInvite}
                                disabled={isInviting}
                                className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-black/90"
                            >
                                {isInviting ? <Loader2 className="animate-spin" /> : (language === 'fr' ? "Envoyer Invitation" : "Send Invite")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Slots</p>
                    <h3 className="text-3xl font-black mt-2">2 / 5</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Roles</p>
                    <h3 className="text-3xl font-black mt-2">3</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Actions Logs</p>
                    <h3 className="text-3xl font-black mt-2">1,542</h3>
                </Card>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Membres de l'Équipe" : "Team Members"}</h3>
                <div className="space-y-4">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : team.length === 0 ? (
                            <div className="text-center p-12 text-muted-foreground font-medium">No team members yet. Invite your first colleague!</div>
                        ) : team.map((member, i) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bouteek-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <Avatar className="w-16 h-16 rounded-2xl border-2 border-border/50">
                                        <AvatarFallback className="bg-muted text-black font-black">{member.user?.name?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-xl">{member.user?.name || 'Anonymous User'}</h4>
                                            <Badge className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase bg-bouteek-green/10 text-bouteek-green">
                                                Active
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-2">
                                            <Mail size={12} />
                                            {member.user?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <ShieldCheck size={14} className="text-bouteek-green" />
                                            <p className="text-lg font-black capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="rounded-xl border-border/50 text-red-500 hover:bg-red-50" onClick={() => handleDelete(member.id)}>
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>

            <Card className="p-8 rounded-4xl border-border/50 bg-gradient-to-br from-purple-500/5 to-transparent flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Lock size={32} />
                </div>
                <div>
                    <h4 className="text-xl font-black">{language === 'fr' ? "Permissions Granulaires" : "Granular Permissions"}</h4>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Control exactly what your staff can see – hide financial data from support members.
                    </p>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest border-border/50">
                    Edit Role Privileges
                </Button>
            </Card>
        </div>
    );
}
