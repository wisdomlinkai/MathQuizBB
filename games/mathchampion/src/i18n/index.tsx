import { createContext, useContext, ReactNode, useState } from 'react';
import { en } from './en';
import { zhHK } from './zh-HK';
import type { Translations } from './types';

type Language = 'en' | 'zh-HK' | 'both';

const translations: Record<'en' | 'zh-HK', Translations> = {
  en,
  'zh-HK': zhHK,
};

interface I18nContextType {
  t: (key: string) => string;
  tBoth: (keyEn: string, keyZh: string) => { en: string; zh: string };
  language: Language;
  setLanguage: (lang: Language) => void;
  showBoth: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, defaultLanguage = 'both' }: { children: ReactNode; defaultLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const t = (key: string): string => {
    const currentLang: 'en' | 'zh-HK' = language === 'both' ? 'en' : language;
    const keys = key.split('.');
    let value: any = translations[currentLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const tBoth = (keyEn: string, keyZh: string): { en: string; zh: string } => {
    return {
      en: getTranslation('en', keyEn),
      zh: getTranslation('zh-HK', keyZh),
    };
  };

  const getTranslation = (lang: 'en' | 'zh-HK', key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ 
      t, 
      tBoth, 
      language, 
      setLanguage,
      showBoth: language === 'both'
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
