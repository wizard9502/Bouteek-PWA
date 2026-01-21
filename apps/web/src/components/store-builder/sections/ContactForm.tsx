import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ContactFormProps {
    title?: string;
    subtitle?: string;
    showContactInfo?: boolean;
    email?: string;
    phone?: string;
    address?: string;
    primaryColor?: string;
    accentColor?: string;
}

export function ContactForm({
    title = "Get In Touch",
    subtitle = "Have a question? We'd love to hear from you",
    showContactInfo = true,
    email = "contact@yourstore.com",
    phone = "+221 77 000 00 00",
    address = "Dakar, Senegal",
    primaryColor = "#000000",
    accentColor = "#00FF41"
}: ContactFormProps) {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
        setLoading(false);
    };

    return (
        <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black mb-4" style={{ color: primaryColor }}>
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    {showContactInfo && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                    <Mail size={24} style={{ color: accentColor }} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Email</h3>
                                    <a href={`mailto:${email}`} className="text-muted-foreground hover:underline">
                                        {email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                    <Phone size={24} style={{ color: accentColor }} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Phone</h3>
                                    <a href={`tel:${phone}`} className="text-muted-foreground hover:underline">
                                        {phone}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                                    <MapPin size={24} style={{ color: accentColor }} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Address</h3>
                                    <p className="text-muted-foreground">{address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="h-12 rounded-xl"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="h-12 rounded-xl"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                className="min-h-[150px] rounded-xl"
                                placeholder="Your message..."
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl font-bold"
                            style={{ backgroundColor: accentColor, color: '#fff' }}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                            {!loading && <Send size={18} className="ml-2" />}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
