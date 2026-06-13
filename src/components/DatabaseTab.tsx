import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCredits } from '../context/CreditsContext';

const SHIMMER_STYLE = `
@keyframes shimmer-sweep {
  0%   { transform: translateX(-200%); }
  100% { transform: translateX(400%); }
}
@keyframes highlight-pulse {
  0%   { opacity: 0.15; }
  50%  { opacity: 0.08; }
  100% { opacity: 0; }
}
.card-shimmer-sweep {
  animation: shimmer-sweep 1s ease-in-out 1 forwards;
}
.card-highlight-pulse {
  animation: highlight-pulse 1.8s ease-out forwards;
}
`;

interface Profile {
  id: string;
  name: string;
  initials: string;
  color: string;
  freshness: string;
  location: string;
  salary: string;
  tags: string[];
  title: string;
  prevTitle?: string;
  education: string;
  skills: string;
  keySkills: string;
  isActiveLead?: boolean;
  matchedKeywords?: string[];
}

const ACTIVE_LEADS: Profile[] = [
  {
    id: 'al0', name: 'Simran Sharma', initials: 'SS', color: '#a7f3d0',
    freshness: '4 Yrs', salary: '₹7L/yr', location: 'Mumbai',
    tags: ['Field Sales', 'Business Development', 'B2B Sales', 'Mumbai'],
    title: 'Business Development Executive · Reliance Industries · +2 more',
    prevTitle: 'Sales Executive · Bajaj Finserv · 2 Yrs',
    education: 'B.Com, University of Mumbai - 2019',
    skills: 'Lead Generation · Client Acquisition · CRM · Negotiation',
    keySkills: 'English (Good) · Hindi · Marathi',
    isActiveLead: true,
    matchedKeywords: ['Field Sales', 'Business Development', 'B2B Sales'],
  },
  {
    id: 'al1', name: 'Shankar Gopal', initials: 'SG', color: '#a7f3d0',
    freshness: 'Fresher', salary: '₹15–18k/m', location: 'Near Koramangala, Bangalore',
    tags: ['Graphic Design', 'Video Editing', 'eMarketing', 'Mumbai'],
    title: 'Video Editing Expert · Video Editing, Graphic Design · +2 more',
    prevTitle: 'Video Editor · Video Editing, Graphic Design · +2 more',
    education: 'B.Tech, Metallurgy, at Anna Institute of Technology, Mumbai - 2021',
    skills: 'UI/UX, Figma · Illustrator, Photoshop, Wireframing, Web development',
    keySkills: 'English (Good) · Hindi',
    isActiveLead: true,
    matchedKeywords: ['Video Editing', 'Graphic Design', 'Figma'],
  },
  {
    id: 'al2', name: 'Shankar Gopal', initials: 'SG', color: '#a7f3d0',
    freshness: 'Fresher', salary: '₹15–18k/m', location: 'Near Koramangala, Bangalore',
    tags: ['Graphic Design', 'Video Editing', 'eMarketing', 'Mumbai'],
    title: 'Video Editing Expert · Video Editing, Graphic Design · +2 more',
    prevTitle: 'Video Editor · Video Editing, Graphic Design · +2 more',
    education: 'B.Tech, Metallurgy, at Anna Institute of Technology, Mumbai - 2021',
    skills: 'UI/UX, Figma · Illustrator, Photoshop, Wireframing, Web development',
    keySkills: 'English (Good) · Hindi',
    isActiveLead: true,
    matchedKeywords: ['Video Editing', 'Graphic Design', 'Figma'],
  },
  {
    id: 'al3', name: 'Shankar Gopal', initials: 'SG', color: '#a7f3d0',
    freshness: 'Fresher', salary: '₹15–18k/m', location: 'Near Koramangala, Bangalore',
    tags: ['Graphic Design', 'Video Editing', 'eMarketing', 'Mumbai'],
    title: 'Video Editing Expert · Video Editing, Graphic Design · +2 more',
    prevTitle: 'Video Editor · Video Editing, Graphic Design · +2 more',
    education: 'B.Tech, Metallurgy, at Anna Institute of Technology, Mumbai - 2021',
    skills: 'UI/UX, Figma · Illustrator, Photoshop, Wireframing, Web development',
    keySkills: 'English (Good) · Hindi',
    isActiveLead: true,
    matchedKeywords: ['Video Editing', 'Graphic Design'],
  },
  {
    id: 'al4', name: 'Shankar Gopal', initials: 'SG', color: '#a7f3d0',
    freshness: 'Fresher', salary: '₹15–18k/m', location: 'Near Koramangala, Bangalore',
    tags: ['Graphic Design', 'Video Editing', 'eMarketing', 'Mumbai'],
    title: 'Video Editing Expert · Video Editing, Graphic Design · +2 more',
    prevTitle: 'Video Editor · Video Editing, Graphic Design · +2 more',
    education: 'B.Tech, Metallurgy, at Anna Institute of Technology, Mumbai - 2021',
    skills: 'UI/UX, Figma · Illustrator, Photoshop, Wireframing, Web development',
    keySkills: 'English (Good) · Hindi',
    isActiveLead: true,
    matchedKeywords: ['Graphic Design'],
  },
];

