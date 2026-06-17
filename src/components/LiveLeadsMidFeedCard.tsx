import { useJobTab } from '../context/JobTabContext';

const PREVIEW_AVATARS = [
  { initials: 'SS', color: '#a7f3d0' },
  { initials: 'BR', color: '#bfdbfe' },
  { initials: 'SM', color: '#fde68a' },
];

interface LiveLeadsMidFeedCardProps {
  totalLeads: number;
  hasCredits: boolean;
  onExplore?: () => void;
}

export function LiveLeadsMidFeedCard({ totalLeads, hasCredits, onExplore }: LiveLeadsMidFeedCardProps) {
  const jobTab = useJobTab();

  function handleExplore() {
    onExplore?.();
    jobTab?.goToDatabase();
  }

  return (
    <div data-ftue="leads-ingress" className="mb-3 rounded-xl border border-[#b6ecec] bg-[#eaf8f4]/40 px-4 py-3.5 flex items-center gap-4">
      {/* Icon */}
      <div className="w-9 h-9 rounded-full bg-[#1f8268] flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>

      {/* Text + avatars */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[#172b4d]">{totalLeads} Hot Leads matching this job</span>
          <div className="flex -space-x-1.5">
            {PREVIEW_AVATARS.map(a => (
              <div
                key={a.initials}
                className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-gray-700"
                style={{ background: a.color }}
              >
                {a.initials[0]}
              </div>
            ))}
            <div className="w-5 h-5 rounded-full border border-white bg-gray-100 flex items-center justify-center text-[9px] font-semibold text-gray-500">
              +{Math.max(totalLeads - 3, 0)}
            </div>
          </div>
        </div>
        <p className="text-xs text-[#42526e] mt-0.5">
          Actively looking · applied to similar roles recently · not in your applicant pool yet
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleExplore}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
          hasCredits
            ? 'bg-[#1f8268] hover:bg-[#186b55] text-white'
            : 'border border-[#1f8268] text-[#1f8268] hover:bg-[#eaf8f4]'
        }`}
      >
        Explore Hot Leads
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="5 12 12 12 19 12"/><polyline points="13 6 19 12 13 18"/>
        </svg>
      </button>
    </div>
  );
}
