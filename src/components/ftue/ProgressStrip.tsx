interface ProgressStripProps {
  unlockedCount: number;
  onDismiss: () => void;
}

const STEPS = ['Job posted', 'Unlock a lead', 'Contact a candidate'];

export function ProgressStrip({ unlockedCount, onDismiss }: ProgressStripProps) {
  const doneCount = unlockedCount > 0 ? 2 : 1;

  return (
    <div className="bg-[#f8fffe] border-b border-[#d0f0ea] px-5 py-2.5 flex items-center gap-3">
      <div className="flex items-center flex-1 min-w-0">
        {STEPS.map((step, i) => {
          const done = i < doneCount;
          const active = i === doneCount;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'} min-w-0`}>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done
                    ? 'bg-[#1f8268]'
                    : active
                    ? 'border-2 border-[#1f8268] bg-white'
                    : 'border-2 border-gray-200 bg-white'
                }`}>
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-[#1f8268]" />
                  ) : null}
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  done ? 'text-gray-400 line-through' : active ? 'text-gray-800 font-semibold' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </div>
              {!isLast && (
                <div className={`h-px flex-1 mx-2 ${done ? 'bg-[#1f8268]' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onDismiss}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0 rounded"
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
