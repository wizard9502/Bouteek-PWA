"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Shield, Clock, User } from "lucide-react";
import { getAuditLogs } from "@/lib/adminData";
import { Badge } from "@/components/ui/badge";
import { ClientOnly } from "@/components/ClientOnly";
import { useTranslation } from "@/contexts/TranslationContext";

export default function AdminAudit() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getAuditLogs();
            setLogs(data);
            setIsLoading(false);
        }
        load();
    }, []);

    return (
        <ClientOnly>
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">{t("admin.audit.title")}</h1>
                    <p className="text-gray-600 font-medium mt-1">{t("admin.audit.subtitle")}</p>
                </div>

                <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-border/50">
                                <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">{t("admin.audit.table.admin")}</th>
                                <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">{t("admin.audit.table.action")}</th>
                                <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">{t("admin.audit.table.target")}</th>
                                <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">{t("admin.audit.table.details")}</th>
                                <th className="text-right py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">{t("admin.audit.table.time")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{t("admin.audit.loading")}</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{t("admin.audit.no_logs")}</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-gray-100 rounded-lg text-gray-500"><User size={14} /></div>
                                            <span className="text-sm font-bold">{log.users?.email || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge variant="outline" className="font-mono text-xs font-bold border-blue-200 bg-blue-50 text-blue-700">
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6 text-xs font-medium text-gray-600">
                                        {log.target_type}: {log.target_id?.substring(0, 8)}
                                    </td>
                                    <td className="py-4 px-6 text-xs text-gray-600 max-w-[300px] truncate">
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td className="py-4 px-6 text-right text-xs text-gray-500 font-medium">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ClientOnly>
    );
}
