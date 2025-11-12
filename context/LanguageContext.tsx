import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, bnResponse] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/bn.json')
        ]);
        if (!enResponse.ok || !bnResponse.ok) {
            throw new Error('Failed to fetch translation files');
        }
        const enData = await enResponse.json();
        const bnData = await bnResponse.json();
        setTranslations({ en: enData, bn: bnData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
        // Fallback to empty objects to prevent app crash
        setTranslations({ en: {}, bn: {} });
      }
    };

    fetchTranslations();
  }, []);

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    if (!translations) {
      return key; // Return key if translations are not loaded yet
    }
    let text = translations[language]?.[key] || key;
    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        const regex = new RegExp(`{${rKey}}`, 'g');
        text = text.replace(regex, String(replacements[rKey]));
      });
    }
    return text;
  }, [language, translations]);

  // Render children only after translations are loaded to prevent FOUC (Flash of Untranslated Content)
  if (!translations) {
    return null; 
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};