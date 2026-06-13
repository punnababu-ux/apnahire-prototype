import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type CreditsContextValue = {
  credits: number;
  unlocked: Set<string>;
  isUnlocked: (name: string) => boolean;
  unlock: (name: string) => boolean;
  pulseKey: number;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(248);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [pulseKey, setPulseKey] = useState(0);

  const isUnlocked = useCallback((name: string) => unlocked.has(name), [unlocked]);

  const unlock = useCallback((name: string): boolean => {
    if (unlocked.has(name)) return true;
    if (credits <= 0) return false;
    setCredits(c => c - 1);
    setUnlocked(u => { const n = new Set(u); n.add(name); return n; });
    setPulseKey(k => k + 1);
    return true;
  }, [credits, unlocked]);

  return (
    <CreditsContext.Provider value={{ credits, unlocked, isUnlocked, unlock, pulseKey }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error('useCredits must be inside CreditsProvider');
  return ctx;
}

export function unmaskPhone(masked: string, seed: string): string {
  const base = seed.split('').reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 1000, 7);
  let i = 0;
  return masked.replace(/•/g, () => { const d = (base + i * 3 + 11) % 10; i++; return String(d); });
}
