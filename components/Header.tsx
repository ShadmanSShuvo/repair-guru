
import React from 'react';
import ToolsIcon from './icons/ToolsIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
           <ToolsIcon className="w-8 h-8 text-sky-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Repair<span className="text-sky-500">Guru</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
