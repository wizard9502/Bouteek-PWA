"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizerProps {
    prices: {
        starter: number;
        launch: number;
        growth: number;
        pro: number;
    };
    onSelectPlan: (plan: string) => void;
}

export function SubscriptionOptimizer({ prices, onSelectPlan }: OptimizerProps) {
    const [salesVolume, setSalesVolume] = useState([100000]); // Default 100k XOF

    const calculations = useMemo(() => {
        const v = salesVolume[0];
        const plans = [
            { id: "starter", name: "Starter", base: prices.starter, rate: 0.05, savings: 0 },
            { id: "launch", name: "Launch", base: prices.launch, rate: 0.03, savings: 0 },
            { id: "growth", name: "Growth", base: prices.growth, rate: 0.015, savings: 0 },
            { id: "pro", name: "Pro", base: prices.pro, rate: 0.0075, savings: 0 },
        ];

        // Calculate Total Cost (C)
        const withCost = plans.map(p => ({
            ...p,
            totalCost: p.base + (v * p.rate)
        }));

        // Find Cheapest
        const minCost = Math.min(...withCost.map(p => p.totalCost));

        // Calculate Savings relative to Starter (or generally just show absolute cost)
        // Let's calculate savings relative to the most expensive option for this volume? 
        // Or relative to the "Starter" plan if you were to stay on it? 
        // The prompt says "Monthly Savings badge compared to other plans".
        // Let's compare to the *most expensive* feasible plan, or specifically to Starter as baseline.
        const starterCost = withCost.find(p => p.id === "starter")?.totalCost || 0;

        return withCost.map(p => ({
            ...p,
            isBestValue: p.totalCost === minCost,
            savings: starterCost - p.totalCost
        }));

    }, [salesVolume, prices]);

    return (
        <div className="space-y-8 py-6">
            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-black text-lg">Sales Estimator</h3>
                    <Badge variant="outline" className="text-lg px-4 py-1 bg-white shadow-sm border-2 font-mono">
                        {salesVolume[0].toLocaleString()} XOF
                    </Badge>
                </div>
                <Slider
                    defaultValue={[100000]}
                    max={5000000}
                    step={50000}
                    value={salesVolume}
                    onValueChange={setSalesVolume}
                    className="py-4"
                />
                <p className="text-xs text-muted-foreground text-center">
                    Slide to estimate your monthly sales volume (V)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {calculations.map((plan) => (
                    <Card
                        key={plan.id}
                        onClick={() => onSelectPlan(plan.id)}
                        className={cn(
                            "relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] border-2",
                            plan.isBestValue ? "border-bouteek-green bg-bouteek-green/5 ring-4 ring-bouteek-green/10" : "border-border/50 hover:border-black/20"
                        )}
                    >
                        {plan.isBestValue && (
                            <div className="absolute top-0 right-0 bg-bouteek-green text-black px-3 py-1 text-xs font-black uppercase rounded-bl-xl z-10 flex items-center gap-1">
                                <Star size={12} fill="currentColor" /> Best Value
                            </div>
                        )}

                        <div className="p-5 space-y-4">
                            <div>
                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">{plan.name}</h4>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-black">
                                        {Math.round(plan.totalCost).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground">XOF/mo</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Est. Total Cost</p>
                            </div>

                            {plan.savings > 0 && (
                                <Badge className="w-full justify-center bg-black text-white hover:bg-black/90">
                                    Save {Math.round(plan.savings).toLocaleString()} XOF
                                </Badge>
                            )}

                            {!plan.isBestValue && plan.savings <= 0 && (
                                <div className="h-6"></div> // Spacer
                            )}

                            <div className="pt-4 border-t border-border/10 text-xs text-muted-foreground space-y-1">
                                <div className="flex justify-between">
                                    <span>Base:</span>
                                    <span>{plan.base.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium text-black">
                                    <span>Comm. ({plan.rate * 100}%):</span>
                                    <span>+{Math.round(salesVolume[0] * plan.rate).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
