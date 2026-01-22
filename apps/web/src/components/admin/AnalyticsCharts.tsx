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
                borderColor: '#00FF41',
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                tension: 0.5,
                fill: true,
                pointBackgroundColor: '#00FF41',
                pointBorderColor: '#000',
                pointHoverRadius: 6,
            },
            {
                label: t("common.charts.commissions"),
                data: data.map(d => d.com),
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                tension: 0.5,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#000',
                pointHoverRadius: 6,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { size: 10, weight: 'bold' as const, family: 'Inter' },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: '#000',
                titleColor: '#00FF41',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                mode: 'index' as const,
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10, weight: 'bold' as const } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10, weight: 'bold' as const } }
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
                    '#00FF41',
                    'rgba(0, 255, 65, 0.7)',
                    'rgba(0, 255, 65, 0.4)',
                    'rgba(0, 255, 65, 0.2)'
                ],
                borderWidth: 2,
                borderColor: '#000',
                hoverOffset: 15
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { size: 10, weight: 'bold' as const },
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        cutout: '75%'
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
                borderRadius: 8,
                hoverBackgroundColor: '#00FF41',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#000',
                titleColor: '#00FF41',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
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
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    callback: function (value: any) {
                        return (value / 1000) + 'k';
                    },
                    font: { size: 10, weight: 'bold' as const }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10, weight: 'bold' as const } }
            }
        }
    };

    return <Bar data={chartData} options={options} />;
}
