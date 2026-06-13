import { createContext, useContext } from 'react';

export const JobTabContext = createContext<{ goToDatabase: () => void } | null>(null);
export function useJobTab() { return useContext(JobTabContext); }