const DB_PROFILES: Profile[] = [
  {
    id: 'db1', name: 'Manish Lomesh Gutte', initials: 'MG', color: '#bfdbfe',
    freshness: '4 yr 9 m', salary: '₹8.1 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Verizon (US), Littlenet · 2021–2023',
    prevTitle: 'Business Development Executive at Data Wise-Visiontech Pvt. Ltd · 2019–2021',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Database management', 'Sales'],
  },
  {
    id: 'db2', name: 'Simran Sharma', initials: 'SS', color: '#fde68a',
    freshness: '4 yr 6 m', salary: '₹7.2 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Housing.com · 2020–2023',
    prevTitle: 'Business Development Executive at Trudge · 2019–2020',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Database management', 'Sales'],
  },
  {
    id: 'db3', name: 'Sukesh Bakhna', initials: 'SB', color: '#d8b4fe',
    freshness: '4 yr 9 m', salary: '₹5.2 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Verizon (US), Littlenet · 2021–2023',
    prevTitle: 'Business Development Executive at Data Wise-Visiontech Pvt. Ltd · 2019–2021',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Database management', 'Sales'],
  },
  {
    id: 'db4', name: 'Shreya Gupta', initials: 'SG', color: '#99f6e4',
    freshness: '2 yr 8 m', salary: '₹7.2 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Housing.com · 2020–2023',
    prevTitle: 'Business Development Executive at Trudge · 2019–2020',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Sales'],
  },
  {
    id: 'db5', name: 'Hitesh Kumar', initials: 'HK', color: '#fecdd3',
    freshness: '4 yr 5 m', salary: '₹6.1 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Verizon (US), Littlenet · 2021–2023',
    prevTitle: 'Business Development Executive at Data Wise-Visiontech Pvt. Ltd · 2019–2021',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Database management'],
  },
  {
    id: 'db6', name: 'Aasha Rastogi', initials: 'AR', color: '#a7f3d0',
    freshness: '3 yr 4 m', salary: '₹7.1 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Housing.com · 2020–2023',
    prevTitle: 'Business Development Executive at Trudge · 2019–2020',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Sales', 'Database management'],
  },
  {
    id: 'db7', name: 'Nilam Sengupta', initials: 'NS', color: '#bfdbfe',
    freshness: '4 yr 5 m', salary: '₹7.2 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Verizon (US), Littlenet · 2021–2023',
    prevTitle: 'Business Development Executive at Trudge · 2018–2019',
    education: 'BE/B.Tech (Shri Dinkarao Desai Patel College) · 2019',
    skills: 'Basics of Sales · FMCG/Retail Sales · After sales service · Database management',
    keySkills: 'Team management · Sales strategy · Convincing skills',
    matchedKeywords: ['Database management'],
  },
];


