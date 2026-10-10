import { createContext, useContext, ReactNode, useState } from 'react';
import { en } from './en';
import { zhHK } from './zh-HK';
import type { Translations } from './types';

type Language = 'en' | 'zh-HK';

const translations: Record<'en' | 'zh-HK', Translations> = {
  en,
  'zh-HK': zhHK,
};

interface I18nContextType {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, defaultLanguage = 'en' }: { children: ReactNode; defaultLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize from localStorage or use default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('math-champions-language');
      if (saved === 'en' || saved === 'zh-HK') {
        return saved;
      }
    }
    return defaultLanguage;
  });

  // Save language preference when it changes
  const handleSetLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('math-champions-language', lang);
    }
    setLanguage(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Key not found, return the key itself
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ 
      t, 
      language, 
      setLanguage: handleSetLanguage
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export { translations };
export type { Translations, Language };
