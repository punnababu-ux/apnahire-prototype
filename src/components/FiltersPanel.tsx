import { useState, useEffect } from 'react';
import { DB_SKILL_FILTERS, type DbFilterValues } from './DatabaseTab';

interface FiltersPanelProps {
  mode?: 'applied' | 'database';
  totalLeads?: number;
  // Fired whenever the user touches any filter control (database mode) — lets the
  // parent collapse the pinned Live Leads box into the inline search view.
  onInteract?: () => void;
  // Fired with the current filter values so the parent can filter both feeds.
  onFiltersChange?: (v: DbFilterValues) => void;
  // Bumping this number resets the panel back to its default filters (e.g. after the
  // parent's "Show Live Leads" / clear-filters affordance).
  resetSignal?: number;
  // When Hot Leads live in their own tab, the DB filter rail must not show the Hot Leads
  // summary card (leads are removed from the Database entirely).
  hideLeadsCard?: boolean;
  scrolledBeyondLeads?: boolean;
  dbPinned?: boolean;
}

const DB_FILTER_CHIPS = DB_SKILL_FILTERS;

export function FiltersPanel({
  mode = 'applied',
  totalLeads = 4,
  onInteract,
  onFiltersChange,
  resetSignal,
  hideLeadsCard = false,
  scrolledBeyondLeads = false,
  dbPinned = true,
}: FiltersPanelProps) {
  const [showCandidates, setShowCandidates] = useState(true);
  const [chips, setChips] = useState<Set<string>>(new Set(DB_FILTER_CHIPS));
  const [hideUnlocked, setHideUnlocked] = useState(false);
  const [hideExcel, setHideExcel] = useState(false);
  const [hideWhatsApp, setHideWhatsApp] = useState(false);
  const [hideExpanded, setHideExpanded] = useState(false);
  // When Hot Leads live in their own tab, the Database tab's filters become the primary
  // content, so start them expanded. Default (leads-in-DB) keeps them collapsed.
  const [filtersExpanded, setFiltersExpanded] = useState(hideLeadsCard);
  const [secondsLeft, setSecondsLeft] = useState(22 * 3600 + 12 * 60 + 8);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parent asked us to restore defaults (clear filters / re-pin Live Leads)
  useEffect(() => {
    if (resetSignal === undefined) return;
    setChips(new Set(DB_FILTER_CHIPS));
    setHideUnlocked(false);
    setHideExcel(false);
    setHideWhatsApp(false);
    onFiltersChange?.({ skills: [...DB_FILTER_CHIPS], hideUnlocked: false, hideExcel: false, hideWhatsApp: false });
  }, [resetSignal]);

  // Synchronize expand/collapse state with scroll position and pinning state
  useEffect(() => {
    if (mode !== 'database') return;
    if (dbPinned) {
      setFiltersExpanded(scrolledBeyondLeads);
    } else {
      setFiltersExpanded(true);
    }
  }, [scrolledBeyondLeads, dbPinned, mode]);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  function removeChip(chip: string) {
    const next = new Set(chips); next.delete(chip);
    setChips(next);
    onInteract?.();
    onFiltersChange?.({ skills: Array.from(next), hideUnlocked, hideExcel, hideWhatsApp });
  }

  if (mode === 'database') {
    return (
      <div className="flex flex-col gap-3 w-[280px] flex-shrink-0 self-start sticky top-[190px]">

        {/* ── Filters card ── */}
        <div className="bg-white rounded-xl border border-[#dfe1e6] overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setFiltersExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-[16px] text-[#172b4d] select-none">filter_alt</span>
              <span className="text-sm font-semibold text-[#172b4d]">Filters ({chips.size})</span>
            </div>
            <span className={`material-icons-round text-[16px] text-[#5e6c84] transition-transform select-none ${filtersExpanded ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {filtersExpanded && <>
          {/* Applied chips */}
          <div className="px-4 pt-3 pb-2 border-t border-[#dfe1e6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#172b4d]">{chips.size} filter applied</span>
              {chips.size > 0 && (
                <button onClick={() => { setChips(new Set()); onInteract?.(); onFiltersChange?.({ skills: [], hideUnlocked, hideExcel, hideWhatsApp }); }} className="text-xs font-semibold text-[#1f8268] hover:underline">Reset</button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(chips).map(chip => (
                <span key={chip} className="flex items-center gap-1 bg-[#ebf3fe] border border-[#004ba9] text-[#004ba9] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {chip}
                  <button aria-label={`Remove ${chip} filter`} onClick={() => removeChip(chip)} className="ml-0.5 hover:opacity-70">
                    <span className="material-icons-round text-[12px] select-none">close</span>
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
              <span className={`material-icons-round text-[14px] text-[#5e6c84] transition-transform select-none ${hideExpanded ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {hideExpanded && (
              <div className="px-4 pb-3 flex flex-col gap-2">
                <CheckRow label="Already unlocked" checked={hideUnlocked} onChange={v => { setHideUnlocked(v); onInteract?.(); onFiltersChange?.({ skills: Array.from(chips), hideUnlocked: v, hideExcel, hideWhatsApp }); }} />
                <CheckRow label="Already downloaded in excel" checked={hideExcel} onChange={v => { setHideExcel(v); onInteract?.(); onFiltersChange?.({ skills: Array.from(chips), hideUnlocked, hideExcel: v, hideWhatsApp }); }} />
                <CheckRow label="Already invited by WhatsApp" checked={hideWhatsApp} onChange={v => { setHideWhatsApp(v); onInteract?.(); onFiltersChange?.({ skills: Array.from(chips), hideUnlocked, hideExcel, hideWhatsApp: v }); }} />
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[11px] text-[#5e6c84]">by</span>
                  <select onChange={() => onInteract?.()} className="text-[11px] border border-[#dfe1e6] rounded-lg px-2 py-1 text-[#172b4d] bg-white focus:outline-none focus:border-[#1f8268] focus-visible:ring-2 focus-visible:ring-[#186b55]">
                    <option>me</option>
                    <option>anyone</option>
                  </select>
                  <span className="text-[11px] text-[#5e6c84]">in the last</span>
                  <select onChange={() => onInteract?.()} className="text-[11px] border border-[#dfe1e6] rounded-lg px-2 py-1 text-[#172b4d] bg-white focus:outline-none focus:border-[#1f8268] focus-visible:ring-2 focus-visible:ring-[#186b55]">
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

        {/* ── Live Leads card — hidden when Hot Leads live in their own tab ── */}
        {!hideLeadsCard && (
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
                <span className="material-icons-round text-[28px] text-[#172b4d] select-none">assignment_turned_in</span>
              </div>
              <p className="text-[11px] font-semibold text-[#172b4d]">Actively looking for a job</p>
              <p className="text-[11px] text-[#42526e]">Recently applied to similar jobs</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-2 pb-4 border-b border-[#dfe1e6]">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-[16px] text-white select-none">check</span>
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
        )}
      </div>
    );
  }

  return (
    <aside className="w-[280px] bg-white rounded-xl border border-[#dfe1e6] flex-shrink-0 overflow-y-auto self-start">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#dfe1e6]">
        <span className="material-icons-round text-[16px] text-[#172b4d] select-none">filter_alt</span>
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
        <span
          className={`material-icons-round text-[14px] text-[#5e6c84] transition-transform select-none ${expanded ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
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
        {checked && <span className="material-icons-round text-[10px] text-white select-none">check</span>}
      </div>
      <span className="text-xs text-[#5e6c84]">{label}</span>
      {info && <span className="material-icons-round text-[12px] text-[#5e6c84] select-none">info</span>}
    </label>
  );
}
