"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Timer,
    Users,
    DoorOpen,
    Sparkles,
    Plus,
    X
} from "lucide-react";
import { ServiceMetadata } from "@/lib/listing-schemas";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
} from "@/components/ui/drawer";

interface ServiceFieldsProps {
    metadata: ServiceMetadata;
    basePrice: number;
    storeId?: string;
    onMetadataChange: <K extends keyof ServiceMetadata>(key: K, value: ServiceMetadata[K]) => void;
    onBasePriceChange: (price: number) => void;
    errors?: Record<string, string>;
}

interface Staff {
    id: string;
    name: string;
    avatar_url?: string;
    role?: string;
    specialties?: string[];
}

interface Room {
    id: string;
    name: string;
    capacity: number;
    amenities?: string[];
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];
const BUFFER_PRESETS = [0, 5, 10, 15, 30];

const AMENITY_SUGGESTIONS = [
    "WiFi", "AC", "Music", "Towels", "Shower", "Locker",
    "Refreshments", "Parking", "Robe", "Slippers"
];

export function ServiceFields({
    metadata,
    basePrice,
    storeId,
    onMetadataChange,
    onBasePriceChange,
    errors,
}: ServiceFieldsProps) {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isAmenitySheetOpen, setIsAmenitySheetOpen] = useState(false);
    const [customAmenity, setCustomAmenity] = useState("");

    // Fetch staff and rooms
    useEffect(() => {
        if (storeId) {
            fetchStaffAndRooms();
        }
    }, [storeId]);

    const fetchStaffAndRooms = async () => {
        if (!storeId) return;

        setLoadingData(true);
        try {
            const [staffRes, roomsRes] = await Promise.all([
                supabase.from('staff').select('*').eq('store_id', storeId).eq('is_active', true),
                supabase.from('rooms').select('*').eq('store_id', storeId).eq('is_active', true),
            ]);

            if (staffRes.data) setStaff(staffRes.data);
            if (roomsRes.data) setRooms(roomsRes.data);
        } catch (error) {
            console.error('Failed to fetch staff/rooms:', error);
        } finally {
            setLoadingData(false);
        }
    };

    // Toggle staff selection
    const toggleStaff = (staffId: string) => {
        const current = metadata.assigned_staff_ids || [];
        const updated = current.includes(staffId)
            ? current.filter(id => id !== staffId)
            : [...current, staffId];
        onMetadataChange("assigned_staff_ids", updated);
    };

    // Add amenity
    const addAmenity = (amenity: string) => {
        if (!amenity.trim()) return;
        const current = metadata.amenities_included || [];
        if (!current.includes(amenity)) {
            onMetadataChange("amenities_included", [...current, amenity]);
        }
        setCustomAmenity("");
    };

    // Remove amenity
    const removeAmenity = (amenity: string) => {
        const current = metadata.amenities_included || [];
        onMetadataChange("amenities_included", current.filter(a => a !== amenity));
    };

    return (
        <div className="space-y-6">
            {/* Service Price */}
            <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-500" />
                    Service Price (XOF)
                </Label>
                <Input
                    type="number"
                    value={basePrice || ""}
                    onChange={(e) => onBasePriceChange(Number(e.target.value))}
                    placeholder="25000"
                    className="h-14 rounded-2xl bg-muted/30 text-lg font-bold"
                />
                {errors?.["base_price"] && (
                    <p className="text-xs text-red-500">{errors["base_price"]}</p>
                )}
            </div>

            {/* Duration */}
            <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-pink-500" />
                    Duration (minutes)
                </Label>
                <div className="flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((mins) => (
                        <button
                            key={mins}
                            type="button"
                            onClick={() => onMetadataChange("duration_minutes", mins)}
                            className={cn(
                                "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                                metadata.duration_minutes === mins
                                    ? "bg-pink-500 text-white"
                                    : "bg-muted/50 hover:bg-muted"
                            )}
                        >
                            {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                        </button>
                    ))}
                </div>
                <Input
                    type="number"
                    value={metadata.duration_minutes || ""}
                    onChange={(e) => onMetadataChange("duration_minutes", Number(e.target.value))}
                    placeholder="Custom duration"
                    min={15}
                    className="h-12 rounded-xl bg-muted/30"
                />
            </div>

            {/* Buffer Times */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Timer size={14} /> Buffer Before
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {BUFFER_PRESETS.map((mins) => (
                            <button
                                key={mins}
                                type="button"
                                onClick={() => onMetadataChange("buffer_time_before", mins)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    metadata.buffer_time_before === mins
                                        ? "bg-pink-500 text-white"
                                        : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Timer size={14} /> Buffer After
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {BUFFER_PRESETS.map((mins) => (
                            <button
                                key={mins}
                                type="button"
                                onClick={() => onMetadataChange("buffer_time_after", mins)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    metadata.buffer_time_after === mins
                                        ? "bg-pink-500 text-white"
                                        : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Total Time Display */}
            <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between">
                <span className="text-sm font-medium">Total Slot Duration</span>
                <span className="text-xl font-black text-pink-500">
                    {(metadata.buffer_time_before || 0) +
                        (metadata.duration_minutes || 0) +
                        (metadata.buffer_time_after || 0)} min
                </span>
            </div>

            {/* Staff Selection Toggle */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                            <Users size={20} className="text-pink-500" />
                        </div>
                        <div>
                            <h4 className="font-bold">Allow Specialist Selection</h4>
                            <p className="text-xs text-muted-foreground">
                                Let customers choose their preferred specialist
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={metadata.allow_specialist_selection}
                        onCheckedChange={(checked) => onMetadataChange("allow_specialist_selection", checked)}
                    />
                </div>

                {/* Staff Grid */}
                {metadata.allow_specialist_selection && staff.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                        <Label className="text-xs font-black uppercase tracking-widest mb-3 block">
                            Assigned Staff
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {staff.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => toggleStaff(member.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                                        (metadata.assigned_staff_ids || []).includes(member.id)
                                            ? "bg-pink-500 text-white"
                                            : "bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-sm font-bold">{member.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {metadata.allow_specialist_selection && staff.length === 0 && (
                    <p className="mt-4 text-xs text-muted-foreground">
                        No staff members yet. Add staff in Settings → Staff Management.
                    </p>
                )}
            </div>

            {/* Room Selection */}
            {rooms.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <DoorOpen size={14} className="text-pink-500" />
                        Room / Booth Assignment
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                type="button"
                                onClick={() => onMetadataChange("room_id",
                                    metadata.room_id === room.id ? undefined : room.id
                                )}
                                className={cn(
                                    "p-4 rounded-xl text-left transition-all",
                                    metadata.room_id === room.id
                                        ? "bg-pink-500 text-white"
                                        : "bg-muted/30 hover:bg-muted/50"
                                )}
                            >
                                <p className="font-bold">{room.name}</p>
                                <p className="text-xs opacity-70">Capacity: {room.capacity}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Amenities */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest">
                        Included Amenities
                    </Label>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-8 text-xs"
                        onClick={() => setIsAmenitySheetOpen(true)}
                    >
                        <Plus size={12} className="mr-1" /> Add
                    </Button>
                </div>

                {/* Current amenities */}
                <div className="flex flex-wrap gap-2">
                    {(metadata.amenities_included || []).map((amenity) => (
                        <span
                            key={amenity}
                            className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/10 text-pink-500 rounded-full text-xs font-bold"
                        >
                            {amenity}
                            <button onClick={() => removeAmenity(amenity)} className="hover:opacity-70">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    {(metadata.amenities_included || []).length === 0 && (
                        <span className="text-xs text-muted-foreground">No amenities selected</span>
                    )}
                </div>
            </div>

            {/* Max Bookings Per Slot */}
            <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest">
                    Max Bookings Per Slot
                </Label>
                <Input
                    type="number"
                    value={metadata.max_bookings_per_slot || 1}
                    onChange={(e) => onMetadataChange("max_bookings_per_slot", Number(e.target.value))}
                    min={1}
                    className="h-12 rounded-xl bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                    For group sessions or classes, increase this number
                </p>
            </div>

            {/* Amenity Selection Sheet */}
            <Drawer open={isAmenitySheetOpen} onOpenChange={setIsAmenitySheetOpen}>
                <DrawerContent className="max-h-[70vh]">
                    <DrawerHeader>
                        <DrawerTitle className="font-black">Add Amenities</DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 pb-4 space-y-4">
                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-2">
                            {AMENITY_SUGGESTIONS.filter(
                                a => !(metadata.amenities_included || []).includes(a)
                            ).map((amenity) => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => addAmenity(amenity)}
                                    className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-xl text-sm font-bold transition-colors"
                                >
                                    + {amenity}
                                </button>
                            ))}
                        </div>

                        {/* Custom input */}
                        <div className="flex gap-2">
                            <Input
                                value={customAmenity}
                                onChange={(e) => setCustomAmenity(e.target.value)}
                                placeholder="Custom amenity"
                                className="rounded-xl"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addAmenity(customAmenity);
                                    }
                                }}
                            />
                            <Button
                                onClick={() => addAmenity(customAmenity)}
                                className="rounded-xl bg-pink-500 text-white"
                                disabled={!customAmenity.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAmenitySheetOpen(false)}
                            className="rounded-xl"
                        >
                            Done
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
