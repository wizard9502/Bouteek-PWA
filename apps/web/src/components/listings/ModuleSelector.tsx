"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Key, Sparkles, Check } from "lucide-react";
import { ModuleType } from "@/lib/listing-schemas";
import { cn } from "@/lib/utils";

interface ModuleSelectorProps {
    value: ModuleType;
    onChange: (type: ModuleType) => void;
    disabled?: boolean;
}

const modules = [
    {
        type: "sale" as ModuleType,
        icon: ShoppingBag,
        title: "Product Sale",
        titleFr: "Vente de Produits",
        description: "Physical products with variants, stock & shipping",
        descriptionFr: "Produits physiques avec variantes, stock et livraison",
        color: "#00FF41",
        features: ["Variants (Size, Color)", "Stock Tracking", "Weight & Shipping"],
    },
    {
        type: "rental" as ModuleType,
        icon: Key,
        title: "Rental",
        titleFr: "Location",
        description: "High-value items with deposits & ID verification",
        descriptionFr: "Articles de valeur avec caution et vérification d'identité",
        color: "#6366F1",
        features: ["Security Deposit", "ID Verification", "Late Fee Policy"],
    },
    {
        type: "service" as ModuleType,
        icon: Sparkles,
        title: "Service",
        titleFr: "Service",
        description: "Appointments, spa bookings & specialist selection",
        descriptionFr: "Rendez-vous, réservations spa et sélection de spécialiste",
        color: "#EC4899",
        features: ["Duration & Buffer", "Staff Selection", "Room/Booth Booking"],
    },
];

export function ModuleSelector({ value, onChange, disabled }: ModuleSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">What are you listing?</h2>
                <p className="text-muted-foreground text-sm">
                    Choose the type of listing to show the right options
                </p>
            </div>

            <div className="grid gap-4">
                {modules.map((module, index) => {
                    const Icon = module.icon;
                    const isSelected = value === module.type;

                    return (
                        <motion.button
                            key={module.type}
                            onClick={() => !disabled && onChange(module.type)}
                            disabled={disabled}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "relative p-6 rounded-3xl border-2 text-left transition-all",
                                "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
                                isSelected
                                    ? "border-transparent shadow-xl"
                                    : "border-border/50 bg-muted/20",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                            style={{
                                backgroundColor: isSelected ? `${module.color}10` : undefined,
                                borderColor: isSelected ? module.color : undefined,
                            }}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: module.color }}
                                >
                                    <Check size={14} className="text-black" />
                                </motion.div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${module.color}20` }}
                                >
                                    <Icon
                                        size={28}
                                        style={{ color: module.color }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-lg font-black">{module.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {module.description}
                                    </p>

                                    {/* Features Pills */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {module.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: `${module.color}15`,
                                                    color: module.color,
                                                }}
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
