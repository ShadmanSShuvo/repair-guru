
import React from 'react';
import { JobTicket as JobTicketType } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import InfoIcon from './icons/InfoIcon';
import ToolsIcon from './icons/ToolsIcon';

interface JobTicketProps {
  ticket: JobTicketType;
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


const JobTicket: React.FC<JobTicketProps> = ({ ticket, onStartOver }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Job Ticket</h2>
        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-700 rounded-full">Success</span>
      </div>

      <TicketSection title="Problem Summary" icon={<ClipboardIcon className="w-5 h-5 text-sky-500" />}>
        <p>{ticket.problemSummary}</p>
      </TicketSection>
      
      <TicketSection title="Likely Cause" icon={<InfoIcon className="w-5 h-5 text-sky-500" />}>
        <p>{ticket.likelyCause}</p>
      </TicketSection>

      <TicketSection title="Required Parts & Tools" icon={<ToolsIcon className="w-5 h-5 text-sky-500" />}>
        {ticket.requiredParts.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
                {ticket.requiredParts.map((part, index) => (
                <li key={index}>{part}</li>
                ))}
            </ul>
        ) : (
            <p>No specific parts identified. A standard toolkit should be sufficient.</p>
        )}
      </TicketSection>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <button
          onClick={onStartOver}
          className="bg-sky-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          Start a New Diagnosis
        </button>
      </div>
    </div>
  );
};

export default JobTicket;
