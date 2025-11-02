
import React, { useState, useCallback } from 'react';
import { Category, JobTicket as JobTicketType } from './types';
import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import ChatInterface from './components/ChatInterface';
import JobTicket from './components/JobTicket';
import { generateJobTicket } from './services/geminiService';

type AppStep = 'CATEGORY_SELECTION' | 'PROBLEM_INPUT' | 'SHOWING_RESULT';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('CATEGORY_SELECTION');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [jobTicket, setJobTicket] = useState<JobTicketType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep('PROBLEM_INPUT');
  };

  const handleDiagnose = useCallback(async (description: string, image: { data: string; mimeType: string } | null) => {
    if (!selectedCategory) return;
    setIsLoading(true);
    setError(null);
    setJobTicket(null);

    try {
      const ticket = await generateJobTicket(selectedCategory.name, description, image);
      setJobTicket(ticket);
      setStep('SHOWING_RESULT');
    } catch (e) {
      console.error(e);
      setError('Failed to generate the job ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  const handleStartOver = () => {
    setStep('CATEGORY_SELECTION');
    setSelectedCategory(null);
    setJobTicket(null);
    setError(null);
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 'CATEGORY_SELECTION':
        return <CategorySelector onCategorySelect={handleCategorySelect} />;
      case 'PROBLEM_INPUT':
        return selectedCategory && <ChatInterface category={selectedCategory} onDiagnose={handleDiagnose} isLoading={isLoading} error={error} onBack={handleStartOver} />;
      case 'SHOWING_RESULT':
        return jobTicket && <JobTicket ticket={jobTicket} onStartOver={handleStartOver} />;
      default:
        return <CategorySelector onCategorySelect={handleCategorySelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </main>
       <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
        <p>Built by Team Overcaffeinated</p>
      </footer>
    </div>
  );
};

export default App;
