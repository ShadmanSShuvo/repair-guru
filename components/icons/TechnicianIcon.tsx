
import React from 'react';

const TechnicianIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l-3.5 -3.5v-3h3"></path>
        <path d="M15.5 14.5l-3.5 3.5v3h3l3.5 -3.5a6 6 0 0 0 -8 -8l-3.5 3.5h3v3l3.5 3.5"></path>
    </svg>
);

export default TechnicianIcon;
