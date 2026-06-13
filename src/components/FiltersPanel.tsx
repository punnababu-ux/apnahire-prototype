import { useState, useEffect } from 'react';

interface FiltersPanelProps {
  mode?: 'applied' | 'database';
  totalLeads?: number;
}

const DB_FILTER_CHIPS = ['Last 7 days', 'Shortlisted', 'Review pending', 'resume'];

export function FiltersPanel({ mode = 'applied', totalLeads = 4 }: FiltersPanelProps) {
  const [showCandidates, setShowCandidates] = useState(true);
  const [chips, setChips] = useState<Set<string>>(new Set(DB_FILTER_CHIPS));
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideExcel, setHideExcel] = useState(false);
  const [hideWhatsApp, setHideWhatsApp] = useState(false);
  const [hideExpanded, setHideExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(22 * 3600 + 12 * 60 + 8);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  function removeChip(chip: string) {
    setChips(prev => { const n = new Set(prev); n.delete(chip); return n; });
  }

  if (mode === 'database') {
    return (
      <div className="flex flex-col gap-3 w-[280px] flex-shrink-0 self-start">

        {/* ── Filters card ── */}
        <div className="bg-white rounded-xl border border-[#dfe1e6] overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setFiltersExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#172b4d" stroke="none">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span className="text-sm font-semibold text-[#172b4d]">Filters ({chips.size})</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" className={`transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {filtersExpanded && <>
          {/* Applied chips */}
          <div className="px-4 pt-3 pb-2 border-t border-[#dfe1e6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#172b4d]">{chips.size} filter applied</span>
              {chips.size > 0 && (
                <button onClick={() => setChips(new Set())} className="text-xs font-semibold text-[#1f8268] hover:underline">Reset</button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(chips).map(chip => (
                <span key={chip} className="flex items-center gap-1 bg-[#ebf3fe] border border-[#004ba9] text-[#004ba9] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {chip}
                  <button onClick={() => removeChip(chip)} className="ml-0.5 hover:opacity-70">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <button className="mt-2 text-xs font-semibold text-[#1f8268] hover:underline">See more</button>
          </div>

          {/* Hide candidates section */}
          <div className="border-t border-[#dfe1e6]">
            <button
              onClick={() => setHideExpanded(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <span className="text-xs font-semibold text-[#172b4d]">Hide candidates that are</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" className={`transition-transform ${hideExpanded ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {hideExpanded && (
              <div className="px-4 pb-3 flex flex-col gap-2">
                <CheckRow label="Already unlocked" checked={hideUnlocked} onChange={setHideUnlocked} />
                <CheckRow label="Already downloaded in excel" checked={hideExcel} onChange={setHideExcel} />
                <CheckRow label="Already invited by WhatsApp" checked={hideWhatsApp} onChange={setHideWhatsApp} />
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[11px] text-[#5e6c84]">by</span>
                  <select className="text-[11px] border border-[#dfe1e6] rounded-lg px-2 py-1 text-[#172b4d] bg-white focus:outline-none focus:border-[#1f8268]">
                    <option>me</option>
                    <option>anyone</option>
                  </select>
                  <span className="text-[11px] text-[#5e6c84]">in the last</span>
                  <select className="text-[11px] border border-[#dfe1e6] rounded-lg px-2 py-1 text-[#172b4d] bg-white focus:outline-none focus:border-[#1f8268]">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#dfe1e6] flex items-center justify-center py-2.5">
            <button className="text-xs font-semibold text-[#0074e8] hover:underline">See more</button>
          </div>
          </>}
        </div>

        {/* ── Live Leads card ── */}
        <div className="bg-white rounded-xl border border-[#dfe1e6] p-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-[#172b4d]">Live Leads</span>
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

  return (
    <aside className="w-[280px] bg-white rounded-xl border border-[#dfe1e6] flex-shrink-0 overflow-y-auto self-start">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#dfe1e6]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#172b4d" stroke="none">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span className="text-sm font-semibold text-[#172b4d]">Filters (0)</span>
      </div>
      <FilterSection
        title="Show candidates who"
        expanded={showCandidates}
        onToggle={() => setShowCandidates(v => !v)}
      >
        <CheckRow label="Matched (0)" info />
        <CheckRow label="Have resume attached (0)" />
        <CheckRow label="Tried contacting you (0)" />
      </FilterSection>
      <FilterSection title="WhatsApp Connect" expanded={false} onToggle={() => {}} />
      <FilterSection title="Call status marked by you" expanded={false} onToggle={() => {}} />
      <button className="w-full py-3 text-xs font-medium text-[#1f8268] text-center hover:bg-gray-50 transition-colors">
        See more
      </button>
    </aside>
  );
}

function FilterSection({
  title, expanded, onToggle, children,
}: {
  title: string; expanded: boolean; onToggle: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#dfe1e6]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-semibold text-[#172b4d]">{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {expanded && children && (
        <div className="px-4 pb-3 flex flex-col gap-1">{children}</div>
      )}
    </div>
  );
}

function CheckRow({
  label, info, checked, onChange,
}: {
  label: string; info?: boolean; checked?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer">
      <div
        onClick={() => onChange?.(!checked)}
        className={`w-4 h-4 border-2 rounded flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-[#1f8268] border-[#1f8268]' : 'border-[#dfe1e6]'}`}
      >
        {checked && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <span className="text-xs text-[#5e6c84]">{label}</span>
      {info && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
    </label>
  );
}
