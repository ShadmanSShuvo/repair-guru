
import React from 'react';

const ApplianceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M8 8v12h8v-12h-8z"></path>
        <path d="M10 14h4"></path>
        <path d="M11 4h2"></path>
        <path d="M12 2v2"></path>
        <path d="M6 5h12"></path>
    </svg>
);

export default ApplianceIcon;
