import { Globe } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const cycleLanguage = () => {
    const languages: Array<'en' | 'zh-HK' | 'both'> = ['en', 'zh-HK', 'both'];
    const currentIndex = languages.indexOf(language as any);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex] as any);
  };

  const getLabel = () => {
    switch (language) {
      case 'en':
        return 'EN';
      case 'zh-HK':
        return '繁';
      case 'both':
        return '雙';
      default:
        return '雙';
    }
  };

  return (
    <button
      onClick={cycleLanguage}
      className="flex items-center gap-1.5 bg-white/60 hover:bg-white/80 rounded-xl px-3 py-2 transition-all active:scale-95 shadow-sm"
      title={language === 'en' ? 'English' : language === 'zh-HK' ? '繁體中文' : '雙語 Bilingual'}
    >
      <Globe className="w-4 h-4 text-sky-600" />
      <span className="font-display font-bold text-sky-700 text-sm">
        {getLabel()}
      </span>
    </button>
  );
}
