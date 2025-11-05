import React from 'react';

export interface Category {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Technician {
  id: number;
  name: string;
  skillsets: string[];
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  rating: number;
  hourlyRate: number;
  contactNumber: string;
  availability: string;
}

export interface Part {
  name: string;
  estimatedPrice: number;
}

export interface AiDiagnosis {
  problemSummary: string;
  likelyCause: string;
  requiredParts: Part[];
  estimatedLaborHours: number;
}

export interface JobAssignment {
  diagnosis: AiDiagnosis;
  assignedTechnician: Technician;
  estimatedCost: {
    parts: number;
    labor: number;
    total: number;
  };
  estimatedArrivalTimeMinutes: number;
}

export interface UserLocation {
  lat: number;
  lon: number;
  name?: string;
}