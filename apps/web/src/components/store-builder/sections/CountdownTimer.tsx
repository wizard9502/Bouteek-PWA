import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
    title?: string;
    subtitle?: string;
    targetDate?: string; // ISO date string
    primaryColor?: string;
    accentColor?: string;
}

export function CountdownTimer({
    title = "Limited Time Offer",
    subtitle = "Hurry! Sale ends soon",
    targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    primaryColor = "#000000",
    accentColor = "#00FF41"
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = React.useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timeUnits = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds }
    ];

    return (
        <section className="py-16 px-6 bg-gradient-to-br from-muted/30 to-transparent">
            <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock size={32} style={{ color: accentColor }} />
                    <h2 className="text-4xl font-black" style={{ color: primaryColor }}>
                        {title}
                    </h2>
                </div>
                <p className="text-muted-foreground text-lg mb-10">{subtitle}</p>

                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {timeUnits.map((unit, index) => (
                        <motion.div
                            key={unit.label}
                            className="bouteek-card p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="text-5xl font-black mb-2" style={{ color: accentColor }}>
                                {String(unit.value).padStart(2, '0')}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {unit.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
