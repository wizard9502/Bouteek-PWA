"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Download,
    Calendar,
    Filter,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FilePieChart,
    Loader2,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";


export default function AdminReports() {
    const [generating, setGenerating] = useState<string | null>(null);

    const downloadCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(row =>
            Object.values(row).map(value => `"${value}"`).join(",")
        ).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerate = async (reportId: string, format: 'PDF' | 'CSV') => {
        setGenerating(`${reportId}-${format}`);

        try {
            if (format === 'CSV') {
                // Fetch some data based on report type
                let data: any[] = [];
                if (reportId === 'financial') {
                    const { data: txs } = await supabase.from('wallet_transactions').select('*').limit(100);
                    data = txs || [];
                } else if (reportId === 'merchants') {
                    const { data: m } = await supabase.from('merchants').select('business_name, slug, subscription_tier, bouteek_cash_balance').limit(100);
                    data = m || [];
                } else {
                    // Fallback dummy data
                    data = [{ info: "No real data for this report yet", timestamp: new Date().toISOString() }];
                }

                downloadCSV(data, `Bouteek_${reportId}_Report_${new Date().toISOString().split('T')[0]}.csv`);
                toast.success(`CSV exported successfully!`);
            } else {
                // PDF simulation
                await new Promise(resolve => setTimeout(resolve, 2000));
                toast.success(`PDF generated and ready for download!`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Generation failed");
        } finally {
            setGenerating(null);
        }
    };


    const reportTypes = [
        {
            id: "financial",
            name: "Financial Summary",
            desc: "Revenue, commissions, and payout logs.",
            icon: FilePieChart,
            color: "bg-blue-500/10 text-blue-600"
        },
        {
            id: "merchants",
            name: "Merchant Health",
            desc: "Active vs Churned merchants, tier distribution.",
            icon: FileText,
            color: "bg-emerald-500/10 text-emerald-600"
        },
        {
            id: "audit",
            name: "System Audit",
            desc: "Security logs, admin actions, and errors.",
            icon: FileSpreadsheet,
            color: "bg-purple-500/10 text-purple-600"
        },
        {
            id: "tax",
            name: "VAT & Tax Report",
            desc: "Regional tax summaries for compliant accounting.",
            icon: FileText,
            color: "bg-amber-500/10 text-amber-600"
        }
    ];

    const recentReports = [
        { name: "Monthly_Revenue_Dec_2025.pdf", size: "2.4 MB", date: "2 days ago", type: "PDF" },
        { name: "Global_Payout_Audit_Q4.csv", size: "1.1 MB", date: "Jan 12, 2026", type: "CSV" },
        { name: "Seller_Analytics_Annual.xlsx", size: "8.9 MB", date: "Jan 10, 2026", type: "XLSX" },
    ];

    return (
        <div className="p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Reports & Exports</h1>
                    <p className="text-muted-foreground font-medium mt-1">Generate and download platform data for accounting and audit.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input placeholder="Search past reports..." className="pl-10 rounded-2xl h-12 w-64 border-border/50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generate New Report */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black">Generate New Report</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportTypes.map((report) => (
                            <Card key={report.id} className="rounded-3xl border-border/50 shadow-sm hover:border-blue-500 transition-colors cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className={`p-4 rounded-2xl w-fit ${report.color} group-hover:scale-110 transition-transform`}>
                                        <report.icon size={28} />
                                    </div>
                                    <h4 className="text-lg font-black mt-6">{report.name}</h4>
                                    <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">{report.desc}</p>

                                    <div className="mt-8 flex gap-2">
                                        <Button
                                            variant="secondary"
                                            className="flex-1 rounded-xl h-10 font-bold text-xs"
                                            disabled={!!generating}
                                            onClick={() => handleGenerate(report.id, 'PDF')}
                                        >
                                            {generating === `${report.id}-PDF` ? <Loader2 className="animate-spin" size={14} /> : "PDF"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-xl h-10 font-bold text-xs"
                                            disabled={!!generating}
                                            onClick={() => handleGenerate(report.id, 'CSV')}
                                        >
                                            {generating === `${report.id}-CSV` ? <Loader2 className="animate-spin" size={14} /> : "CSV"}
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="rounded-4xl border-border/50 shadow-sm p-10 bg-black text-white relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h4 className="text-2xl font-black">Custom Data Query</h4>
                            <p className="text-gray-400 font-medium">Need something specific? Use our advanced query builder to extract raw data from the ecosystem.</p>
                            <Button className="rounded-2xl bg-bouteek-green text-black font-black h-14 px-8 uppercase tracking-widest hover:scale-105 transition-transform">
                                Launch Query Builder
                                <ChevronRight className="ml-2" size={20} />
                            </Button>
                        </div>
                        <Filter size={180} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12" />
                    </Card>
                </div>

                {/* Recent Reports List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black">Recent Generations</h3>
                    <div className="space-y-3">
                        {recentReports.map((file, i) => (
                            <motion.div
                                key={file.name}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bouteek-card p-5 group hover:border-blue-500 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Download size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {file.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    {file.size}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-xl">
                                        <Clock size={16} className="text-muted-foreground" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
