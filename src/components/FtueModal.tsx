import { useState } from 'react';

interface FtueModalProps {
  onComplete: () => void;
  hasCredits: boolean;
}

const STEPS = [
  {
    accent: '#1a56db',
    accentLight: '#dbeafe',
    title: 'Introducing Live leads from apna database',
    body: "Find candidates from apna's database who are actively looking and match your job requirements.",
    preview: 'intro',
    cta: 'Next',
  },
  {
    accent: '#0d9488',
    accentLight: '#ccfbf1',
    title: 'Candidates more likely to respond',
    body: 'Live Leads have recently applied to similar jobs and match your key requirements.',
    preview: 'respond',
    cta: 'Next',
  },
  {
    accent: '#d97706',
    accentLight: '#fef3c7',
    title: 'Unlock with database credits',
    body: '',
    preview: 'unlock',
    cta: 'See all live leads',
  },
];

export function FtueModal({ onComplete, hasCredits }: FtueModalProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const body = step === 2
    ? (hasCredits
        ? 'Use your database credits to view phone numbers and contact Live Leads directly.'
        : 'Get database credits to unlock phone numbers and reach these candidates before others do.')
    : current.body;

  function handleNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onComplete();
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onComplete} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-[440px] shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onComplete}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Preview area */}
        <div
          className="h-[200px] flex items-center justify-center relative overflow-hidden"
          style={{ background: current.accent }}
        >
          <PreviewCard step={current.preview} accentLight={current.accentLight} accent={current.accent} />
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-8">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-2">{current.title}</h2>
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">{body}</p>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  background: i === step ? current.accent : '#e5e7eb',
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors ${step === 0 ? 'invisible' : ''}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: current.accent }}
            >
              {step === STEPS.length - 1 ? (hasCredits ? 'See all live leads' : 'View live leads') : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ step, accentLight, accent }: { step: string; accentLight: string; accent: string }) {
  if (step === 'intro') {
    return (
      <div className="w-[340px] bg-white rounded-xl shadow-lg overflow-hidden scale-90">
        <div className="h-6 bg-gray-800 rounded-t-xl flex items-center px-3 gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="w-16 h-1.5 rounded bg-white/30" />
        </div>
        <div className="p-3 flex gap-3">
          <div className="flex-1">
            <div className="text-[9px] font-semibold text-gray-500 mb-1.5">Pending actions</div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 rounded" style={{ background: accentLight }}>
                <div className="w-full h-full rounded" style={{ background: accent, opacity: 0.6 }} />
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded" />
              <div className="px-1.5 py-0.5 text-[7px] font-semibold rounded border border-gray-200">Select Plan</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100" />
              <div className="flex-1 h-1.5 bg-gray-100 rounded" />
              <div className="px-1.5 py-0.5 text-[7px] font-semibold rounded border border-gray-200">View</div>
            </div>
          </div>
          <div className="w-[90px]">
            <div className="text-[9px] font-semibold text-gray-500 mb-1.5">Quick actions</div>
            <div className="h-16 rounded-lg flex items-center justify-center" style={{ background: accent }}>
              <div className="text-[8px] text-white font-medium text-center px-2">Live leads from database</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'respond') {
    return (
      <div className="w-[340px] bg-white rounded-xl shadow-lg overflow-hidden scale-90">
        <div className="h-6 bg-gray-800 rounded-t-xl flex items-center px-3 gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="w-16 h-1.5 rounded bg-white/30" />
        </div>
        <div className="p-3">
          <div className="text-[9px] font-semibold text-gray-500 mb-2">Pending actions</div>
          <div className="flex flex-col gap-1.5">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full" style={{ background: i === 1 ? accentLight : '#fef3c7' }} />
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-100 rounded mb-1 w-3/4" />
                  <div className="h-1 bg-gray-50 rounded w-1/2" />
                </div>
                <div
                  className="px-2 py-1 text-[7px] font-semibold rounded text-white"
                  style={{ background: i === 1 ? accent : '#d97706' }}
                >
                  {i === 1 ? 'View leads' : 'View'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 rounded-lg" style={{ background: accentLight }}>
            <div className="text-[8px] font-semibold mb-1" style={{ color: accent }}>Live Leads matched</div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-white border-2 border-white" style={{ background: ['#a7f3d0', '#bfdbfe', '#fde68a'][i] }} />
              ))}
              <div className="text-[8px] text-gray-500 self-center ml-1">+12 more</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // unlock step
  return (
    <div className="w-[340px] bg-white rounded-xl shadow-lg overflow-hidden scale-90">
      <div className="h-6 bg-gray-800 rounded-t-xl flex items-center px-3 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        <div className="w-16 h-1.5 rounded bg-white/30" />
      </div>
      <div className="p-3">
        <div className="mb-2">
          <div className="text-[9px] font-semibold text-gray-700 mb-1">Job posting</div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex-1 h-1.5 bg-gray-200 rounded" />
            <span className="text-[7px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Under review</span>
            <div className="text-[7px] text-gray-400">0 To Review</div>
            <div className="text-[7px] text-gray-400">0 Total</div>
            <div className="px-1.5 py-0.5 text-[7px] font-semibold rounded border border-gray-200">View</div>
          </div>
        </div>
        <div>
          <div className="text-[9px] font-semibold text-gray-700 mb-1">Database</div>
          <div className="flex gap-3 text-[8px] text-gray-500 border-b border-gray-100 pb-1 mb-1">
            <span className="font-semibold" style={{ color: accent }}>Recent searches</span>
            <span>Saved searches</span>
            <span>Invites</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex-1 h-8 rounded-lg" style={{ background: accentLight }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
