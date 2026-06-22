import { useState } from 'react';
import { CANDIDATES } from '../types';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';

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
  onHelpClick?: () => void;
}

const HOW_IT_WORKS = [
  {
    icon: (
      <span className="material-icons-round text-[16px] text-[#1f8268] select-none">search</span>
    ),
    title: 'We shortlist the best matches',
    body: 'Active candidates relevant to your job, filtered from 42,000+ profiles.',
  },
  {
    icon: (
      <span className="material-icons-round text-[16px] text-[#1f8268] select-none">lock</span>
    ),
    title: 'Unlock who you want to contact',
    body: '1 credit per candidate. Only pay for profiles you choose.',
  },
  {
    icon: (
      <span className="material-icons-round text-[16px] text-[#1f8268] select-none">phone</span>
    ),
    title: 'Reach out before someone else does',
    body: 'Hot Leads get hired fast. Contact them directly via call or WhatsApp.',
  },
];

export function ActiveLeadsTab({
  totalLeads,
  dbMatchCount,
  credits,
  onExploreAll,
  onGoToDatabase,
  onUnlockAndView,
  headerTitle,
  creditsRemaining,
  animateIn = false,
  onHelpClick,
}: ActiveLeadsTabProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const remaining = creditsRemaining ?? credits;  return (
    <div data-ftue="live-leads-section" className="bg-white rounded-xl border border-[#dfe1e6] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-1">
            {!headerTitle && (
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
            <span>
              While applications come in, unlock database{' '}
              <span className="relative inline-block pb-1 text-[#007a64] font-semibold">
                hot leads
                <svg className="absolute -bottom-1.5 left-0 w-full h-[8px] text-[#007a64]" viewBox="0 0 100 8" fill="none" preserveAspectRatio="none">
                  <path d="M1 5C20 8 40 2 60 5C80 8 95 3 99 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </p>
        </div>

        {/* Right side: Database Credits pill / segment */}
        {remaining > 0 ? (
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#eaf8f4] hover:bg-[#d8f3eb] border border-[#b6ecec] text-[#007a64] rounded-full text-xs font-semibold transition-all shadow-sm flex-shrink-0 self-end sm:self-start h-8"
          >
            <span className="material-icons-round text-amber-500 text-[18px] select-none flex-shrink-0">paid</span>
            <span>{remaining} Database Credits</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3.5 h-8 bg-[#fff1f0] border border-[#ffa39e] text-[#cf1322] rounded-full shadow-sm">
              <span className="material-icons-round text-amber-500 text-[18px] select-none flex-shrink-0">paid</span>
              <span>0 Database Credits</span>
            </div>
            <button
              onClick={() => setShowBuyModal(true)}
              className="px-4 h-8 bg-[#1f8268] hover:bg-[#186b55] text-white transition-colors rounded-full shadow-sm flex items-center justify-center"
            >
              Buy credits
            </button>
          </div>
        )}
      </div>

      {/* Candidate cards */}
      <div className="grid grid-cols-4 gap-[18px] px-5 pb-4">
        {CANDIDATES.slice(0, 3).map((c, idx) => {
          return (
            <div
              key={c.id}
              onClick={() => onUnlockAndView?.(c.id)}
              className={`flex flex-col border-[1.5px] border-[#dfe1e6] hover:border-[#1f8268] rounded-xl overflow-hidden bg-white hover:shadow-sm transition-all cursor-pointer ${animateIn ? `anim-lead-${idx}` : ''}`}
            >
              {/* Top Half */}
              <div className="bg-[#eaf8f4] p-[18px] border-b border-[#dfe1e6] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-sm border border-white"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 ${c.avatarColor === '#4a154b' ? 'text-white' : 'text-gray-700'}`}
                      style={{ background: c.avatarColor }}
                    >
                      {c.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[40px] flex items-center">{c.name}</p>
                  </div>
                </div>
                <span className="material-icons-round text-[18px] text-[#1f8268] flex-shrink-0 select-none">chevron_right</span>
              </div>

              {/* Bottom Half */}
              <div className="bg-white p-[18px] flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#172b4d] leading-snug line-clamp-2 min-h-[40px]">{c.role}</p>
                  <p className="text-xs text-[#5e6c84] truncate">{c.location}</p>
                  <p className="text-xs text-[#5e6c84] truncate mt-1">
                    {c.experience} • {c.salary}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* +more card — pivots to DB promo when all live leads are already shown */}
        {totalLeads > 3 ? (
          <div
            onClick={onExploreAll}
            className="flex flex-col border-[1.5px] border-[#dfe1e6] hover:border-[#1f8268] rounded-xl overflow-hidden bg-white hover:shadow-sm transition-all cursor-pointer"
          >
            {/* Top Half */}
            <div className="bg-[#eaf8f4] p-[18px] border-b border-[#dfe1e6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#fecdd3] flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm flex-shrink-0 z-0">
                    PN
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#d8b4fe] flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm flex-shrink-0 -ml-2 z-10">
                    AM
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm flex-shrink-0 -ml-2 z-20"
                  />
                </div>
                <span className="text-sm font-bold text-[#172b4d] min-h-[40px] flex items-center">+{totalLeads - 3} more</span>
              </div>
              <span className="material-icons-round text-[18px] text-[#1f8268] flex-shrink-0 select-none">chevron_right</span>
            </div>

            {/* Bottom Half */}
            <div className="bg-white p-[18px] flex-1 flex flex-col justify-between gap-6">
              <div className="text-sm font-semibold text-[#172b4d] leading-snug">
                Connect with candidates instantly
              </div>

              <button
                onClick={e => { e.stopPropagation(); onExploreAll?.(); }}
                className="text-[#1f8268] hover:text-[#186b55] text-sm font-semibold underline decoration-[1.5px] underline-offset-4 self-start mt-auto"
              >
                View all leads
              </button>
            </div>
          </div>
        ) : (dbMatchCount ?? 0) > 0 ? (
          <div
            onClick={onGoToDatabase}
            className={`flex flex-col border-[1.5px] border-[#dfe1e6] hover:border-[#1f8268] rounded-xl overflow-hidden bg-white hover:shadow-sm transition-all cursor-pointer ${animateIn ? 'anim-lead-3' : ''}`}
          >
            {/* Top Half */}
            <div className="bg-[#eaf8f4] p-[18px] border-b border-[#dfe1e6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#b2dfdb] flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm flex-shrink-0 z-0">
                    RK
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#c8e6c9] flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm flex-shrink-0 -ml-2 z-10">
                    AS
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm flex-shrink-0 -ml-2 z-20"
                  />
                  <div
                    style={{ marginLeft: -8, zIndex: 30 }}
                    className="w-8 h-8 rounded-full border-2 border-white bg-[#1f8268] flex items-center justify-center shadow-sm flex-shrink-0"
                  >
                    <span className="text-[9px] font-bold text-white leading-none">{(dbMatchCount ?? 300) >= 100 ? (dbMatchCount ?? 300) + '+' : dbMatchCount}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#172b4d] min-h-[40px] flex items-center">+{dbMatchCount?.toLocaleString()} more</span>
              </div>
              <span className="material-icons-round text-[18px] text-[#1f8268] flex-shrink-0 select-none">chevron_right</span>
            </div>

            {/* Bottom Half */}
            <div className="bg-white p-[18px] flex-1 flex flex-col justify-between gap-6">
              <div className="text-sm font-semibold text-[#172b4d] leading-snug">
                Connect with candidates instantly
              </div>

              <button
                onClick={e => { e.stopPropagation(); onGoToDatabase?.(); }}
                className="text-[#1f8268] hover:text-[#186b55] text-sm font-semibold underline decoration-[1.5px] underline-offset-4 self-start mt-auto"
              >
                Browse profiles
              </button>
            </div>
          </div>
        ) : null}
      </div>


      {/* Collasible Help drawer */}
      {howItWorksOpen && (
        <div className="mx-5 my-4 rounded-xl border border-[#dfe1e6] bg-[#f4f5f7] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#172b4d]">How Hot Leads and credits work</span>
            <button onClick={() => setHowItWorksOpen(false)} className="text-gray-400 hover:text-gray-600">
              <span className="material-icons-round text-[16px] text-gray-400 select-none">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#dfe1e6] pt-2">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex items-start gap-3 pt-2">
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
        </div>
      )}

      {/* Cleaned up footer */}
      <div className="px-5 py-4 border-t border-[#dfe1e6] flex items-center justify-between text-xs text-gray-500 bg-[#f8f9fa] mt-2">
        <div className="flex items-center gap-2">
          {/* Lock icon */}
          <span className="material-icons-round text-[16px] text-gray-400 select-none">lock</span>
          <span className="font-medium text-gray-600">1 Profile Unlock = 1 Database Credit</span>
        </div>
        <button
          onClick={onHelpClick ? onHelpClick : () => setHowItWorksOpen(v => !v)}
          className="flex items-center gap-1.5 text-[#0074e8] hover:text-[#005cb3] font-semibold"
        >
          {/* Blue circle with question mark */}
          <span className="material-icons-round text-[18px] text-[#0074e8] flex-shrink-0 select-none">help</span>
          <span>Help</span>
        </button>
      </div>

      {showBuyModal && <InsufficientCreditsModal onClose={() => setShowBuyModal(false)} />}
    </div>
  );
}
