import React, { useState, useMemo } from 'react';
import { JobAssignment } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import InfoIcon from './icons/InfoIcon';
import ToolsIcon from './icons/ToolsIcon';
import TechnicianIcon from './icons/TechnicianIcon';
import CostIcon from './icons/CostIcon';
import PhoneIcon from './icons/PhoneIcon';
import ClockIcon from './icons/ClockIcon';
import TruckIcon from './icons/TruckIcon';
import CalendarIcon from './icons/CalendarIcon';
import FeedbackIcon from './icons/FeedbackIcon';
import ThumbUpIcon from './icons/ThumbUpIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import ShareIcon from './icons/ShareIcon';
import { useLanguage } from '../context/LanguageContext';

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

const generateTimeSlots = (availability: string): Map<string, string[]> => {
    const slotsByDay = new Map<string, string[]>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayMap: { [key: string]: number } = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    
    let availableDays: number[] = [];
    let startHour = 0;
    let endHour = 24;

    const parts = availability.match(/([a-zA-Z]{3}(?:-[a-zA-Z]{3})?),\s*(\d{1,2})\s*(AM|PM)\s*-\s*(\d{1,2})\s*(AM|PM)/i);
    
    if (availability.toLowerCase().includes('24/7') || !parts) {
        availableDays = [0, 1, 2, 3, 4, 5, 6];
    } else {
        const [_, dayRange, start, startMeridiem, end, endMeridiem] = parts;
        const [startDayStr, endDayStr] = dayRange.split('-');
        const startDay = dayMap[startDayStr];
        const endDay = dayMap[endDayStr || startDayStr];
        
        if (startDay !== undefined && endDay !== undefined) {
             if (startDay <= endDay) {
                for(let i = startDay; i <= endDay; i++) availableDays.push(i);
            } else { // Wraps around the week e.g. Sat-Tue
                for(let i = startDay; i <= 6; i++) availableDays.push(i);
                for(let i = 0; i <= endDay; i++) availableDays.push(i);
            }
        }

        startHour = parseInt(start);
        if (startMeridiem.toUpperCase() === 'PM' && startHour !== 12) startHour += 12;
        if (startMeridiem.toUpperCase() === 'AM' && startHour === 12) startHour = 0;

        endHour = parseInt(end);
        if (endMeridiem.toUpperCase() === 'PM' && endHour !== 12) endHour += 12;
        if (endMeridiem.toUpperCase() === 'AM' && endHour === 12) endHour = 24;
    }
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay();

        if (availableDays.includes(dayOfWeek)) {
            const dateString = date.toISOString().split('T')[0];
            const daySlots: string[] = [];
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();

            for (let h = startHour; h < endHour; h++) {
                if (isToday && h <= now.getHours()) {
                    continue;
                }
                const time = new Date(date);
                time.setHours(h, 0, 0, 0);
                daySlots.push(time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
            }
            if (daySlots.length > 0) {
                slotsByDay.set(dateString, daySlots);
            }
        }
    }

    return slotsByDay;
};


