'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import T, { Lang, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en' || stored === 'ta') {
      setLangState(stored);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || '';
      setLangState(browserLang.startsWith('ta') ? 'ta' : 'en');
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: TranslationKey): string => T[lang][key] ?? T['en'][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
