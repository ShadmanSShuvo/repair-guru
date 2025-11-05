
import React from 'react';
import { Category } from '../types';
import { SERVICE_CATEGORIES } from '../constants';
import SparklesIcon from './icons/SparklesIcon';


interface CategorySelectorProps {
  onCategorySelect: (category: Category) => void;
  onBack: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ onCategorySelect, onBack }) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="flex justify-center items-center gap-2 mb-4">
        <SparklesIcon className="w-6 h-6 text-sky-500" />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">What needs fixing?</h2>
      </div>
      <p className="mb-8 text-slate-600 dark:text-slate-300">
        Select a service category to begin the AI-powered diagnosis.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategorySelect(category)}
            className="group p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <category.icon className="w-12 h-12 mx-auto mb-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" />
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-1">{category.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
          </button>
        ))}
      </div>
       <div className="mt-8 text-center">
        <button onClick={onBack} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">&larr; Change Location</button>
      </div>
    </div>
  );
};

export default CategorySelector;
