"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * Merchant Theme Configuration
 * These values are pulled from the storefront's branding settings
 */
export interface MerchantTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    buttonStyle: 'solid' | 'outline' | 'ghost';
}

const defaultTheme: MerchantTheme = {
    primaryColor: '#00C853', // bouteek-green
    secondaryColor: '#1a1a1a',
    accentColor: '#FFD700',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 'lg',
    buttonStyle: 'solid',
};

interface MerchantThemeContextValue {
    theme: MerchantTheme;
    setTheme: (theme: Partial<MerchantTheme>) => void;
    isLoading: boolean;
}

const MerchantThemeContext = createContext<MerchantThemeContextValue>({
    theme: defaultTheme,
    setTheme: () => { },
    isLoading: false,
});

export function useMerchantTheme() {
    return useContext(MerchantThemeContext);
}

interface MerchantThemeProviderProps {
    children: ReactNode;
    initialTheme?: Partial<MerchantTheme>;
    storefrontId?: string;
}

/**
 * Convert border radius setting to CSS value
 */
function getBorderRadiusValue(radius: MerchantTheme['borderRadius']): string {
    switch (radius) {
        case 'none': return '0px';
        case 'sm': return '4px';
        case 'md': return '8px';
        case 'lg': return '16px';
        case 'full': return '9999px';
        default: return '12px';
    }
}

/**
 * MerchantThemeProvider
 * Wraps storefront pages and injects CSS custom properties based on merchant branding
 */
export function MerchantThemeProvider({
    children,
    initialTheme,
    storefrontId,
}: MerchantThemeProviderProps) {
    const [theme, setThemeState] = useState<MerchantTheme>({
        ...defaultTheme,
        ...initialTheme,
    });
    const [isLoading, setIsLoading] = useState(!!storefrontId && !initialTheme);

    // Fetch theme from storefront if needed
    useEffect(() => {
        if (storefrontId && !initialTheme) {
            setIsLoading(true);
            const fetchTheme = async () => {
                try {
                    const { supabase } = await import('@/lib/supabaseClient');
                    const { data } = await supabase
                        .from('storefronts')
                        .select('branding')
                        .eq('id', storefrontId)
                        .single();

                    if (data?.branding) {
                        setThemeState(prev => ({
                            ...prev,
                            ...data.branding,
                        }));
                    }
                } catch (err) {
                    console.error('Failed to fetch theme:', err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTheme();
        }
    }, [storefrontId, initialTheme]);

    // Inject CSS variables whenever theme changes
    useEffect(() => {
        const root = document.documentElement;

        // Primary colors
        root.style.setProperty('--brand-primary', theme.primaryColor);
        root.style.setProperty('--brand-secondary', theme.secondaryColor);
        root.style.setProperty('--brand-accent', theme.accentColor);
        root.style.setProperty('--brand-background', theme.backgroundColor);
        root.style.setProperty('--brand-text', theme.textColor);

        // Typography
        root.style.setProperty('--brand-font', theme.fontFamily);

        // Border radius
        root.style.setProperty('--brand-radius', getBorderRadiusValue(theme.borderRadius));
        root.style.setProperty('--brand-radius-sm', getBorderRadiusValue(
            theme.borderRadius === 'full' ? 'lg' :
                theme.borderRadius === 'lg' ? 'md' :
                    theme.borderRadius === 'md' ? 'sm' : 'none'
        ));

        // Derived colors (lighter/darker variants)
        root.style.setProperty('--brand-primary-light', `${theme.primaryColor}20`);
        root.style.setProperty('--brand-primary-dark', theme.primaryColor);

        // Also set as Tailwind-compatible custom properties
        root.style.setProperty('--color-brand', theme.primaryColor);

        return () => {
            // Cleanup on unmount
            root.style.removeProperty('--brand-primary');
            root.style.removeProperty('--brand-secondary');
            root.style.removeProperty('--brand-accent');
            root.style.removeProperty('--brand-background');
            root.style.removeProperty('--brand-text');
            root.style.removeProperty('--brand-font');
            root.style.removeProperty('--brand-radius');
            root.style.removeProperty('--brand-radius-sm');
            root.style.removeProperty('--brand-primary-light');
            root.style.removeProperty('--brand-primary-dark');
            root.style.removeProperty('--color-brand');
        };
    }, [theme]);

    const setTheme = (updates: Partial<MerchantTheme>) => {
        setThemeState(prev => ({ ...prev, ...updates }));
    };

    return (
        <MerchantThemeContext.Provider value={{ theme, setTheme, isLoading }}>
            <div
                style={{
                    fontFamily: theme.fontFamily,
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                }}
                className="min-h-screen"
            >
                {children}
            </div>
        </MerchantThemeContext.Provider>
    );
}

/**
 * Hook to get themed class names
 */
export function useThemedClasses() {
    const { theme } = useMerchantTheme();

    return {
        primaryButton: `bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold rounded-[var(--brand-radius)]`,
        secondaryButton: `bg-[var(--brand-secondary)] hover:opacity-90 text-white font-bold rounded-[var(--brand-radius)]`,
        outlineButton: `border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] font-bold rounded-[var(--brand-radius)]`,
        card: `bg-white rounded-[var(--brand-radius)] border shadow-sm`,
        heading: `font-[var(--brand-font)] text-[var(--brand-text)]`,
        link: `text-[var(--brand-primary)] hover:underline`,
    };
}

export default MerchantThemeProvider;