interface DatabaseTabProps {
  hasCredits: boolean;
  credits: number;
  totalLeads: number;
  dbTotal: number;
  highlightLeadId?: string | null;
  onHighlightClear?: () => void;
  // Shared unlock state from parent
  unlockedIds?: Set<string>;
  creditsRemaining?: number;
  onUnlock?: (id: string) => void;
  onFreeUnlock?: (id: string) => void;
  ftueVersion?: 'v1' | 'v2' | 'off';
}

export function DatabaseTab({ hasCredits, credits, totalLeads, dbTotal, highlightLeadId, onHighlightClear, unlockedIds, creditsRemaining, onUnlock, onFreeUnlock, ftueVersion }: DatabaseTabProps) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(credits);

  // Merge any externally-unlocked IDs (e.g. unlocked via ActiveLeadsTab) into local state
  useEffect(() => {
    if (!unlockedIds || unlockedIds.size === 0) return;
    setUnlocked(prev => {
      const next = new Set(prev);
      unlockedIds.forEach(id => next.add(id));
      return next;
    });
  }, [unlockedIds]);

  // Keep credit count in sync with parent
  useEffect(() => {
    if (creditsRemaining !== undefined) setRemaining(creditsRemaining);
  }, [creditsRemaining]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allLoaded, setAllLoaded] = useState(false);
  const [activePeriod, setActivePeriod] = useState('7d');
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const { unlock: globalUnlock } = useCredits();

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightActive, setHighlightActive] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightLeadId) return;
    // Pre-unlock and show phone for the highlighted lead
    setUnlocked(prev => new Set(prev).add(highlightLeadId));
    setViewing(prev => new Set(prev).add(highlightLeadId));
    setHighlightActive(highlightLeadId);
    // Scroll into view
    const el = cardRefs.current[highlightLeadId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Fade out highlight after 2.5s
    const t = setTimeout(() => {
      setHighlightActive(null);
      onHighlightClear?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [highlightLeadId]);

  function handleUnlock(id: string, isFree = false) {
    if (!isFree && remaining <= 0) return;
    if (unlocked.has(id)) {
      setViewing(prev => new Set(prev).add(id));
      return;
    }
    setUnlocked(prev => new Set(prev).add(id));
    setViewing(prev => new Set(prev).add(id));
    if (!isFree) {
      setRemaining(r => r - 1);
      globalUnlock(id);
      onUnlock?.(id);
    } else {
      onFreeUnlock?.(id);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const shownLeads = Array.from({ length: totalLeads }, (_, i) =>
    i < ACTIVE_LEADS.length
      ? ACTIVE_LEADS[i]
      : { ...ACTIVE_LEADS[i % ACTIVE_LEADS.length], id: `${ACTIVE_LEADS[i % ACTIVE_LEADS.length].id}_${i}` }
  );

  if (dbTotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/>
            <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
            <line x1="4" y1="4" x2="20" y2="20" stroke="#e74c3c" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-800 mb-2">No candidates in the database</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          The apna database doesn't have any matching candidates for this job yet. Try broadening your job title, location, or skill requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <style>{SHIMMER_STYLE}</style>

      {/* ── Filter toolbar ── */}
      <div className="flex items-center gap-3 mb-3">
        {/* Active period dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Active in</span>
          <div className="relative">
            <select
              value={activePeriod}
              onChange={e => setActivePeriod(e.target.value)}
              className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border border-[#dfe1e6] bg-white text-xs font-medium text-gray-700 hover:border-[#b3bac5] transition-colors cursor-pointer focus:outline-none focus:border-[#1f8268]"
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
            </select>
            <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <div className="flex-1" />

        {/* Selected count */}
        {selectedIds.size > 0 && (
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
            {selectedIds.size} selected
          </span>
        )}

        {/* Showing N per page */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Showing</span>
          <div className="relative">
            <select
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="appearance-none pl-2 pr-5 py-1 rounded-lg border border-[#dfe1e6] bg-white text-xs font-medium text-gray-700 hover:border-gray-400 transition-colors cursor-pointer focus:outline-none focus:border-[#1f8268]"
            >
              {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <span className="text-xs text-gray-500">of {dbTotal}</span>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#dfe1e6] text-[#5e6c84] hover:border-[#b3bac5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="text-xs text-gray-500 px-1">
            Page <span className="font-semibold text-gray-800">{currentPage}</span> of {Math.ceil(dbTotal / perPage)}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(dbTotal / perPage), p + 1))}
            disabled={currentPage === Math.ceil(dbTotal / perPage)}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#dfe1e6] text-[#5e6c84] hover:border-[#b3bac5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Multi-select action bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Checkbox + count */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded border-2 bg-[#1f8268] border-[#1f8268] flex items-center justify-center flex-shrink-0">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">{selectedIds.size} selected</span>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Excel
          </button>

          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-semibold rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L0 24l6.336-1.508A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.49-5.183-1.344l-.371-.22-3.762.896.952-3.665-.242-.378A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Send WhatsApp
          </button>

          {/* Deselect all */}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Live Leads section ── */}
      <div className="border border-[#b6ecec] rounded-xl bg-[#eaf8f4]/30 mb-3 overflow-hidden">
        {/* Container header */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${totalLeads > 0 ? 'bg-[#1f8268]' : 'bg-gray-300'}`} />
            <span className="text-sm font-semibold text-[#172b4d]">Live Leads ({totalLeads})</span>
            {totalLeads > 0 && <span className="text-xs font-medium text-[#005c62] bg-[#e7f9f9] px-2 py-0.5 rounded-full">New</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-4">
            {totalLeads > 0
              ? 'Relevant candidates actively looking for jobs, recently applied to similar roles'
              : 'Candidates from the database who are currently active on the app will appear here'}
          </p>
        </div>

        {totalLeads > 0 ? (
          /* Cards inside the green container */
          <div className="p-3 flex flex-col gap-2">
            {shownLeads.map(profile => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                isSelected={selectedIds.has(profile.id)}
                isUnlocked={unlocked.has(profile.id)}
                isViewing={viewing.has(profile.id)}
                hasCredits={hasCredits}
                remaining={remaining}
                onToggleSelect={() => toggleSelect(profile.id)}
                onUnlock={() => handleUnlock(profile.id, profile.id === 'al0')}
                isActiveLead
                isPreview={profile.id === 'al0'}
                isHighlighted={highlightActive === profile.id}
                cardRef={el => { cardRefs.current[profile.id] = el; }}
                ftueVersion={ftueVersion}
              />
            ))}
          </div>
        ) : (
          /* Pending state — no active leads yet */
          <div className="px-4 pb-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-[#b6ecec] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1f8268]">Live leads will appear here</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                We're watching {dbTotal} matching candidates in the database and will notify you as soon as any become active on the app.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── DB Profiles section header ── */}
      <div className="mb-2" />

      {DB_PROFILES.map(profile => (
        <ProfileRow
          key={profile.id}
          profile={profile}
          isSelected={selectedIds.has(profile.id)}
          isUnlocked={unlocked.has(profile.id)}
          isViewing={viewing.has(profile.id)}
          hasCredits={hasCredits}
          remaining={remaining}
          onToggleSelect={() => toggleSelect(profile.id)}
          onUnlock={() => handleUnlock(profile.id)}
          isActiveLead={false}
          ftueVersion={ftueVersion}
        />
      ))}

      <div className="text-center py-6">
        <button
          onClick={() => setAllLoaded(true)}
          disabled={allLoaded}
          className="px-5 py-2.5 bg-white border border-[#dfe1e6] rounded-xl text-xs font-semibold text-[#42526e] hover:border-[#b3bac5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {allLoaded ? 'All profiles loaded' : 'Load more profiles'}
        </button>
      </div>
    </div>
  );
}

interface ProfileRowProps {
  profile: Profile;
  isSelected: boolean;
  isUnlocked: boolean;
  isViewing?: boolean;
  hasCredits: boolean;
  remaining: number;
  onToggleSelect: () => void;
  onUnlock: () => void;
  isActiveLead: boolean;
  isPreview?: boolean;
  isHighlighted?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
  ftueVersion?: 'v1' | 'v2' | 'off';
}

function HighlightedText({ text }: { text: string; keywords?: string[] }) {
  return <span className="text-gray-700">{text}</span>;
}

function ProfileRow({ profile, isSelected, isUnlocked, isViewing, hasCredits, remaining, onToggleSelect, onUnlock, isActiveLead, isPreview, isHighlighted, cardRef, ftueVersion }: ProfileRowProps) {
  const v2Blur = ftueVersion === 'v2' && !isUnlocked;
  if (isActiveLead) {
    return (
      <div
        ref={cardRef}
        className={`relative rounded-xl border bg-white overflow-hidden hover:shadow-sm transition-all duration-700 ${
          isHighlighted ? 'border-[#1f8268] ring-2 ring-[#1f8268]/30' : 'border-gray-200'
        }`}
      >
        {/* Shimmer overlay — teal pulse + sweep on highlight */}
        {isHighlighted && (
          <>
            <div className="card-highlight-pulse absolute inset-0 bg-[#1f8268] pointer-events-none z-10 rounded-xl" />
            {/* Container is static + overflow-hidden; only the strip animates */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
              <div className="card-shimmer-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
            </div>
          </>
        )}
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-1">
            <div
              onClick={onToggleSelect}
              className={`w-4 h-4 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
                isSelected ? 'bg-[#1f8268] border-[#1f8268]' : 'border-[#dfe1e6] hover:border-[#b3bac5]'
              }`}
            >
              {isSelected && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold text-gray-700"
            style={{ background: profile.color }}
          >
            {profile.initials}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[16px] font-semibold text-[#172b4d]">{profile.name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2.5" className="flex-shrink-0">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              {isUnlocked && (
                <span className="ml-1 flex items-center gap-1 px-2 py-0.5 bg-[#e7f9f9] border border-[#b6ecec] text-[#00857c] text-[10px] font-semibold rounded-full">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  Unlocked
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                {profile.freshness}
              </span>
              <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {profile.location}
              </span>
            </div>
          </div>
        </div>

        {/* Matching box */}
        <div className="mx-4 mb-3 rounded-xl bg-[#e7f9f9] border border-[#b6ecec] px-3 py-2.5">
          <div className="flex flex-wrap gap-x-2 gap-y-1.5 items-center">
            <span className="text-xs font-semibold text-[#172b4d]">Matching:</span>
            {profile.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-white border border-[#dfe1e6] rounded-full px-2.5 py-0.5 text-xs text-[#172b4d]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#172b4d" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Detail rows */}
        <div className="px-4 pb-3 flex flex-col gap-3">
          <IconDetailRow icon="briefcase" label="Pref. Title">
            <HighlightedText text={profile.title} keywords={profile.matchedKeywords} />
          </IconDetailRow>
          {profile.prevTitle && (
            <IconDetailRow icon="briefcase" label="Pref. Roles">
              <span className="text-[#42526e]">{profile.prevTitle}</span>
            </IconDetailRow>
          )}
          <IconDetailRow icon="education" label="Education">
            <span className="text-[#42526e]">{profile.education}</span>
          </IconDetailRow>
          <IconDetailRow icon="location" label="Pref. Location">
            <span className="text-[#42526e]">{profile.location}</span>
          </IconDetailRow>
          <IconDetailRow icon="skills" label="Skills">
            <HighlightedText text={profile.skills} keywords={profile.matchedKeywords} />
          </IconDetailRow>
          <IconDetailRow icon="language" label="Languages">
            <span className="text-[#42526e]">{profile.keySkills}</span>
          </IconDetailRow>
        </div>

        {/* CTA section */}
        <div className="px-4 pb-4 flex flex-col gap-2 items-start">
          {isViewing ? (
            /* ── State 2: Actively viewing — phone revealed ── */
            <PhoneViewingCTA phone="+91 98765 43210" />
          ) : isUnlocked ? (
            /* ── State 3: Returning to unlocked — free re-view ── */
            <>
              <button
                onClick={onUnlock}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1f8268] text-[#1f8268] text-sm font-semibold rounded-xl hover:bg-[#eaf8f4] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6z"/>
                </svg>
                View Phone Number
              </button>
              <p className="text-[11px] text-[#5e6c84] flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                No credits will be used for viewing this profile
              </p>
            </>
          ) : isPreview ? (
            /* ── Preview free unlock ── */
            <button
              data-ftue="first-unlock-btn"
              onClick={onUnlock}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F8268] hover:bg-[#186b55] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </svg>
              Unlock for free · Preview
            </button>
          ) : hasCredits && remaining > 0 ? (
            /* ── State 1: Locked, has credits ── */
            <button
              onClick={onUnlock}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F8268] hover:bg-[#186b55] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6z"/>
              </svg>
              View Phone Number
            </button>
          ) : (
            /* ── State 1: Locked, no credits ── */
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Buy DB credits to unlock
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#dfe1e6]">
          <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            33 unlocks
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              CV attached
            </span>
            <span className="text-[#dfe1e6]">|</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e7f9f9] border border-[#b6ecec] text-[11px] text-[#00857c] font-medium">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Active on 15 Oct'21
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Expanded layout for regular DB profiles (same as active lead, no matching box, plain footer)
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-sm transition-all mb-2">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="flex-shrink-0 mt-1">
          <div
            onClick={onToggleSelect}
            className={`w-4 h-4 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
              isSelected ? 'bg-[#1f8268] border-[#1f8268]' : 'border-[#dfe1e6] hover:border-[#b3bac5]'
            }`}
          >
            {isSelected && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </div>

        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold text-gray-700"
          style={{ background: profile.color }}
        >
          {profile.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[16px] font-semibold text-[#172b4d]">{profile.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2.5" className="flex-shrink-0">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
              {profile.freshness}
            </span>
            <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {profile.location}
            </span>
            <span className="text-[14px] font-semibold text-[#5e6c84]">{profile.salary}</span>
          </div>
        </div>
      </div>

      {/* Matching box — gray for DB profiles, same chip style */}
      {profile.tags.length > 0 && (
        <div className="mx-4 mb-3 rounded-xl bg-[#f4f5f7] border border-[#dfe1e6] px-3 py-2.5">
          <div className="flex flex-wrap gap-x-2 gap-y-1.5 items-center">
            <span className="text-xs font-semibold text-[#172b4d]">Matching:</span>
            {profile.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-white border border-[#dfe1e6] rounded-full px-2.5 py-0.5 text-xs text-[#172b4d]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#172b4d" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detail rows */}
      <div className="px-4 pb-3 space-y-1.5">
        <IconDetailRow icon="briefcase" label="Pref. Title">
          <span className="text-[#42526e]">{profile.title}</span>
        </IconDetailRow>
        {profile.prevTitle && (
          <IconDetailRow icon="briefcase" label="Pref. Roles">
            <span className="text-[#42526e]">{profile.prevTitle}</span>
          </IconDetailRow>
        )}
        <IconDetailRow icon="education" label="Education">
          <span className="text-[#42526e]">{profile.education}</span>
        </IconDetailRow>
        <IconDetailRow icon="location" label="Pref. Location">
          <span className="text-[#42526e]">{profile.location}</span>
        </IconDetailRow>
        <IconDetailRow icon="skills" label="Skills">
          <span className="text-[#42526e]">{profile.skills}</span>
        </IconDetailRow>
        <IconDetailRow icon="language" label="Languages">
          <span className="text-[#42526e]">{profile.keySkills}</span>
        </IconDetailRow>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 flex flex-col gap-2 items-start">
        {isViewing ? (
          <PhoneViewingCTA phone="+91 98765 43210" />
        ) : isUnlocked ? (
          <>
            <button onClick={onUnlock} className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#1f8268] text-[#1f8268] text-sm font-semibold rounded-xl hover:bg-[#eaf8f4] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6z"/>
              </svg>
              View Phone Number
            </button>
            <p className="text-[11px] text-[#5e6c84] flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              No credits will be used for viewing this profile
            </p>
          </>
        ) : hasCredits && remaining > 0 ? (
          <button onClick={onUnlock} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F8268] hover:bg-[#186b55] text-white text-sm font-semibold rounded-xl transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6z"/>
            </svg>
            View Phone Number
          </button>
        ) : (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Buy DB credits to unlock
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#dfe1e6]">
        <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          33 unlocks
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            CV attached
          </span>
          <span className="text-[#dfe1e6]">|</span>
          <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Active on 15 Oct'21
          </span>
        </div>
      </div>
    </div>
  );
}

function PhoneViewingCTA({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Phone pill: [copy+number] | [QR] */}
        <div className="inline-flex items-center rounded-xl overflow-hidden border border-[#dfe1e6] bg-[#f4f5f7]">
          {/* Left: copy zone */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#eaf8f4] transition-colors"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2.5" className="flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" className="flex-shrink-0">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
            <span className={`text-sm font-semibold transition-colors ${copied ? 'text-[#1f8268]' : 'text-[#172b4d]'}`}>
              {copied ? 'Copied!' : phone}
            </span>
          </button>
          {/* Separator */}
          <div className="w-px h-8 bg-[#dfe1e6] flex-shrink-0" />
          {/* Right: QR zone */}
          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center justify-center px-3 py-2.5 hover:bg-[#eaf8f4] transition-colors"
            title="Show QR code to scan & call"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="16" y="16" width="2" height="2"/>
              <rect x="14" y="14" width="2" height="2"/>
              <rect x="20" y="14" width="2" height="2"/>
              <rect x="14" y="20" width="2" height="2"/>
              <rect x="18" y="20" width="2" height="2"/>
              <rect x="20" y="18" width="2" height="2"/>
            </svg>
          </button>
        </div>

        {/* WhatsApp */}
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#dfe1e6] text-[#172b4d] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" stroke="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.522 5.855L.072 23.928l6.219-1.432A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.802 9.802 0 0 1-5.006-1.373l-.357-.214-3.706.853.883-3.613-.235-.371A9.79 9.79 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
          </svg>
          WhatsApp
        </button>
      </div>

      {/* QR Modal */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-[#172b4d]">Scan to call</span>
              <button
                onClick={() => setQrOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white rounded-xl border border-[#dfe1e6]">
              <QRCodeSVG value={`tel:${phone.replace(/\s/g, '')}`} size={160} />
            </div>

            {/* Phone number */}
            <p className="text-base font-bold text-[#172b4d]">{phone}</p>

            {/* Instruction */}
            <p className="text-xs text-center text-[#5e6c84] leading-relaxed">
              Point your phone camera at this code — it will open your dialer with this number ready to call.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  briefcase: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  education: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  location:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  skills:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  language:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

function IconDetailRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex items-center gap-2 w-[136px] flex-shrink-0">
        <span className="flex-shrink-0 text-[#42526e]">{ICON_PATHS[icon]}</span>
        <span className="text-[14px] font-semibold text-[#42526e]">{label}</span>
      </div>
      <span className="text-[14px] text-[#172b4d] flex-1 min-w-0">{children}</span>
    </div>
  );
}
