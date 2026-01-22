"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, Send, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getNotificationCampaigns, createNotificationCampaign } from "@/lib/adminData";
import { supabase } from "@/lib/supabaseClient";

export default function AdminNotifications() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [audience, setAudience] = useState("all");
    const [template, setTemplate] = useState("none");

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setIsLoading(true);
        const data = await getNotificationCampaigns();
        setCampaigns(data);
        setIsLoading(false);
    };

    const handleCreate = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        await createNotificationCampaign({
            title,
            body,
            target_audience: audience,
            template_type: template
        }, user?.id || 'system');

        setIsDialogOpen(false);
        setTitle("");
        setBody("");
        loadCampaigns();
    };

    const handleTemplateChange = (val: string) => {
        setTemplate(val);
        if (val === 'security') {
            setTitle("Security Alert: Important Update");
            setBody("We've updated our security policies. Please enable 2FA on your account.");
        } else if (val === 'marketing') {
            setTitle("Special Offer: 50% Off Fees!");
            setBody("For the next 48 hours, all transaction fees are slashed by half. Happy selling!");
        } else if (val === 'system') {
            setTitle("System Maintenance Scheduled");
            setBody("Bouteek will be undergoing maintenance this Sunday from 2 AM to 4 AM UTC.");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
                    <p className="text-gray-600 font-medium mt-1">Manage announcements and push campaigns.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-12 px-6 font-bold bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 w-5 h-5" /> New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Notification Campaign</DialogTitle>
                            <DialogDescription>Send a message to your users or merchants.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Template</label>
                                <Select onValueChange={handleTemplateChange}>
                                    <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Template</SelectItem>
                                        <SelectItem value="marketing">Marketing 🎁</SelectItem>
                                        <SelectItem value="security">Security 🔒</SelectItem>
                                        <SelectItem value="system">System ⚙️</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Target Audience</label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="merchants">Merchants Only</SelectItem>
                                        <SelectItem value="admins">Admins Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Title</label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Campaign Title" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Message</label>
                                <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Type your message here..." className="h-32" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={!title || !body} className="bg-orange-600 hover:bg-orange-700">
                                <Send className="mr-2 w-4 h-4" /> Send Campaign
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-border/50">
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Campaign</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Audience</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Status</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Sent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No campaigns sent yet.</td></tr>
                        ) : campaigns.map((c) => (
                            <tr key={c.id}>
                                <td className="py-4 px-6">
                                    <p className="font-bold text-gray-900">{c.title}</p>
                                    <p className="text-xs text-gray-600 truncate max-w-[300px]">{c.body}</p>
                                </td>
                                <td className="py-4 px-6 uppercase text-xs font-bold text-muted-foreground">
                                    {c.target_audience}
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">
                                        Sent
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {new Date(c.sent_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
