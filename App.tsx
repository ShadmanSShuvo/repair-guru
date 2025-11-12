import React, { useState, useCallback } from 'react';
import { Category, AiDiagnosis, JobAssignment, Technician, UserLocation } from './types';
import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import ChatInterface from './components/ChatInterface';
import JobTicket from './components/JobTicket';
import LocationInput from './components/LocationInput';
import { generateJobTicket } from './services/geminiService';
import { TECHNICIANS } from './data/technicians';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

type AppStep = 'LOCATION_INPUT' | 'CATEGORY_SELECTION' | 'PROBLEM_INPUT' | 'SHOWING_RESULT';

const MainApp: React.FC = () => {
  const [step, setStep] = useState<AppStep>('LOCATION_INPUT');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [jobAssignment, setJobAssignment] = useState<JobAssignment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const handleLocationSet = (location: UserLocation) => {
    setUserLocation(location);
    setStep('CATEGORY_SELECTION');
  };
  
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep('PROBLEM_INPUT');
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  const handleDiagnose = useCallback(async (description: string, image: { data: string; mimeType: string } | null) => {
    if (!selectedCategory || !userLocation) return;
    setIsLoading(true);
    setError(null);
    setJobAssignment(null);

    try {
      const diagnosis: AiDiagnosis = await generateJobTicket(selectedCategory.name, description, image, language);
      
      const suitableTechnicians = TECHNICIANS.filter(tech => tech.skillsets.includes(selectedCategory.name));

      if (suitableTechnicians.length === 0) {
        setError(t('error_no_technician', { category: t(selectedCategory.name.toLowerCase()) }));
        setIsLoading(false);
        return;
      }

      let bestTechnician: Technician | null = null;
      let minDistance = Infinity;

      suitableTechnicians.forEach(tech => {
        const distance = calculateDistance(userLocation.lat, userLocation.lon, tech.location.lat, tech.location.lon);
        if (distance < minDistance) {
          minDistance = distance;
          bestTechnician = tech;
        }
      });
      
      if (!bestTechnician) {
         // This should not happen if suitableTechnicians is not empty, but as a fallback
        bestTechnician = suitableTechnicians[0];
      }

      const partsCost = diagnosis.requiredParts.reduce((sum, part) => sum + part.estimatedPrice, 0);
      const laborCost = bestTechnician.hourlyRate * diagnosis.estimatedLaborHours;
      const totalCost = partsCost + laborCost;
      // 10 mins prep + travel time at 30km/h average speed
      const estimatedArrivalTimeMinutes = Math.round(10 + (minDistance / 30) * 60);

      const newJobAssignment: JobAssignment = {
        diagnosis,
        assignedTechnician: bestTechnician,
        estimatedCost: {
          parts: partsCost,
          labor: laborCost,
          total: totalCost,
        },
        estimatedArrivalTimeMinutes,
      };

      setJobAssignment(newJobAssignment);
      setStep('SHOWING_RESULT');
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        // Use the key from the thrown error, with a fallback
        setError(t(e.message) || t('error_api_generic'));
      } else {
        setError(t('error_api_generic'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, userLocation, language, t]);

  const handleStartOver = () => {
    setStep('LOCATION_INPUT');
    setSelectedCategory(null);
    setJobAssignment(null);
    setUserLocation(null);
    setError(null);
    setIsLoading(false);
  };
  
  const handleBack = () => {
    setError(null);
    if (step === 'SHOWING_RESULT') {
        setStep('PROBLEM_INPUT');
    } else if (step === 'PROBLEM_INPUT') {
        setStep('CATEGORY_SELECTION');
    } else if (step === 'CATEGORY_SELECTION') {
        setStep('LOCATION_INPUT');
    }
  };


  const renderStep = () => {
    switch (step) {
      case 'LOCATION_INPUT':
        return <LocationInput onLocationSet={handleLocationSet} />;
      case 'CATEGORY_SELECTION':
        return <CategorySelector onCategorySelect={handleCategorySelect} onBack={handleBack} />;
      case 'PROBLEM_INPUT':
        return selectedCategory && <ChatInterface category={selectedCategory} onDiagnose={handleDiagnose} isLoading={isLoading} error={error} onBack={handleBack} />;
      case 'SHOWING_RESULT':
        return jobAssignment && <JobTicket assignment={jobAssignment} onStartOver={handleStartOver} />;
      default:
        return <LocationInput onLocationSet={handleLocationSet} />;
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
        <p>{t('footer_built_by')}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <MainApp />
  </LanguageProvider>
);


export default App;