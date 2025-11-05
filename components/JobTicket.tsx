import React from 'react';
import { JobAssignment } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import InfoIcon from './icons/InfoIcon';
import ToolsIcon from './icons/ToolsIcon';
import TechnicianIcon from './icons/TechnicianIcon';
import CostIcon from './icons/CostIcon';
import PhoneIcon from './icons/PhoneIcon';
import ClockIcon from './icons/ClockIcon';
import TruckIcon from './icons/TruckIcon';

interface JobTicketProps {
  assignment: JobAssignment;
  onStartOver: () => void;
}

const TicketSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-6">
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="ml-3 text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <div className="pl-8 text-slate-600 dark:text-slate-300">
            {children}
        </div>
    </div>
);


const JobTicket: React.FC<JobTicketProps> = ({ assignment, onStartOver }) => {
  const { diagnosis, assignedTechnician, estimatedCost, estimatedArrivalTimeMinutes } = assignment;
  
  const handleContact = () => {
    window.location.href = `tel:${assignedTechnician.contactNumber}`;
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.539 1.118l-3.365-2.446a1 1 0 00-1.175 0l-3.365 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">({rating.toFixed(1)})</span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Job Assignment</h2>
        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-700 rounded-full">Technician Assigned</span>
      </div>

      <TicketSection title="Assigned Technician" icon={<TechnicianIcon className="w-5 h-5 text-sky-500" />}>
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-lg">
                    {assignedTechnician.name.charAt(0)}
                </div>
            </div>
            <div className="flex-1">
                <p className="font-bold text-slate-700 dark:text-slate-200">{assignedTechnician.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{assignedTechnician.skillsets.join(', ')}</p>
                <StarRating rating={assignedTechnician.rating} />
            </div>
        </div>
         <div className="mt-4 space-y-2 pl-1 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <PhoneIcon className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                <span>{assignedTechnician.contactNumber}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <ClockIcon className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                <span>{assignedTechnician.availability}</span>
            </div>
        </div>
      </TicketSection>
      
      <TicketSection title="Estimated Arrival" icon={<TruckIcon className="w-5 h-5 text-sky-500" />}>
        <p>Your technician should arrive in approximately <strong>{estimatedArrivalTimeMinutes} minutes</strong>.</p>
      </TicketSection>

      <TicketSection title="Problem Summary" icon={<ClipboardIcon className="w-5 h-5 text-sky-500" />}>
        <p>{diagnosis.problemSummary}</p>
      </TicketSection>
      
      <TicketSection title="Likely Cause" icon={<InfoIcon className="w-5 h-5 text-sky-500" />}>
        <p>{diagnosis.likelyCause}</p>
      </TicketSection>

      <TicketSection title="Required Parts & Tools" icon={<ToolsIcon className="w-5 h-5 text-sky-500" />}>
        {diagnosis.requiredParts.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
                {diagnosis.requiredParts.map((part, index) => (
                <li key={index}>{part.name} <span className="text-slate-500 dark:text-slate-400 text-sm">(est. ৳{part.estimatedPrice.toFixed(2)})</span></li>
                ))}
            </ul>
        ) : (
            <p>No specific parts identified. A standard toolkit should be sufficient.</p>
        )}
      </TicketSection>

      <TicketSection title="Estimated Cost" icon={<CostIcon className="w-5 h-5 text-sky-500" />}>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span>Parts & Materials</span>
                <span className="font-medium">৳{estimatedCost.parts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span>Estimated Labor ({diagnosis.estimatedLaborHours}h @ ৳{assignedTechnician.hourlyRate}/hr)</span>
                <span className="font-medium">৳{estimatedCost.labor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-800 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                <span>Total Estimated Cost</span>
                <span>৳{estimatedCost.total.toFixed(2)}</span>
            </div>
        </div>
      </TicketSection>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
        <button
          onClick={handleContact}
          className="w-full sm:w-auto bg-sky-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          Contact Technician
        </button>
        <button
          onClick={onStartOver}
          className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          Create a New Job
        </button>
      </div>
    </div>
  );
};

export default JobTicket;