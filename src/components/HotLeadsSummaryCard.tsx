import { useEffect, useState } from 'react';

interface HotLeadsSummaryCardProps {
  totalLeads: number;
}

// The left-rail summary card for the standalone Hot Leads tab — same card we show in
// the Database tab's filter rail (FiltersPanel database mode), extracted so both surfaces
// share one source. No filters here: the Hot Leads tab is shown unfiltered by design.
export function HotLeadsSummaryCard({ totalLeads }: HotLeadsSummaryCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(22 * 3600 + 12 * 60 + 8);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="w-[280px] flex-shrink-0 self-start">
      <div className="bg-white rounded-xl border border-[#dfe1e6] p-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-[#172b4d]">Hot Leads</span>
            {totalLeads > 0 && <span className="text-[11px] font-semibold text-[#005c62] bg-[#e7f9f9] px-2 py-0.5 rounded-full">New</span>}
          </div>
          <p className="text-[11px] text-[#172b4d] leading-snug">
            <span className="text-[#005062] font-medium">Relevant</span>{' '}candidates who are more likely to respond
          </p>
        </div>

        {/* Feature 1 */}
        <div className="flex flex-col gap-2 pb-4 border-b border-[#dfe1e6]">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#172b4d" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>
              <path d="M9 15l2 2 4-4" stroke="#1f8268" strokeWidth="2"/>
            </svg>
          </div>
          <p className="text-[11px] font-semibold text-[#172b4d]">Actively looking for a job</p>
          <p className="text-[11px] text-[#42526e]">Recently applied to similar jobs</p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col gap-2 pb-4 border-b border-[#dfe1e6]">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-[11px] font-semibold text-[#172b4d]">Matching your job requirements</p>
          <p className="text-[11px] text-[#42526e]">Relevant experience as a Field Sales Executive</p>
        </div>

        {/* Countdown timer */}
        <div>
          <p className="text-[11px] font-semibold text-[#172b4d] mb-2">New Leads in:</p>
          <div className="flex items-center gap-1">
            {[[hh[0], hh[1]], [mm[0], mm[1]], [ss[0], ss[1]]].map(([a, b], i) => (
              <div key={i} className="flex items-center gap-0.5">
                {i > 0 && <span className="text-lg font-light text-[#c1c7d0] mx-0.5">:</span>}
                <div className="bg-[#f4f5f7] border border-[#dfe1e6] rounded px-1.5 py-0.5">
                  <span className="text-lg font-semibold text-[#42526e] leading-none">{a}</span>
                </div>
                <div className="bg-[#f4f5f7] border border-[#dfe1e6] rounded px-1.5 py-0.5">
                  <span className="text-lg font-semibold text-[#42526e] leading-none">{b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
