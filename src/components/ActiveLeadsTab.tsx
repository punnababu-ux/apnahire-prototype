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
  animateIn?: boolean;
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
    body: '1 credit per candidate. Only pay for profiles you choose.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z"/>
      </svg>
    ),
    title: 'Reach out before someone else does',
    body: 'Live Leads get hired fast. Contact them directly via call or WhatsApp.',
  },
];

export function ActiveLeadsTab({
  totalLeads,
  dbMatchCount,
  hasCredits,
  credits,
  hasUsedDb = false,
  onCreditSpend,
  onExploreAll,
  onGoToDatabase,
  onUnlockAndView,
  headerTitle,
  headerSubtitle,
  unlockedIds,
  creditsRemaining,
  onUnlock,
  animateIn = false,
}: ActiveLeadsTabProps) {
  // Fall back to local state when not controlled by parent
  const [localUnlocked, setLocalUnlocked] = useState<Set<string>>(new Set());
  const [localRemaining, setLocalRemaining] = useState(credits);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

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
        <p className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-1">
          {!headerTitle && (
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
          {headerTitle ?? `${totalLeads} Live Leads from apna database`}
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
              <span className="text-xs font-semibold text-[#172b4d]">How Live Leads and credits work</span>
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
              className={`rounded-xl overflow-hidden hover:shadow-sm transition-all flex flex-col ${animateIn ? `anim-lead-${idx}` : ''} ${
                isPreview
                  ? 'border-2 border-[#1f8268] cursor-pointer'
                  : 'border border-[#dfe1e6] hover:border-[#1f8268]'
              }`}
              onClick={isPreview ? () => onUnlockAndView?.(c.id) : undefined}
            >
              {/* Teal banner with avatar */}
              <div className="relative h-14 bg-[#eaf8f4] flex-shrink-0">
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
                  <button className="mt-2 w-full py-2 text-xs font-semibold bg-[#1f8268] text-white rounded-xl">
                    View number
                  </button>
                ) : isPreview ? (
                  <button
                    data-ftue="first-lead-unlock-btn"
                    onClick={e => { e.stopPropagation(); onUnlockAndView?.(c.id); }}
                    className="mt-2 w-full py-2 text-xs font-semibold bg-[#1f8268] hover:bg-[#186b55] text-white rounded-xl transition-colors"
                  >
                    Unlock for free · Preview
                  </button>
                ) : remaining > 0 ? (
                  <button
                    {...(idx === 0 ? { 'data-ftue': 'first-lead-unlock-btn' } : {})}
                    onClick={e => { e.stopPropagation(); handleUnlock(c.id); onUnlockAndView?.(c.id); }}
                    className="mt-2 w-full py-2 text-xs font-semibold border border-[#1f8268] text-[#1f8268] rounded-xl hover:bg-[#eaf8f4] transition-colors"
                  >
                    Unlock · 1 credit
                  </button>
                ) : (
                  <button onClick={e => { e.stopPropagation(); setShowBuyModal(true); }} className="mt-2 w-full py-2 text-xs font-semibold border border-[#dfe1e6] text-[#5e6c84] rounded-xl hover:bg-gray-50 transition-colors">
                    Buy credits to unlock
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* +more card — pivots to DB promo when all live leads are already shown */}
        {totalLeads > 3 ? (
          <div className="border border-[#b6ecec] rounded-xl overflow-hidden flex flex-col">
            <div className="relative h-14 bg-[#eaf8f4] flex-shrink-0">
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
              <p className="text-[11px] text-gray-500 leading-snug mt-1">See all matching candidates</p>
              <div className="flex-1" />
              <button onClick={onExploreAll} className={`mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                hasCredits
                  ? 'bg-[#1f8268] hover:bg-[#186b55] text-white'
                  : 'border border-[#1f8268] text-[#1f8268] hover:bg-[#eaf8f4]'
              }`}>
                See all Live Leads
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="5 12 12 12 19 12"/><polyline points="13 6 19 12 13 18"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (dbMatchCount ?? 0) > 0 ? (
          <div className={`border border-[#dfe1e6] rounded-xl overflow-hidden hover:shadow-sm transition-all cursor-pointer flex flex-col ${animateIn ? 'anim-lead-3' : ''}`} onClick={onGoToDatabase}>
            {/* Same teal banner as candidate cards */}
            <div className="relative h-14 bg-[#eaf8f4] flex-shrink-0">
              {/* Overlapping avatar stack */}
              <div className="absolute bottom-0 left-4 translate-y-1/2 flex items-center">
                {[
                  { bg: '#b2dfdb', initials: 'RK' },
                  { bg: '#c8e6c9', initials: 'AS' },
                  { bg: '#bbdefb', initials: 'PM' },
                ].map((av, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: av.bg, marginLeft: i === 0 ? 0 : -10, zIndex: i }}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shadow-sm flex-shrink-0"
                  >
                    <span className="text-[10px] font-bold text-[#1f8268]">{av.initials}</span>
                  </div>
                ))}
                <div
                  style={{ marginLeft: -10, zIndex: 3 }}
                  className="w-9 h-9 rounded-full border-2 border-white bg-[#1f8268] flex items-center justify-center shadow-sm flex-shrink-0"
                >
                  <span className="text-[9px] font-bold text-white leading-none">{(dbMatchCount ?? 300) >= 100 ? (dbMatchCount ?? 300) + '+' : dbMatchCount}</span>
                </div>
              </div>
            </div>
            {/* Same content layout as candidate cards */}
            <div className="px-3 pt-8 pb-3 flex flex-col flex-1">
              <p className="text-xs font-semibold text-gray-900">{dbMatchCount?.toLocaleString()} more matches</p>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">Explore all candidates who fit your role</p>
              <div className="flex-1" />
              <button
                onClick={e => { e.stopPropagation(); onGoToDatabase?.(); }}
                className="mt-2 w-full py-2 text-xs font-semibold border border-[#1f8268] text-[#1f8268] rounded-xl hover:bg-[#eaf8f4] transition-colors"
              >
                Browse profiles
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Merged footer + nudge bar — state follows the live credit balance */}
      <div className="mx-4 mb-4">
        {remaining > 0 ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#eaf8f4] border border-[#b6ecec] rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" className="flex-shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p className="text-xs text-[#42526e]">
                <span className="text-[#1f8268] font-semibold">{totalLeads} candidates shortlisted for you</span>
                {' · '}
                <span className="font-semibold text-[#172b4d]">{remaining} credits available</span>
                {' — click any to unlock & contact'}
              </p>
            </div>
          </div>
        ) : (hasCredits || hasUsedDb) ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#eaf8f4] border border-[#b6ecec] rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" className="flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-xs text-[#42526e]">
                <span className="font-semibold text-[#172b4d]">All credits used.</span>
                {' '}
                <span className="text-[#1f8268] font-semibold">{totalLeads} Live Leads still waiting</span>
                {' — top up to keep contacting.'}
              </p>
            </div>
            <button className="flex-shrink-0 px-3 py-1.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-xs font-semibold rounded-xl transition-colors">
              Top up credits
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#f4f5f7] border border-[#dfe1e6] rounded-xl">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" className="flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-xs text-[#42526e]">
                <span className="text-[#1f8268] font-semibold">{totalLeads} candidates shortlisted for you</span>
                {' · '}
                <span className="font-semibold text-[#172b4d]">buy credits to unlock & contact</span>
              </p>
            </div>
            <button onClick={() => setShowBuyModal(true)} className="flex-shrink-0 px-3 py-1.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-xs font-semibold rounded-xl transition-colors">
              Buy credits
            </button>
          </div>
        )}
      </div>

      {/* Insufficient Credits modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBuyModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            {/* Wallet illustration */}
            <div className="mb-6 relative">
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                {/* Wallet body */}
                <rect x="10" y="38" width="80" height="52" rx="8" fill="#b8d4f0"/>
                <rect x="10" y="38" width="80" height="14" rx="4" fill="#6fa8d6"/>
                {/* Coins */}
                <circle cx="42" cy="28" r="14" fill="#f5c842" stroke="#d4a017" strokeWidth="2"/>
                <circle cx="68" cy="20" r="14" fill="#f5c842" stroke="#d4a017" strokeWidth="2"/>
                <circle cx="55" cy="34" r="14" fill="#f5c842" stroke="#d4a017" strokeWidth="2"/>
                {/* Red X badge */}
                <circle cx="88" cy="24" r="14" fill="#e03131"/>
                <path d="M83 19l10 10M93 19l-10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#172b4d] mb-2">Insufficient Credits</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              You don't have credits to unlock the candidates profiles.<br />Buy more credits now.
            </p>

            <button
              onClick={() => setShowBuyModal(false)}
              className="w-full py-3.5 bg-[#1f8268] hover:bg-[#186b55] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Buy credits
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
