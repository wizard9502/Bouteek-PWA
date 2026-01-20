"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Key,
    Clock,
    Shield,
    AlertTriangle,
    CreditCard,
    FileText
} from "lucide-react";
import { RentalMetadata } from "@/lib/listing-schemas";
import { cn } from "@/lib/utils";

interface RentalFieldsProps {
    metadata: RentalMetadata;
    basePrice: number;
    onMetadataChange: <K extends keyof RentalMetadata>(key: K, value: RentalMetadata[K]) => void;
    onBasePriceChange: (price: number) => void;
    errors?: Record<string, string>;
}

const RENTAL_UNITS = [
    { value: "hour", label: "Per Hour", labelFr: "Par Heure" },
    { value: "day", label: "Per Day", labelFr: "Par Jour" },
    { value: "week", label: "Per Week", labelFr: "Par Semaine" },
    { value: "month", label: "Per Month", labelFr: "Par Mois" },
] as const;

export function RentalFields({
    metadata,
    basePrice,
    onMetadataChange,
    onBasePriceChange,
    errors,
}: RentalFieldsProps) {
    return (
        <div className="space-y-6">
            {/* Rental Price & Unit */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Key size={14} className="text-indigo-500" />
                            Rental Price (XOF)
                        </Label>
                        <Input
                            type="number"
                            value={basePrice || ""}
                            onChange={(e) => onBasePriceChange(Number(e.target.value))}
                            placeholder="15000"
                            className="h-14 rounded-2xl bg-muted/30 text-lg font-bold"
                        />
                        {errors?.["base_price"] && (
                            <p className="text-xs text-red-500">{errors["base_price"]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-indigo-500" />
                            Rental Unit
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {RENTAL_UNITS.map((unit) => (
                                <button
                                    key={unit.value}
                                    type="button"
                                    onClick={() => onMetadataChange("rental_unit", unit.value)}
                                    className={cn(
                                        "py-3 rounded-xl text-xs font-bold transition-all",
                                        metadata.rental_unit === unit.value
                                            ? "bg-indigo-500 text-white"
                                            : "bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    {unit.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Min/Max Period */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest">
                            Minimum Period
                        </Label>
                        <Input
                            type="number"
                            value={metadata.min_period || ""}
                            onChange={(e) => onMetadataChange("min_period", Number(e.target.value))}
                            placeholder="1"
                            min={1}
                            className="h-12 rounded-xl bg-muted/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest">
                            Maximum Period (optional)
                        </Label>
                        <Input
                            type="number"
                            value={metadata.max_period || ""}
                            onChange={(e) => onMetadataChange("max_period", Number(e.target.value) || undefined)}
                            placeholder="30"
                            className="h-12 rounded-xl bg-muted/30"
                        />
                    </div>
                </div>
            </div>

            {/* Security Deposit */}
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <CreditCard size={20} className="text-indigo-500" />
                    </div>
                    <div>
                        <h4 className="font-bold">Security Deposit</h4>
                        <p className="text-xs text-muted-foreground">
                            Amount held until item is returned
                        </p>
                    </div>
                </div>
                <Input
                    type="number"
                    value={metadata.deposit_amount || ""}
                    onChange={(e) => onMetadataChange("deposit_amount", Number(e.target.value))}
                    placeholder="50000 XOF"
                    className="h-14 rounded-xl bg-white/50 text-lg font-bold"
                />
            </div>

            {/* ID Verification Toggle */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Shield size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <h4 className="font-bold">Require ID Verification</h4>
                            <p className="text-xs text-muted-foreground">
                                Customers must upload passport/ID at checkout
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={metadata.require_id_verification}
                        onCheckedChange={(checked) => onMetadataChange("require_id_verification", checked)}
                    />
                </div>
            </div>

            {/* Late Fee Policy */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    <Label className="text-xs font-black uppercase tracking-widest">
                        Late Fee Policy
                    </Label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <Textarea
                            value={metadata.late_fee_policy || ""}
                            onChange={(e) => onMetadataChange("late_fee_policy", e.target.value)}
                            placeholder="Describe your late return policy..."
                            className="rounded-xl bg-muted/30 min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase">
                            Late Fee %
                        </Label>
                        <Input
                            type="number"
                            value={metadata.late_fee_percentage || ""}
                            onChange={(e) => onMetadataChange("late_fee_percentage", Number(e.target.value))}
                            placeholder="10"
                            min={0}
                            max={100}
                            className="h-12 rounded-xl bg-muted/30 text-center font-bold"
                        />
                        <p className="text-[10px] text-muted-foreground text-center">per day late</p>
                    </div>
                </div>
            </div>

            {/* Insurance Info */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" />
                    <Label className="text-xs font-black uppercase tracking-widest">
                        Insurance Information (Optional)
                    </Label>
                </div>
                <Textarea
                    value={metadata.insurance_info || ""}
                    onChange={(e) => onMetadataChange("insurance_info", e.target.value)}
                    placeholder="Details about damage protection, insurance coverage, etc."
                    className="rounded-xl bg-muted/30 min-h-[80px]"
                />
            </div>
        </div>
    );
}
