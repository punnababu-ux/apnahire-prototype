import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type CreditsContextValue = {
  credits: number;
  setCredits: (n: number | ((c: number) => number)) => void;
  pulseKey: number;
  pulse: () => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const pulse = useCallback(() => setPulseKey(k => k + 1), []);

  return (
    <CreditsContext.Provider value={{ credits, setCredits, pulseKey, pulse }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error('useCredits must be inside CreditsProvider');
  return ctx;
}
