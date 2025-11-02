
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"></path>
        <path d="M8 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"></path>
        <path d="M12 12l-2 -2"></path>
        <path d="M14 14l-2 2"></path>
        <path d="M12 12l2 2"></path>
        <path d="M12 12l-2 2"></path>
        <path d="M12 12l2 -2"></path>
    </svg>
);

export default SparklesIcon;
