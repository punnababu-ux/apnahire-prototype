import { createContext, useContext } from 'react';

export type JobAge = 'fresh' | 'active' | 'aging';

export const JobTabContext = createContext<{ goToDatabase: () => void; jobAge?: JobAge; newToHotLeads?: boolean } | null>(null);
export function useJobTab() { return useContext(JobTabContext); }
