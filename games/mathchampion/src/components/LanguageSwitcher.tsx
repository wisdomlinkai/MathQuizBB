import { Globe } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-HK' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 bg-white/60 hover:bg-white/80 rounded-xl px-3 py-2 transition-all active:scale-95 shadow-sm"
      title={language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
    >
      <Globe className="w-4 h-4 text-sky-600" />
      <span className="font-display font-bold text-sky-700 text-sm">
        {language === 'en' ? 'EN' : '繁'}
      </span>
    </button>
  );
}
