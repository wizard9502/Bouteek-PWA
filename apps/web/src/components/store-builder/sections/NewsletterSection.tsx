import React from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface NewsletterSectionProps {
    title?: string;
    subtitle?: string;
    placeholder?: string;
    buttonText?: string;
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
}

export function NewsletterSection({
    title = "Stay Updated",
    subtitle = "Subscribe to our newsletter for exclusive deals and updates",
    placeholder = "Enter your email",
    buttonText = "Subscribe",
    primaryColor = "#000000",
    accentColor = "#00FF41",
    backgroundColor = "#f4f4f5"
}: NewsletterSectionProps) {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Successfully subscribed!');
        setEmail('');
        setLoading(false);
    };

    return (
        <section className="py-16 px-6" style={{ backgroundColor }}>
            <div className="max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: accentColor + '20' }}>
                    <Mail size={28} style={{ color: accentColor }} />
                </div>
                <h2 className="text-3xl font-black mb-4" style={{ color: primaryColor }}>
                    {title}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    {subtitle}
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={placeholder}
                        required
                        className="h-14 rounded-2xl bg-white border-border/50 flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-14 px-8 rounded-2xl font-bold"
                        style={{ backgroundColor: accentColor, color: '#fff' }}
                    >
                        {loading ? 'Subscribing...' : buttonText}
                        {!loading && <Send size={18} className="ml-2" />}
                    </Button>
                </form>
            </div>
        </section>
    );
}
