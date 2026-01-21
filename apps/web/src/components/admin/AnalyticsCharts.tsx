"use client";

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useTranslation } from "@/contexts/TranslationContext";

// Ensure registration happens
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface RevenueDataPoint {
    name: string;
    sub: number;
    com: number;
}

interface RevenueChartProps {
    data: RevenueDataPoint[];
}

export function RevenueGrowthChart({ data }: RevenueChartProps) {
    const { t } = useTranslation();
    const chartData = {
        labels: data.map(d => d.name),
        datasets: [
            {
                label: t("common.charts.subscriptions"),
                data: data.map(d => d.sub),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
                fill: true
            },
            {
                label: t("common.charts.commissions"),
                data: data.map(d => d.com),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return <Line options={options} data={chartData} />;
}

interface SubscriptionDataPoint {
    name: string;
    value: number;
}

interface SubscriptionChartProps {
    data: SubscriptionDataPoint[];
}

export function SubscriptionDistributionChart({ data }: SubscriptionChartProps) {
    const { t } = useTranslation();
    const chartData = {
        labels: data.map(d => d.name),
        datasets: [
            {
                label: t("common.charts.merchants_count"),
                data: data.map(d => d.value),
                backgroundColor: [
                    '#0088FE', // Starter
                    '#00C49F', // Launch
                    '#FFBB28', // Growth
                    '#FF8042'  // Pro
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const
            }
        }
    };

    return <Doughnut data={chartData} options={options} />;
}


// --- Generic Dashboard Charts ---

interface DashboardBarChartProps {
    data: { name: string; revenue: number }[];
}

export function DashboardRevenueChart({ data }: DashboardBarChartProps) {
    const { t } = useTranslation();
    const chartData = {
        labels: data.map(d => d.name),
        datasets: [
            {
                label: t("common.charts.revenue"),
                data: data.map(d => d.revenue),
                backgroundColor: '#00FF41',
                borderRadius: 4,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return context.parsed.y.toLocaleString() + ' XOF';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6'
                },
                ticks: {
                    callback: function (value: any) {
                        return (value / 1000) + 'k';
                    },
                    font: {
                        size: 10,
                        weight: 'bold' as const
                    }
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: {
                        size: 10,
                        weight: 'bold' as const
                    }
                },
                border: { display: false }
            }
        }
    };

    return <Bar data={chartData} options={options} />;
}
