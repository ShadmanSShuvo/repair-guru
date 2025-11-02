
import React from 'react';

const PlumbingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M5 13.01v-2.01c0 -.273 .108 -.532 .308 -.722l4.692 -4.278h4"></path>
        <path d="M13 14h-2a2 2 0 0 0 -2 2v2a2 2 0 0 0 2 2h2"></path>
        <path d="M19 14h-5.5a2.5 2.5 0 0 0 -2.5 2.5v2.5a2.5 2.5 0 0 0 2.5 2.5h5.5"></path>
        <path d="M16.5 10.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"></path>
        <path d="M14 6v-2a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2"></path>
    </svg>
);

export default PlumbingIcon;
