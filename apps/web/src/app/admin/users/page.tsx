"use client";

import React from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export default function UsersManagementPage() {
    const { t } = useTranslation();

    return (
        <div className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-border/50 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <UsersIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">
                    User Management
                </h1>
                <p className="text-muted-foreground max-w-sm">
                    The user management system is currently under development. You will soon be able to manage all platform users from here.
                </p>
            </div>
        </div>
    );
}
