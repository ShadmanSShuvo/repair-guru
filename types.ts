
import React from 'react';

export interface Category {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface JobTicket {
  problemSummary: string;
  likelyCause: string;
  requiredParts: string[];
}
