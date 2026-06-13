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

const MINI_CANDIDATES = [
  { initials: 'SS', color: '#fde68a', name: 'Simran S.', role: 'BDE', exp: '4 yr', loc: 'Mumbai' },
  { initials: 'RR', color: '#bfdbfe', name: 'Rohan R.', role: 'Sales Exec', exp: '2 yr', loc: 'Delhi' },
  { initials: 'SM', color: '#d9f99d', name: 'Suresh M.', role: 'Sr. BDE', exp: '6 yr', loc: 'Pune' },
];

function MiniCandidateCard({ initials, color, name, role, exp, loc, locked, accent }: {
  initials: string; color: string; name: string; role: string; exp: string; loc: string; locked?: boolean; accent?: string;
}) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 flex flex-col" style={{ minWidth: 90 }}>
      <div className="h-8 bg-[#EAF8F4] relative flex-shrink-0">
        <div
          className="absolute bottom-0 left-2 translate-y-1/2 w-7 h-7 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-gray-700"
          style={{ background: color }}
        >
          {initials}
        </div>
      </div>
      <div className="px-2 pt-4 pb-2 flex flex-col gap-1">
        <div className="text-[8px] font-semibold text-gray-800 truncate">{name}</div>
        <div className="text-[7px] text-gray-500 truncate">{role}</div>
        <div className="text-[7px] text-gray-400">{exp} · {loc}</div>
        {locked ? (
          <div className="mt-1 w-full py-1 text-center text-[7px] font-semibold border rounded-md" style={{ borderColor: accent ?? '#1f8268', color: accent ?? '#1f8268' }}>
            Unlock · 1 credit
          </div>
        ) : (
          <div className="mt-1 w-full py-1 text-center text-[7px] font-semibold rounded-md text-white" style={{ background: '#1f8268' }}>
            View Contact
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewCard({ step, accentLight, accent }: { step: string; accentLight: string; accent: string }) {
  if (step === 'intro') {
    return (
      <div className="flex flex-col items-center gap-2 scale-90">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span className="text-[9px] font-semibold text-white">9 live leads from apna database</span>
        </div>
        <div className="flex gap-2">
          {MINI_CANDIDATES.map(c => (
            <MiniCandidateCard key={c.initials} {...c} locked accent={accent} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'respond') {
    return (
      <div className="scale-90 flex flex-col items-center gap-2">
        <div className="bg-white rounded-xl shadow-md overflow-hidden w-[280px]">
          {/* Card header */}
          <div className="h-10 bg-[#EAF8F4] relative">
            <div className="absolute bottom-0 left-4 translate-y-1/2 w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-700" style={{ background: '#fde68a' }}>
              SS
            </div>
          </div>
          <div className="px-3 pt-6 pb-3">
            <div className="text-[10px] font-semibold text-gray-800">Simran Sharma</div>
            <div className="text-[8px] text-gray-500 mt-0.5">Business Dev. Executive · Mumbai</div>
            {/* Match tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {['Active this week', 'Applied to similar jobs', 'Matches salary'].map(tag => (
                <span key={tag} className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: accentLight, color: accent }}>
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // unlock step — before/after
  return (
    <div className="scale-90 flex items-center gap-3">
      {/* Locked card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-[120px]">
        <div className="h-9 bg-[#EAF8F4] relative">
          <div className="absolute bottom-0 left-3 translate-y-1/2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-700" style={{ background: '#bfdbfe' }}>
            RR
          </div>
        </div>
        <div className="px-2.5 pt-5 pb-2.5">
          <div className="text-[9px] font-semibold text-gray-800">Rohan Roy</div>
          <div className="text-[7px] text-gray-500 mt-0.5">Sales Exec · Delhi</div>
          <div className="mt-2 flex items-center gap-1 px-1.5 py-1 bg-gray-100 rounded-md">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z"/></svg>
            <span className="text-[8px] text-gray-400 blur-[2.5px] select-none">+91 98765</span>
          </div>
          <button className="mt-1.5 w-full py-1 text-[7px] font-semibold rounded-md border" style={{ borderColor: accent, color: accent }}>
            Unlock · 1 credit
          </button>
        </div>
      </div>

      {/* Arrow */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <polyline points="5 12 12 12 19 12"/><polyline points="13 6 19 12 13 18"/>
      </svg>

      {/* Unlocked card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-[120px]">
        <div className="h-9 bg-[#EAF8F4] relative">
          <div className="absolute bottom-0 left-3 translate-y-1/2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-700" style={{ background: '#bfdbfe' }}>
            RR
          </div>
        </div>
        <div className="px-2.5 pt-5 pb-2.5">
          <div className="text-[9px] font-semibold text-gray-800">Rohan Roy</div>
          <div className="text-[7px] text-gray-500 mt-0.5">Sales Exec · Delhi</div>
          <div className="mt-2 flex items-center gap-1 px-1.5 py-1 rounded-md" style={{ background: accentLight }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z"/></svg>
            <span className="text-[8px] font-semibold" style={{ color: accent }}>+91 98765 43210</span>
          </div>
          <button className="mt-1.5 w-full py-1 text-[7px] font-semibold rounded-md text-white" style={{ background: '#1f8268' }}>
            View Contact
          </button>
        </div>
      </div>
    </div>
  );
}
