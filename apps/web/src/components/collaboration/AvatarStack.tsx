"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

interface User {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
    section?: string;
}

interface AvatarStackProps {
    users: User[];
    maxVisible?: number;
    showEditingIndicator?: boolean;
}

/**
 * Displays a stack of overlapping avatars for active collaborators.
 * Shows a pulsing indicator if any user is actively editing.
 */
export function AvatarStack({ 
    users, 
    maxVisible = 3,
    showEditingIndicator = true 
}: AvatarStackProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const visibleUsers = users.slice(0, maxVisible);
    const overflowCount = Math.max(0, users.length - maxVisible);
    const hasActiveEditors = users.some(u => u.section);

    if (users.length === 0) {
        return null;
    }

    return (
        <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="flex items-center gap-1">
                {/* Editing indicator */}
                {showEditingIndicator && hasActiveEditors && (
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-green-500 mr-1"
                    />
                )}

                {/* Avatar stack */}
                <div className="flex -space-x-2">
                    <AnimatePresence mode="popLayout">
                        {visibleUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                                style={{ zIndex: maxVisible - index }}
                            >
                                <Avatar user={user} />
                                
                                {/* Active editing ring */}
                                {user.section && (
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute -inset-0.5 rounded-full border-2 border-green-500"
                                    />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Overflow count */}
                    {overflowCount > 0 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold">
                            +{overflowCount}
                        </div>
                    )}
                </div>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-0 mt-2 bg-popover border rounded-xl shadow-lg p-3 min-w-[200px] z-50"
                    >
                        <div className="flex items-center gap-2 text-sm font-bold mb-2">
                            <Users size={14} />
                            <span>{users.length} active</span>
                        </div>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center gap-2">
                                    <Avatar user={user} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user.name || user.email.split("@")[0]}
                                        </p>
                                        {user.section && (
                                            <p className="text-xs text-green-600">
                                                Editing: {user.section}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface AvatarProps {
    user: User;
    size?: "sm" | "md" | "lg";
}

function Avatar({ user, size = "md" }: AvatarProps) {
    const sizeClasses = {
        sm: "w-6 h-6 text-[10px]",
        md: "w-8 h-8 text-xs",
        lg: "w-10 h-10 text-sm",
    };

    const initials = (user.name || user.email)
        .split(/[\s@]/)
        .slice(0, 2)
        .map(s => s[0]?.toUpperCase())
        .join("");

    // Generate consistent color from email
    const hashCode = user.email.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue = Math.abs(hashCode) % 360;
    const bgColor = `hsl(${hue}, 70%, 45%)`;

    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name || user.email}
                className={`${sizeClasses[size]} rounded-full border-2 border-background object-cover`}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} rounded-full border-2 border-background flex items-center justify-center font-bold text-white`}
            style={{ backgroundColor: bgColor }}
        >
            {initials}
        </div>
    );
}

interface EditingIndicatorProps {
    user: User;
    sectionName?: string;
}

/**
 * Shows "User is editing..." indicator for a specific section.
 */
export function EditingIndicator({ user, sectionName }: EditingIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs"
        >
            <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
            />
            <Avatar user={user} size="sm" />
            <span className="text-green-700 font-medium">
                {user.name || user.email.split("@")[0]} is editing
                {sectionName && ` ${sectionName}`}...
            </span>
        </motion.div>
    );
}
