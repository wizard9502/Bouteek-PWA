import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    title?: string;
    items?: FAQItem[];
    primaryColor?: string;
    accentColor?: string;
}

export function FAQSection({
    title = "Frequently Asked Questions",
    items = [
        { question: "How do I place an order?", answer: "Simply browse our products, add items to your cart, and proceed to checkout." },
        { question: "What payment methods do you accept?", answer: "We accept Wave and Orange Money mobile payments." },
        { question: "How long does delivery take?", answer: "Delivery typically takes 2-3 business days within Dakar." }
    ],
    primaryColor = "#000000",
    accentColor = "#00FF41"
}: FAQSectionProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <section className="py-12 px-6">
            <h2 className="text-3xl font-black text-center mb-10" style={{ color: primaryColor }}>
                {title}
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        className="border border-border/50 rounded-2xl overflow-hidden bg-card"
                        initial={false}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                            <span className="font-bold text-lg pr-4">{item.question}</span>
                            <motion.div
                                animate={{ rotate: openIndex === index ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={20} style={{ color: accentColor }} />
                            </motion.div>
                        </button>
                        <motion.div
                            initial={false}
                            animate={{
                                height: openIndex === index ? 'auto' : 0,
                                opacity: openIndex === index ? 1 : 0
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                {item.answer}
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
