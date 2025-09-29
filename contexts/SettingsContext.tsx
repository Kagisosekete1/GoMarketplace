import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

export type Theme = 'light' | 'dark';
export type Currency = 'Auto' | 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'NGN';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const formatCurrency = (price: number, currencyCode: Currency): string => {
    const effectiveCode = currencyCode === 'Auto' ? 'ZAR' : currencyCode;
    
    const options: Record<Exclude<Currency, 'Auto'>, Intl.NumberFormatOptions> = {
        'USD': { style: 'currency', currency: 'USD' },
        'EUR': { style: 'currency', currency: 'EUR' },
        'GBP': { style: 'currency', currency: 'GBP' },
        'ZAR': { style: 'currency', currency: 'ZAR' },
        'NGN': { style: 'currency', currency: 'NGN' },
    };

    const locales: Record<Exclude<Currency, 'Auto'>, string> = {
        'USD': 'en-US',
        'EUR': 'de-DE', // A common locale for Euro
        'GBP': 'en-GB',
        'ZAR': 'en-ZA',
        'NGN': 'en-NG',
    };

    try {
        return new Intl.NumberFormat(locales[effectiveCode], options[effectiveCode]).format(price);
    } catch (e) {
        console.error("Currency formatting failed:", e);
        // Fallback for older browsers or unexpected errors
        const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', ZAR: 'R', NGN: '₦' };
        return `${symbols[effectiveCode] || '$'}${price.toFixed(2)}`;
    }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default to dark theme to match original app design
    const [theme, setThemeState] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        return (storedTheme === 'light' || storedTheme === 'dark') ? storedTheme : 'dark';
    });
    
    const [currency, setCurrencyState] = useState<Currency>(() => {
        const storedCurrency = localStorage.getItem('currency');
        return (['Auto', 'USD', 'EUR', 'GBP', 'ZAR', 'NGN'].includes(storedCurrency as string)) ? storedCurrency as Currency : 'Auto';
    });

    const [notifications, setNotificationsState] = useState<boolean>(() => {
        const storedNotifications = localStorage.getItem('notifications');
        return storedNotifications === 'true';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => setThemeState(newTheme);
    
    const setCurrency = (newCurrency: Currency) => {
        localStorage.setItem('currency', newCurrency);
        setCurrencyState(newCurrency);
    };

    const setNotifications = (enabled: boolean) => {
        localStorage.setItem('notifications', String(enabled));
        setNotificationsState(enabled);
    };
    
    const value = useMemo(() => ({
        theme, setTheme, currency, setCurrency, notifications, setNotifications
    }), [theme, currency, notifications]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};