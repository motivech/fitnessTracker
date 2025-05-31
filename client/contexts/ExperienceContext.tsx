import React, { createContext, useContext, ReactNode } from 'react';
import { useExperience } from '@/hooks/useExperience';

interface ExperienceContextType {
  level: number;
  experience: number;
  totalXP: number;
  progressToNextLevel: number;
  loading: boolean;
  refreshExperience: () => Promise<void>;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export const useExperienceContext = () => {
  const context = useContext(ExperienceContext);
  if (context === undefined) {
    throw new Error('useExperienceContext must be used within an ExperienceProvider');
  }
  return context;
};

export const ExperienceProvider = ({ children }: { children: ReactNode }) => {
  const [expData, refreshExperience] = useExperience();
  
  const value = {
    ...expData,
    refreshExperience,
  };
  
  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}; 