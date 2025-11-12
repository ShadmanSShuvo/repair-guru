import React from 'react';
import ToolsIcon from './icons/ToolsIcon';
import { useLanguage } from '../context/LanguageContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <ToolsIcon className="w-8 h-8 text-sky-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t('appTitle_1')}<span className="text-sky-500">{t('appTitle_2')}</span>
          </h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          {language === 'en' ? 'বাংলা' : 'EN'}
        </button>
      </div>
    </header>
  );
};

export default Header;