const JobTicket: React.FC<JobTicketProps> = ({ assignment, onStartOver }) => {
  const { diagnosis, assignedTechnician, estimatedCost, estimatedArrivalTimeMinutes } = assignment;
  const { t, language } = useLanguage();
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';
  
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, time: string } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'helpful' | 'unhelpful' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(assignedTechnician.availability), [assignedTechnician.availability]);

  React.useEffect(() => {
    if (timeSlots.size > 0 && !selectedDay) {
        setSelectedDay(timeSlots.keys().next().value);
    }
  }, [timeSlots, selectedDay]);


  const handleContact = () => {
    window.location.href = `tel:${assignedTechnician.contactNumber}`;
  };
  
  const handleConfirm = () => {
    if (selectedSlot) {
        setIsConfirmed(true);
    }
  }
  
  const handleReschedule = () => {
    setIsConfirmed(false);
    setSelectedSlot(null);
  }

  const handleShare = async () => {
    const shareText = `${t('share_title')}:
${t('share_problem')}: ${diagnosis.problemSummary}
${t('share_technician')}: ${assignedTechnician.name}
${t('share_contact')}: ${assignedTechnician.contactNumber}
${t('share_cost')}: ৳${estimatedCost.total.toFixed(2)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share_title'),
          text: shareText,
        });
      } catch (error) {
        // Silently catch the error if the user cancels the share dialog.
        if (error instanceof DOMException && error.name === 'AbortError') {
          // User cancelled the share operation, which is not an error.
        } else {
            console.error('Error sharing:', error);
        }
      }
    }
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
  
  const translatedSkillsets = assignedTechnician.skillsets.map(skill => {
      try {
          return t(skill.toLowerCase());
      } catch (e) {
          return skill;
      }
  }).join(', ');

  const availableDays = Array.from(timeSlots.keys());
  
  const formatNumber = (num: number) => new Intl.NumberFormat(locale).format(num);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 animate-fade-in-up">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('job_assignment_title')}</h2>
        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-700 rounded-full">{t('technician_assigned_badge')}</span>
      </div>

      <TicketSection title={t('assigned_technician_title')} icon={<TechnicianIcon className="w-5 h-5 text-sky-500" />}>
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-lg">
                    {assignedTechnician.name.charAt(0)}
                </div>
            </div>
            <div className="flex-1">
                <p className="font-bold text-slate-700 dark:text-slate-200">{assignedTechnician.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{translatedSkillsets}</p>
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
      
      <TicketSection title={t('estimated_arrival_title')} icon={<TruckIcon className="w-5 h-5 text-sky-500" />}>
        <p dangerouslySetInnerHTML={{ __html: t('estimated_arrival_text', { minutes: `<strong>${formatNumber(estimatedArrivalTimeMinutes)}</strong>`}) }} />
      </TicketSection>
      
      <TicketSection title={t('schedule_service_title')} icon={<CalendarIcon className="w-5 h-5 text-sky-500" />}>
        {isConfirmed && selectedSlot ? (
             <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-md text-center">
                <p className="font-semibold">{t('appointment_confirmed')}</p>
                <p>
                    {new Date(selectedSlot.date).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(`${selectedSlot.date.toISOString().split('T')[0]}T${selectedSlot.time.replace(/(\d{1,2}):(\d{2})\s*(AM|PM)/i, (match, h, m, mer) => { let H = parseInt(h); if (mer.toUpperCase() === 'PM' && H !== 12) H += 12; if (mer.toUpperCase() === 'AM' && H === 12) H = 0; return `${String(H).padStart(2,'0')}:${m}`;})}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
                </p>
             </div>
        ) : (
            <div>
                <p className="text-sm mb-3">{t('schedule_service_subtitle')}</p>
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
                    {availableDays.map((day, index) => {
                        const date = new Date(day);
                        date.setUTCHours(12); // avoid timezone issues
                        const dayLabel = index === 0 ? t('today') : index === 1 ? t('tomorrow') : date.toLocaleDateString(locale, { weekday: 'short' });
                        return (
                            <button key={day} onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedDay === day ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                            >
                                {dayLabel} <span className="text-xs opacity-80">{date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</span>
                            </button>
                        )
                    })}
                </div>
                {selectedDay && timeSlots.get(selectedDay) && (
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.get(selectedDay)?.map(time => (
                            <button key={time} onClick={() => setSelectedSlot({ date: new Date(selectedDay), time })}
                                className={`p-2 rounded-md text-sm font-semibold transition-colors ${selectedSlot?.time === time && selectedSlot?.date.toISOString().split('T')[0] === selectedDay ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            >
                                {new Date(`1970-01-01T${time.replace(/(\d{1,2}):(\d{2})\s*(AM|PM)/i, (match, h, m, mer) => { let H = parseInt(h); if (mer.toUpperCase() === 'PM' && H !== 12) H += 12; if (mer.toUpperCase() === 'AM' && H === 12) H = 0; return `${String(H).padStart(2,'0')}:${m}`;})}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}
      </TicketSection>


      <TicketSection title={t('problem_summary_title')} icon={<ClipboardIcon className="w-5 h-5 text-sky-500" />}>
        <p>{diagnosis.problemSummary}</p>
      </TicketSection>
      
      <TicketSection title={t('likely_cause_title')} icon={<InfoIcon className="w-5 h-5 text-sky-500" />}>
        <p>{diagnosis.likelyCause}</p>
      </TicketSection>

      <TicketSection title={t('required_parts_title')} icon={<ToolsIcon className="w-5 h-5 text-sky-500" />}>
        {diagnosis.requiredParts.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
                {diagnosis.requiredParts.map((part, index) => (
                <li key={index}>{part.name} <span className="text-slate-500 dark:text-slate-400 text-sm">(est. ৳{formatNumber(part.estimatedPrice)})</span></li>
                ))}
            </ul>
        ) : (
            <p>{t('no_parts_needed')}</p>
        )}
      </TicketSection>

      <TicketSection title={t('estimated_cost_title')} icon={<CostIcon className="w-5 h-5 text-sky-500" />}>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span>{t('cost_parts_label')}</span>
                <span className="font-medium">৳{formatNumber(Number(estimatedCost.parts.toFixed(2)))}</span>
            </div>
            <div className="flex justify-between">
                <span>{t('cost_labor_label', { hours: formatNumber(diagnosis.estimatedLaborHours), rate: formatNumber(assignedTechnician.hourlyRate) })}</span>
                <span className="font-medium">৳{formatNumber(Number(estimatedCost.labor.toFixed(2)))}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-slate-800 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                <span>{t('cost_total_label')}</span>
                <span>৳{formatNumber(Number(estimatedCost.total.toFixed(2)))}</span>
            </div>
        </div>
      </TicketSection>

      <TicketSection title={t('feedback_title')} icon={<FeedbackIcon className="w-5 h-5 text-sky-500" />}>
        {!feedbackSubmitted ? (
            <div>
                <p className="mb-3 text-sm">{t('feedback_question')}</p>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { setFeedbackStatus('helpful'); setFeedbackSubmitted(true); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                        aria-label={t('feedback_yes_label')}
                    >
                        <ThumbUpIcon className="w-4 h-4" />
                        {t('yes')}
                    </button>
                    <button 
                        onClick={() => setFeedbackStatus('unhelpful')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                        aria-label={t('feedback_no_label')}
                    >
                        <ThumbDownIcon className="w-4 h-4" />
                        {t('no')}
                    </button>
                </div>
                {feedbackStatus === 'unhelpful' && (
                    <div className="mt-4">
                        <label htmlFor="feedback-text" className="sr-only">{t('feedback_details_label')}</label>
                        <textarea
                            id="feedback-text"
                            rows={3}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder={t('feedback_placeholder')}
                        />
                        <button 
                            onClick={() => setFeedbackSubmitted(true)}
                            className="mt-2 px-4 py-1.5 rounded-md text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                        >
                            {t('submit_feedback_btn')}
                        </button>
                    </div>
                )}
            </div>
        ) : (
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {t('feedback_thanks')}
            </p>
        )}
      </TicketSection>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
        {isConfirmed ? (
            <button
                onClick={handleReschedule}
                className="w-full sm:w-auto bg-sky-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
            >
                {t('reschedule_btn')}
            </button>
        ) : selectedSlot ? (
             <button
                onClick={handleConfirm}
                className="w-full sm:w-auto bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
             >
                {t('confirm_for_time_btn', { time: new Date(`1970-01-01T${selectedSlot.time.replace(/(\d{1,2}):(\d{2})\s*(AM|PM)/i, (match, h, m, mer) => { let H = parseInt(h); if (mer.toUpperCase() === 'PM' && H !== 12) H += 12; if (mer.toUpperCase() === 'AM' && H === 12) H = 0; return `${String(H).padStart(2,'0')}:${m}`;})}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' }) })}
            </button>
        ) : (
            <button
                onClick={handleContact}
                className="w-full sm:w-auto bg-sky-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
            >
                {t('contact_technician_btn')}
            </button>
        )}
        {navigator.share && (
            <button
                onClick={handleShare}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                >
                <ShareIcon className="w-4 h-4" />
                {t('share_ticket_btn')}
            </button>
        )}
        <button
          onClick={onStartOver}
          className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          {t('create_new_job_btn')}
        </button>
      </div>
    </div>
  );
};

export default JobTicket;