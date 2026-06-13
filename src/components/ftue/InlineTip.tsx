import { useEffect } from 'react';

interface InlineTipProps {
  creditsRemaining: number;
  onDismiss: () => void;
}

export function InlineTip({ creditsRemaining, onDismiss }: InlineTipProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 7000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="flex items-start gap-3 bg-[#172b4d] text-white rounded-xl px-4 py-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">These candidates are actively looking right now</p>
        <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
          {creditsRemaining > 0
            ? `You have ${creditsRemaining} credit${creditsRemaining === 1 ? '' : 's'} — unlock a profile to see their number and reach out directly.`
            : 'Unlock your first profile for free — see their phone number and contact them before someone else does.'}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-white flex-shrink-0 mt-0.5 p-0.5"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
