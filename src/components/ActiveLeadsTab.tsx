import { useState } from 'react';
import { CANDIDATES } from '../types';

interface ActiveLeadsTabProps {
  totalLeads: number;
  dbMatchCount?: number;
  hasCredits: boolean;
  credits: number;
  hasUsedDb?: boolean;
  unlockedCount?: number;
  lockedCount?: number;
  onCreditSpend?: (remaining: number) => void;
  showBuyCredits?: boolean;
  onExploreAll?: () => void;
  onGoToDatabase?: () => void;
  onUnlockAndView?: (candidateId: string) => void;
  headerTitle?: string;
  headerSubtitle?: string;
  // Controlled unlock state — lifted to parent so it survives tab switches
  unlockedIds?: Set<string>;
  creditsRemaining?: number;
  onUnlock?: (id: string) => void;
}

const HOW_IT_WORKS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    title: 'We shortlist the best matches',
    body: 'Active candidates relevant to your job, filtered from 42,000+ profiles.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Unlock who you want to contact',
    body: '1 DB credit per candidate. Only pay for profiles you choose.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z"/>
      </svg>
    ),
    title: 'Reach out before someone else does',
    body: 'Live leads get hired fast. Contact them directly via call or WhatsApp.',
  },
];

export function ActiveLeadsTab({
  totalLeads,
  dbMatchCount,
  hasCredits,
  credits,
  hasUsedDb = false,
  unlockedCount = 2,
  lockedCount = 13,
  onCreditSpend,
  onExploreAll,
  onGoToDatabase,
  onUnlockAndView,
  headerTitle,
  headerSubtitle,
  unlockedIds,
  creditsRemaining,
  onUnlock,
}: ActiveLeadsTabProps) {
  // Fall back to local state when not controlled by parent
  const [localUnlocked, setLocalUnlocked] = useState<Set<string>>(new Set());
  const [localRemaining, setLocalRemaining] = useState(credits);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const unlocked = unlockedIds ?? localUnlocked;
  const remaining = creditsRemaining ?? localRemaining;

  function handleUnlock(id: string) {
    if (remaining <= 0 || unlocked.has(id)) return;
    if (onUnlock) {
      onUnlock(id);
    } else {
      setLocalUnlocked(prev => new Set(prev).add(id));
      setLocalRemaining(r => r - 1);
    }
    onCreditSpend?.(remaining - 1);
  }

  return (
    <div data-ftue="live-leads-section" className="bg-white rounded-xl border border-[#dfe1e6] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-base font-semibold text-gray-900 mb-1">
          {headerTitle ?? `${totalLeads} live leads from apna database`}
        </p>
        <p className="text-sm text-gray-500">
          {headerSubtitle ?? 'Candidates actively looking for jobs, recently applied to similar roles, and matching your requirements.'}
        </p>
      </div>

      {/* How DB credits work — cold start only */}
      {!hasCredits && (
        <div className="mx-5 mb-4 rounded-xl border border-[#b6ecec] bg-[#eaf8f4]/40 overflow-hidden">
          <button
            onClick={() => setHowItWorksOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-xs font-semibold text-[#172b4d]">How live leads work</span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2"
              className={`transition-transform ${howItWorksOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {howItWorksOpen && (
            <div className="px-4 pb-4 flex flex-col gap-4 border-t border-[#b6ecec]">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 pt-3">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#b6ecec] flex items-center justify-center flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#172b4d]">{step.title}</p>
                    <p className="text-[11px] text-[#42526e] mt-0.5 leading-snug">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidate cards */}
      <div className="grid grid-cols-4 gap-3 px-5 pb-4">
        {CANDIDATES.slice(0, 3).map((c, idx) => {
          const isUnlocked = unlocked.has(c.id);
          const isPreview = !hasCredits && idx === 0;

          return (
            <div
              key={c.id}
              className={`rounded-xl overflow-hidden hover:shadow-sm transition-all cursor-pointer flex flex-col ${
                isPreview
                  ? 'border-2 border-[#1f8268]'
                  : 'border border-[#dfe1e6] hover:border-[#1f8268]'
              }`}
              onClick={() => {
                if (!hasCredits) { onUnlockAndView?.(c.id); return; }
                if (!isUnlocked) { handleUnlock(c.id); onUnlockAndView?.(c.id); }
              }}
            >
              {/* Teal banner with avatar */}
              <div className="relative h-14 bg-[#EAF8F4] flex-shrink-0">
                {isPreview && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-[#1f8268] text-white px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
                <div
                  className="absolute bottom-0 left-4 translate-y-1/2 w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold text-gray-700 shadow-sm"
                  style={{ background: c.avatarColor }}
                >
                  {c.initials}
                </div>
              </div>

              {/* Content */}
              <div className="px-3 pt-8 pb-3 flex flex-col flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{c.role}</p>
                <p className="text-[10px] text-gray-400 mt-1.5 truncate">
                  {c.experience} • {c.salary} • {c.location}
                </p>

                {/* Blurred contact hint — preview card only */}
                {isPreview && (
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 bg-[#f4f5f7] rounded-lg">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z"/>
                    </svg>
                    <span className="text-[10px] text-[#5e6c84] font-medium blur-[3px] select-none">+91 98•• •••••</span>
                  </div>
                )}

                <div className="flex-1" />

                {isUnlocked ? (
                  <button className="mt-2 w-full py-2 text-[10px] font-semibold bg-[#1f8268] text-white rounded-xl">
                    View Contact
                  </button>
                ) : hasCredits ? (
                  <button
                    {...(idx === 0 ? { 'data-ftue': 'first-lead-unlock-btn' } : {})}
                    onClick={e => { e.stopPropagation(); handleUnlock(c.id); onUnlockAndView?.(c.id); }}
                    className="mt-2 w-full py-2 text-[10px] font-semibold border border-[#1f8268] text-[#1f8268] rounded-xl hover:bg-[#eaf8f4] transition-colors"
                  >
                    Unlock · 1 credit
                  </button>
                ) : isPreview ? (
                  <button
                    data-ftue="first-lead-unlock-btn"
                    onClick={e => { e.stopPropagation(); onUnlockAndView?.(c.id); }}
                    className="mt-2 w-full py-2 text-[10px] font-semibold bg-[#1f8268] hover:bg-[#186b55] text-white rounded-xl transition-colors"
                  >
                    Unlock · 1 DB credit (Free)
                  </button>
                ) : (
                  <button className="mt-2 w-full py-2 text-[10px] font-semibold border border-[#dfe1e6] text-[#5e6c84] rounded-xl hover:bg-gray-50 transition-colors">
                    Buy DB credits to unlock
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* +more card — pivots to DB promo when all live leads are already shown */}
        {totalLeads > 3 ? (
          <div className="border border-[#b6ecec] rounded-xl overflow-hidden flex flex-col">
            <div className="relative h-14 bg-[#EAF8F4] flex-shrink-0">
              <div className="absolute bottom-0 left-4 translate-y-1/2 flex -space-x-2">
                {['#a7f3d0', '#bfdbfe', '#fde68a'].map((bg, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600 shadow-sm"
                    style={{ background: bg }}
                  >
                    {['S', 'R', 'A'][i]}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3 pt-9 pb-3 flex flex-col flex-1">
              <p className="text-sm font-bold text-gray-800">+ {totalLeads - 3} more</p>
              <p className="text-[11px] text-gray-500 leading-snug mt-1">Connect with candidates instantly</p>
              <div className="flex-1" />
              <button onClick={onExploreAll} className={`mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-xl transition-colors ${
                hasCredits
                  ? 'bg-[#1f8268] hover:bg-[#186b55] text-white'
                  : 'border border-[#1f8268] text-[#1f8268] hover:bg-[#eaf8f4]'
              }`}>
                Explore all live leads
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="5 12 12 12 19 12"/><polyline points="13 6 19 12 13 18"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (dbMatchCount ?? 0) > 0 ? (
          <div className="border border-[#dfe1e6] rounded-xl overflow-hidden hover:shadow-sm transition-all cursor-pointer flex flex-col" onClick={onGoToDatabase}>
            {/* Same teal banner as candidate cards */}
            <div className="relative h-14 bg-[#EAF8F4] flex-shrink-0">
              <div
                className="absolute bottom-0 left-4 translate-y-1/2 w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-sm bg-[#d1f5ec]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
                </svg>
              </div>
            </div>
            {/* Same content layout as candidate cards */}
            <div className="px-3 pt-8 pb-3 flex flex-col flex-1">
              <p className="text-xs font-semibold text-gray-900">{dbMatchCount?.toLocaleString()} more matches</p>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">Explore all candidates who fit your role</p>
              <div className="flex-1" />
              <button
                onClick={e => { e.stopPropagation(); onGoToDatabase?.(); }}
                className="mt-2 w-full py-2 text-[10px] font-semibold border border-[#1f8268] text-[#1f8268] rounded-xl hover:bg-[#eaf8f4] transition-colors"
              >
                Browse profiles
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <p className="text-xs text-gray-500">
          <span className="text-[#1f8268] font-medium">{totalLeads} live leads</span>
          {' '}shortlisted from{' '}
          <strong className="text-gray-800">{(dbMatchCount ?? 42321).toLocaleString()}</strong>
          {' '}matching database profiles
        </p>
      </div>

      {/* Has-credits nudge */}
      {hasCredits && (
        <div className="mx-4 mb-4 flex items-center justify-between gap-3 px-3 py-2.5 bg-[#eaf8f4] border border-[#b6ecec] rounded-xl">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" className="flex-shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p className="text-xs text-[#42526e]">
              <span className="font-semibold text-[#172b4d]">{remaining} DB credits ready.</span>{' '}Don't wait for applications — click any lead to unlock their profile.
            </p>
          </div>
        </div>
      )}

      {/* No-credits notice */}
      {!hasCredits && (
        hasUsedDb ? (
          /* Repurchase: red alert inside the card */
          <div className="mx-4 mb-4 flex items-center justify-between gap-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-xs text-red-800">
                <span className="font-semibold">0 credits remaining.</span>{' '}You've already unlocked {unlockedCount} profiles — {lockedCount} more matched candidates are locked.
              </p>
            </div>
            <button className="flex-shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors">
              Top up now
            </button>
          </div>
        ) : (
          /* Cold start: plain gray notice */
          <div className="mx-4 mb-4 flex items-center justify-between gap-3 px-3 py-2.5 bg-[#f4f5f7] border border-[#dfe1e6] rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" className="flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-xs text-[#42526e]">
                <span className="font-semibold text-[#172b4d]">0 DB credits.</span>{' '}Buy credits to unlock these leads and reach out first.
              </p>
            </div>
            <button className="flex-shrink-0 px-3 py-1.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-xs font-semibold rounded-xl transition-colors">
              Buy credits
            </button>
          </div>
        )
      )}
    </div>
  );
}
