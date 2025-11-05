import React, { useState } from 'react';
import { UserLocation } from '../types';
import UserLocationIcon from './icons/UserLocationIcon';

interface LocationInputProps {
  onLocationSet: (location: UserLocation) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationSet }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onLocationSet({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setLoading(false);
        setError('Unable to retrieve your location. Please grant permission or try again.');
      }
    );
  };
  
  // A mock function for manual input, as geocoding requires an API
  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // For this example, we'll use a fixed location for any manual entry.
      // A real app would use a geocoding service.
      onLocationSet({ lat: 23.8103, lon: 90.4125, name: 'Dhaka' });
  }

  return (
    <div className="text-center animate-fade-in">
       <div className="flex justify-center items-center gap-2 mb-4">
        <UserLocationIcon className="w-6 h-6 text-sky-500" />
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Where are you located?</h2>
      </div>
       <p className="mb-8 text-slate-600 dark:text-slate-300">
        We need your location to find the best technicians near you.
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <button
            onClick={handleGeoLocation}
            disabled={loading}
            className="w-full flex justify-center items-center gap-3 bg-sky-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
             {loading ? (
                <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Getting Location...</span>
                </>
            ) : (
                <>
                <UserLocationIcon className="w-5 h-5" />
                <span>Use My Current Location</span>
                </>
            )}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
        </div>
        <form onSubmit={handleManualSubmit}>
             <input
                type="text"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="Enter your City or Postal Code (e.g., Dhaka 1212)"
            />
            <button type="submit" className="mt-3 w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                Continue
            </button>
        </form>
      </div>
    </div>
  );
};

export default LocationInput;