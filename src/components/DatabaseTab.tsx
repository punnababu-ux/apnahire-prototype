import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';

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
  // Used by the filter pipeline (skill chips = OR match on filterTags; period = recency)
  filterTags: string[];
  lastActiveDays: number;
}

// Skill facets shown as chips in the sidebar — OR-combined across both feeds.
export const DB_SKILL_FILTERS = ['Field Sales', 'B2B Sales', 'Business Development', 'Lead Generation'];

// "Active in" dropdown value → max age in days
const PERIOD_DAYS: Record<string, number> = { '7d': 7, '14d': 14, '30d': 30, '3m': 90, '6m': 180 };

export interface DbFilterValues {
  skills: string[];
  hideUnlocked: boolean;
  hideExcel: boolean;
  hideWhatsApp: boolean;
}

function freshnessLabel(days: number): string {
  if (days <= 7) return 'Active this week';
  if (days <= 31) return 'Active this month';
  return 'Active recently';
}



// Deterministically weave Live Leads in between DB profiles (for the unpinned list).
// No randomness — stable across re-renders. Starts with a DB profile so leads land
// "in between" rather than clustered at the top.
function interleaveLeads(leads: Profile[], dbs: Profile[]): { profile: Profile; live: boolean }[] {
  if (leads.length === 0) return dbs.map(p => ({ profile: p, live: false }));
  if (dbs.length === 0) return leads.map(p => ({ profile: p, live: true }));
  const out: { profile: Profile; live: boolean }[] = [];
  const step = Math.max(1, Math.round(dbs.length / leads.length));
  let li = 0;
  for (let i = 0; i < dbs.length; i++) {
    out.push({ profile: dbs[i], live: false });
    if ((i + 1) % step === 0 && li < leads.length) out.push({ profile: leads[li++], live: true });
  }
  while (li < leads.length) out.push({ profile: leads[li++], live: true });
  return out;
}

const ACTIVE_LEADS: Profile[] = [
  {
    id: 'al0', name: 'Simran Sharma', initials: 'SS', color: '#a7f3d0',
    freshness: '4 Yrs', salary: '₹7L/yr', location: 'Mumbai',
    tags: ['Field Sales', 'Business Development', 'B2B Sales'],
    title: 'Business Development Executive · Reliance Industries · +2 more',
    prevTitle: 'Sales Executive · Bajaj Finserv · 2 Yrs',
    education: 'B.Com, University of Mumbai - 2019',
    skills: 'Lead Generation · Client Acquisition · CRM · Negotiation',
    keySkills: 'English (Good) · Hindi · Marathi',
    isActiveLead: true,
    matchedKeywords: ['Field Sales', 'Business Development', 'B2B Sales'],
    filterTags: ['Field Sales', 'Business Development', 'B2B Sales'], lastActiveDays: 1,
  },
  {
    id: 'al1', name: 'Rohan Roy', initials: 'RR', color: '#bfdbfe',
    freshness: '4 Yrs', salary: '₹7L/yr', location: 'Mumbai',
    tags: ['Field Sales', 'B2B Sales', 'Telecalling'],
    title: 'Field Sales Executive · Game-berry · +1 more',
    prevTitle: 'Sales Executive · Policybazaar · 2 Yrs',
    education: 'BBA, Marketing, University of Mumbai - 2020',
    skills: 'Field Sales · Cold Calling · Client Acquisition · CRM',
    keySkills: 'English (Good) · Hindi',
    isActiveLead: true,
    matchedKeywords: ['Field Sales', 'B2B Sales', 'Telecalling'],
    filterTags: ['Field Sales', 'B2B Sales'], lastActiveDays: 2,
  },
  {
    id: 'al2', name: 'Siddharth M.', initials: 'SM', color: '#fde68a',
    freshness: '4 Yrs', salary: '₹7L/yr', location: 'Mumbai',
    tags: ['B2B Sales', 'Account Management', 'Negotiation'],
    title: 'Sales Executive · Reliance SMSL Ltd · +1 more',
    prevTitle: 'Field Executive · HDFC Life · 2 Yrs',
    education: 'B.Com, University of Mumbai - 2019',
    skills: 'Account Management · Negotiation · Lead Generation · CRM',
    keySkills: 'English (Good) · Hindi · Marathi',
    isActiveLead: true,
    matchedKeywords: ['B2B Sales', 'Account Management', 'Negotiation'],
    filterTags: ['B2B Sales', 'Business Development'], lastActiveDays: 3,
  },
  {
    id: 'al3', name: 'Priya Nair', initials: 'PN', color: '#fecdd3',
    freshness: '5 Yrs', salary: '₹9L/yr', location: 'Pune',
    tags: ['Field Sales', 'Team Lead', 'Channel Sales'],
    title: 'Sales Manager · Bajaj Finserv · +1 more',
    prevTitle: 'Field Sales Executive · ICICI Bank · 2 Yrs',
    education: 'MBA, Sales & Marketing, Symbiosis - 2018',
    skills: 'Channel Sales · Team Leadership · B2B Sales · Negotiation',
    keySkills: 'English (Good) · Hindi · Marathi',
    isActiveLead: true,
    matchedKeywords: ['Field Sales', 'Channel Sales'],
    filterTags: ['Field Sales'], lastActiveDays: 5,
  },
  {
    id: 'al4', name: 'Arjun Mehta', initials: 'AM', color: '#d8b4fe',
    freshness: '3 Yrs', salary: '₹6L/yr', location: 'Delhi',
    tags: ['Field Sales', 'Insurance Sales', 'Lead Generation'],
    title: 'Field Executive · HDFC Life · +1 more',
    prevTitle: 'Sales Trainee · Max Life · 1 Yr',
    education: 'B.A., Delhi University - 2021',
    skills: 'Field Sales · Lead Generation · Customer Service · Telecalling',
    keySkills: 'English (Good) · Hindi · Punjabi',
    isActiveLead: true,
    matchedKeywords: ['Field Sales', 'Lead Generation'],
    filterTags: ['Field Sales', 'Lead Generation'], lastActiveDays: 6,
  },
];

const DB_PROFILES: Profile[] = [
  {
    id: 'db1', name: 'Manish Lomesh Gutte', initials: 'MG', color: '#bfdbfe',
    filterTags: ['Business Development'], lastActiveDays: 4,
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
    id: 'db2', name: 'Pooja Verma', initials: 'PV', color: '#fde68a',
    filterTags: ['Business Development', 'Lead Generation'], lastActiveDays: 6,
    freshness: '4 yr 6 m', salary: '₹7.2 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Housing.com · 2020–2023',
    prevTitle: 'Sales Executive at Trudge · 2019–2020',
    education: 'B.Com (University of Mumbai) · 2019',
    skills: 'Inside Sales · Lead Generation · CRM · Client Servicing',
    keySkills: 'Relationship management · Cold calling · Negotiation',
    matchedKeywords: ['Sales', 'Lead Generation'],
  },
  {
    id: 'db3', name: 'Sukesh Bakhna', initials: 'SB', color: '#d8b4fe',
    filterTags: ['Business Development'], lastActiveDays: 3,
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
    filterTags: ['Field Sales', 'Business Development'], lastActiveDays: 7,
    freshness: '2 yr 8 m', salary: '₹7.2 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Housing.com · 2020–2023',
    prevTitle: 'Sales Associate at Trudge · 2019–2020',
    education: 'BBA (Symbiosis, Pune) · 2019',
    skills: 'Inside Sales · Field Sales · Customer Service · MS Excel',
    keySkills: 'Client servicing · Negotiation · Telecalling',
    matchedKeywords: ['Sales'],
  },
  {
    id: 'db5', name: 'Hitesh Kumar', initials: 'HK', color: '#fecdd3',
    filterTags: ['Business Development'], lastActiveDays: 20,
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
    filterTags: ['Field Sales', 'B2B Sales', 'Lead Generation'], lastActiveDays: 5,
    freshness: '3 yr 4 m', salary: '₹7.1 Lakhs', location: 'Mumbai',
    tags: ['Business Development Executive'],
    title: 'Business Development Executive at Housing.com · 2020–2023',
    prevTitle: 'Field Sales Executive at Trudge · 2019–2020',
    education: 'B.A., Economics (St. Xavier\'s, Mumbai) · 2019',
    skills: 'Field Sales · B2B Sales · Lead Generation · Account Management',
    keySkills: 'Relationship management · Sales strategy · Convincing skills',
    matchedKeywords: ['Sales', 'Field Sales'],
  },
  {
    id: 'db7', name: 'Nilam Sengupta', initials: 'NS', color: '#bfdbfe',
    filterTags: ['Business Development'], lastActiveDays: 45,
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
  pendingHighlightId?: string | null;
  onHighlightClear?: () => void;
  // Shared unlock state from parent
  unlockedIds?: Set<string>;
  creditsRemaining?: number;
  onUnlock?: (id: string) => void;
  onFreeUnlock?: (id: string) => void;
  ftueVersion?: 'v1' | 'v2' | 'off';
  // Pinning wiring: Live Leads are pinned to the top by default; applying any filter
  // unpins them (they weave into the results list). The header toggle re-pins.
  pinned?: boolean;
  onTogglePin?: () => void;
  onEnterSearch?: () => void;
  onResetFilters?: () => void;
  dbFilters?: DbFilterValues;
  // Hot Leads location support:
  //  - variant='leads'  → render ONLY the Hot Leads, unfiltered, as the standalone tab.
  //  - hideLeads=true   → DB view with Hot Leads removed entirely (they live in their own tab).
  //  - onExploreDatabase→ the slim "explore the database" index at the end of the leads tab.
  variant?: 'database' | 'leads';
  hideLeads?: boolean;
  onExploreDatabase?: () => void;
}

const DEFAULT_DB_FILTERS: DbFilterValues = { skills: DB_SKILL_FILTERS, hideUnlocked: false, hideExcel: false, hideWhatsApp: false };

export function DatabaseTab({ hasCredits, credits, totalLeads, dbTotal, highlightLeadId, pendingHighlightId, onHighlightClear, unlockedIds, creditsRemaining, onUnlock, onFreeUnlock, ftueVersion, pinned = true, onTogglePin, onEnterSearch, onResetFilters, dbFilters = DEFAULT_DB_FILTERS, variant = 'database', hideLeads = false, onExploreDatabase }: DatabaseTabProps) {
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

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightActive, setHighlightActive] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    if (!highlightLeadId) return;
    setHighlightActive(highlightLeadId);
    const el = cardRefs.current[highlightLeadId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const tHighlight = setTimeout(() => {
      setHighlightActive(null);
      onHighlightClear?.();
    }, 2500);
    return () => clearTimeout(tHighlight);
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
      onUnlock?.(id);
    } else {
      onFreeUnlock?.(id);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const shownLeads = Array.from({ length: totalLeads }, (_, i) =>
    i < ACTIVE_LEADS.length
      ? ACTIVE_LEADS[i]
      : { ...ACTIVE_LEADS[i % ACTIVE_LEADS.length], id: `${ACTIVE_LEADS[i % ACTIVE_LEADS.length].id}_${i}` }
  );

  // ── Filter pipeline: applies to BOTH Live Leads and DB profiles ──
  // Skill chips are OR-combined (candidate matches any selected skill); period is
  // recency; "hide already unlocked" drops unlocked rows. All AND-combined.
  const periodMax = PERIOD_DAYS[activePeriod] ?? 9999;
  function passesFilter(p: Profile): boolean {
    const skillOk = dbFilters.skills.length === 0
      ? false // no skills selected → nothing matches
      : p.filterTags.some(t => dbFilters.skills.includes(t));
    const recencyOk = p.lastActiveDays <= periodMax;
    const hideOk = !(dbFilters.hideUnlocked && unlocked.has(p.id));
    return skillOk && recencyOk && hideOk;
  }

  const visibleLeads = shownLeads.filter(passesFilter);
  const visibleDb = DB_PROFILES.filter(passesFilter);
  const liveCount = visibleLeads.length;

  // In the unpinned list we weave the unique leads (no cloned duplicates) among DB rows.
  // Cap to the job's lead count so a 3-lead job doesn't surface all 5 sample leads.
  const uniqueLeads = ACTIVE_LEADS.slice(0, Math.min(totalLeads, ACTIVE_LEADS.length)).filter(passesFilter);


  function renderLeadRow(profile: Profile, inline: boolean) {
    return (
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
        isActiveLead
        inline={inline}
        isPreview={false}
        isHighlighted={highlightActive === profile.id}
        cardRef={el => { cardRefs.current[profile.id] = el; }}
        ftueVersion={ftueVersion}
        onBuyCredits={() => setShowBuyModal(true)}
      />
    );
  }

  function renderDbRow(profile: Profile) {
    return (
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
    );
  }

  // ── Standalone Hot Leads tab — leads only, unfiltered ──
  if (variant === 'leads') {
    return (
      <div className="flex flex-col gap-0">
        <style>{SHIMMER_STYLE}</style>

        {pendingHighlightId ? (
          /* Skeleton bridge while a "View Profile" highlight resolves */
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-4 w-56 bg-gray-200 rounded mb-1" />
            {Array.from({ length: Math.min(Math.max(totalLeads, 1), 4) }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                <div className="flex items-start gap-3 px-4 pt-4 pb-4">
                  <div className="w-4 h-4 mt-1 rounded bg-gray-100 flex-shrink-0" />
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 pt-1">
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                    <div className="h-2 w-1/4 bg-gray-100 rounded" />
                  </div>
                  <div className="h-8 w-28 bg-gray-100 rounded-xl flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Teal container — same look as the Database tab's pinned Hot Leads card,
                  with the descriptive header moved inside it. */}
            <div className="border border-[#b6ecec] rounded-xl bg-[#e7f9f9] mb-3 overflow-hidden">
              {/* Header inside the container */}
              <div className="px-5 pt-5 pb-4">
                <p className="flex items-center gap-2 text-base font-semibold text-[#172b4d] mb-1">
                  {totalLeads > 0 && (
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  )}
                  {totalLeads > 0 ? `${totalLeads} Hot Leads actively looking for this role` : 'Hot Leads'}
                </p>
                <p className="text-sm text-gray-500">
                  Candidates from the apna database who are actively looking and match your job — shown unfiltered, freshest first.
                </p>
              </div>

              {totalLeads > 0 ? (
                /* Lead cards inside the teal container */
                <div className="px-3 pb-3 flex flex-col gap-2">
                  {shownLeads.map(profile => renderLeadRow(profile, false))}
                </div>
              ) : (
                /* Pending — no active leads yet */
                <div className="px-5 pb-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#b6ecec] flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-[16px] text-[#1f8268] select-none">notifications</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f8268]">Hot Leads will appear here</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      We're watching {dbTotal} matching candidates in the database and will notify you as soon as any become active on the app.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Slim index → Database (explore further) */}
            {dbTotal > 0 && (
              <button
                onClick={onExploreDatabase}
                className="mt-3 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#dfe1e6] bg-white hover:border-[#1f8268] hover:bg-[#f7fdfb] transition-colors text-left"
              >
                <span className="text-xs text-[#42526e]">
                  Want to explore more? Browse all <span className="font-semibold text-[#172b4d]">{dbTotal.toLocaleString()} matching candidates</span> in the Database.
                </span>
                <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#1f8268]">
                  Explore Database
                  <span className="material-icons-round text-[14px] select-none">arrow_forward</span>
                </span>
              </button>
            )}
          </>
        )}

        {showBuyModal && <InsufficientCreditsModal onClose={() => setShowBuyModal(false)} />}
      </div>
    );
  }

  if (dbTotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <span className="material-icons-round text-[28px] text-[#adb5bd] select-none">cloud_off</span>
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
              onChange={e => { setActivePeriod(e.target.value); onEnterSearch?.(); }}
              className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border border-[#dfe1e6] bg-white text-xs font-medium text-gray-700 hover:border-[#b3bac5] transition-colors cursor-pointer focus:outline-none focus:border-[#1f8268] focus-visible:ring-2 focus-visible:ring-[#186b55]"
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
            </select>
            <span className="material-icons-round text-[10px] text-gray-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 select-none">expand_more</span>
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
              className="appearance-none pl-2 pr-5 py-1 rounded-lg border border-[#dfe1e6] bg-white text-xs font-medium text-gray-700 hover:border-gray-400 transition-colors cursor-pointer focus:outline-none focus:border-[#1f8268] focus-visible:ring-2 focus-visible:ring-[#186b55]"
            >
              {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="material-icons-round text-[9px] text-gray-400 pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 select-none">expand_more</span>
          </div>
          <span className="text-xs text-gray-500">of {dbTotal}</span>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#dfe1e6] text-[#5e6c84] hover:border-[#b3bac5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-icons-round text-[12px] select-none">chevron_left</span>
          </button>
          <span className="text-xs text-gray-500 px-1">
            Page <span className="font-semibold text-gray-800">{currentPage}</span> of {Math.ceil(dbTotal / perPage)}
          </span>
          <button
            aria-label="Next page"
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(dbTotal / perPage), p + 1))}
            disabled={currentPage === Math.ceil(dbTotal / perPage)}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#dfe1e6] text-[#5e6c84] hover:border-[#b3bac5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-icons-round text-[12px] select-none">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ── Multi-select action bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Checkbox + count */}
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded border-2 bg-[#1f8268] border-[#1f8268] flex items-center justify-center flex-shrink-0">
              <span className="material-icons-round text-[9px] text-white select-none">check</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{selectedIds.size} selected</span>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg transition-colors">
            <span className="material-icons-round text-[13px] select-none">download</span>
            Download Excel
          </button>

          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-semibold rounded-lg transition-colors">
            <span className="material-icons-round text-[13px] select-none">chat</span>
            Send WhatsApp
          </button>

          {/* Deselect all */}
          <button
            aria-label="Deselect all"
            onClick={() => setSelectedIds(new Set())}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="material-icons-round text-[13px] select-none">close</span>
          </button>
        </div>
      )}

      {/* ── Full-tab skeleton while unlock transition plays ── */}
      {pendingHighlightId ? (
        <div className="animate-pulse flex flex-col gap-3">
          {/* Hot Leads section skeleton — omitted when leads live in their own tab */}
          {!hideLeads && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <div className="h-3.5 w-40 bg-gray-200 rounded" />
            </div>
            <div className="p-3 flex flex-col gap-2">
              {Array.from({ length: Math.min(totalLeads, 3) }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                  <div className="h-14 bg-gray-100" />
                  <div className="px-4 pt-4 pb-4 flex flex-col gap-2">
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                    <div className="h-2 w-1/3 bg-gray-100 rounded" />
                    <div className="mt-3 h-8 w-full bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
          {/* DB profile rows skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              <div className="flex items-start gap-3 px-4 pt-4 pb-4">
                <div className="w-4 h-4 mt-1 rounded bg-gray-100 flex-shrink-0" />
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                  <div className="h-2 w-1/4 bg-gray-100 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-100 rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* ── Live Leads region: pinned card (default) OR slim unpinned banner.
            Omitted entirely when Hot Leads live in their own tab (hideLeads). ── */}
      {!hideLeads && pinned && !pendingHighlightId ? (
        <div id="db-hot-leads-container" className="border border-[#b6ecec] rounded-xl bg-[#e7f9f9] mb-3 overflow-hidden">
          {/* Container header — title left, pin toggle far right */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {liveCount > 0 ? (
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1f8268]" />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-300" />
                )}
                <span className="text-sm font-semibold text-[#172b4d]">Hot Leads ({liveCount})</span>
                {liveCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#1f8268] px-2 py-0.5 rounded-full uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    New
                  </span>
                )}
              </div>
              {totalLeads > 0 && <PinToggle pinned onToggle={onTogglePin} />}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 ml-4">
              {totalLeads > 0
                ? 'Relevant candidates actively looking for jobs, recently applied to similar roles'
                : 'Candidates from the database who are currently active on the app will appear here'}
            </p>
          </div>

          {totalLeads > 0 ? (
            visibleLeads.length > 0 ? (
              /* Cards inside the green container */
              <div className="p-3 flex flex-col gap-2">
                {visibleLeads.map(profile => renderLeadRow(profile, false))}
              </div>
            ) : (
              /* Filtered out — no Live Leads match */
              <p className="px-4 pb-4 text-xs text-[#5e6c84]">No Hot Leads match these filters.</p>
            )
          ) : (
            /* Pending state — no active leads yet */
            <div className="px-4 pb-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#b6ecec] flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-[14px] text-[#1f8268] select-none">notifications</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f8268]">Hot Leads will appear here</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  We're watching {dbTotal} matching candidates in the database and will notify you as soon as any become active on the app.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : !hideLeads && !pendingHighlightId ? (
        /* Unpinned — slim banner; Live Leads now flow into the results list below */
        <div className="flex items-center justify-between gap-3 mb-3 px-4 py-2.5 rounded-xl border border-[#b6ecec] bg-[#e7f9f9]">
          <span className="flex items-center gap-2 text-xs text-[#172b4d] min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="font-semibold">Hot Leads ({liveCount})</span>
            <span className="text-gray-500 truncate hidden sm:inline">· unpinned — flagged in your results below</span>
          </span>
          <PinToggle pinned={false} onToggle={onTogglePin} />
        </div>
      ) : null}

      {/* Spacing */}
      <div className="mb-2" />
      {!pendingHighlightId && (() => {
        const rows = (hideLeads || pinned)
          ? visibleDb.map(p => ({ profile: p, live: false }))
          : interleaveLeads(uniqueLeads, visibleDb);

        if (rows.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <span className="material-icons-round text-[22px] text-[#adb5bd] select-none">search</span>
              </div>
              <p className="text-sm font-semibold text-[#172b4d] mb-1">No candidates match these filters</p>
              <p className="text-xs text-gray-500 mb-4 max-w-xs">Try widening the active period or selecting more skills.</p>
              <button onClick={onResetFilters} className="px-4 py-2 border border-[#1f8268] text-[#1f8268] text-xs font-semibold rounded-lg hover:bg-[#eaf8f4] transition-colors">
                Clear filters
              </button>
            </div>
          );
        }

        return rows.map(({ profile, live }) => live ? renderLeadRow(profile, true) : renderDbRow(profile));
      })()}

      {!pendingHighlightId && visibleDb.length > 0 && (
        <div className="text-center py-6">
          <button
            onClick={() => setAllLoaded(true)}
            disabled={allLoaded}
            className="px-5 py-2.5 bg-white border border-[#dfe1e6] rounded-xl text-xs font-semibold text-[#42526e] hover:border-[#b3bac5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allLoaded ? 'All profiles loaded' : 'Load more profiles'}
          </button>
        </div>
      )}

      {showBuyModal && <InsufficientCreditsModal onClose={() => setShowBuyModal(false)} />}
    </div>
  );
}



function PinToggle({ pinned, onToggle }: { pinned: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pinned}
      aria-label={pinned ? 'Unpin Live Leads from top' : 'Pin Live Leads to top'}
      onClick={onToggle}
      className={`flex items-center gap-1.5 flex-shrink-0 ${pinned ? 'text-[#1f8268]' : 'text-[#5e6c84]'}`}
    >
      <span className="material-icons-round text-[12px] select-none">push_pin</span>
      <span className="text-[11px] font-semibold">{pinned ? 'Pinned to top' : 'Pin to top'}</span>
      <span className={`relative w-7 h-4 rounded-full transition-colors ${pinned ? 'bg-[#1f8268]' : 'bg-[#c1c7d0]'}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${pinned ? 'left-[14px]' : 'left-0.5'}`} />
      </span>
    </button>
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
  inline?: boolean;
  isPreview?: boolean;
  isHighlighted?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
  ftueVersion?: 'v1' | 'v2' | 'off';
  onBuyCredits?: () => void;
}

function HighlightedText({ text }: { text: string; keywords?: string[] }) {
  return <span className="text-gray-700">{text}</span>;
}

function ProfileRow({ profile, isSelected, isUnlocked, isViewing, hasCredits, remaining, onToggleSelect, onUnlock, isActiveLead, inline, isPreview, isHighlighted, cardRef, onBuyCredits }: ProfileRowProps) {
  if (isActiveLead) {
    return (
      <div
        ref={cardRef}
        className={`relative rounded-xl border bg-white overflow-hidden hover:shadow-sm transition-all duration-700 ${
          inline ? 'mb-2' : ''
        } ${
          isHighlighted ? 'border-[#1f8268] ring-2 ring-[#1f8268]/30' : 'border-gray-200'
        }`}
      >
        {/* Shimmer overlay — teal pulse + sweep on highlight */}
        {isHighlighted && (
          <>
            <div className="card-highlight-pulse absolute inset-0 bg-[#1f8268] pointer-events-none z-10 rounded-xl" />
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
              <div className="card-shimmer-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
            </div>
          </>
        )}
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`Select ${profile.name}`}
              onClick={onToggleSelect}
              className={`w-4 h-4 rounded border-2 cursor-pointer flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#186b55] focus-visible:ring-offset-1 ${
                isSelected ? 'bg-[#1f8268] border-[#1f8268]' : 'border-[#dfe1e6] hover:border-[#b3bac5]'
              }`}
            >
              {isSelected && (
                <span className="material-icons-round text-[9px] text-white select-none">check</span>
              )}
            </button>
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
              <span className="material-icons-round text-[16px] text-[#172b4d] flex-shrink-0 select-none">chevron_right</span>
              {isUnlocked && (
                <span className="ml-1 flex items-center gap-1 px-2 py-0.5 bg-[#e7f9f9] border border-[#b6ecec] text-[#00857c] text-[10px] font-semibold rounded-full">
                  <span className="material-icons-round text-[10px] text-currentColor select-none">lock</span>
                  Unlocked
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
                <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">school</span>
                {profile.freshness}
              </span>
              <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
                <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">location_on</span>
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
                <span className="material-icons-round text-[10px] text-[#172b4d] select-none">check</span>
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
                <span className="material-icons-round text-[15px] select-none">phone</span>
                View number
              </button>
              <p className="text-[11px] text-[#5e6c84] flex items-center gap-1">
                <span className="material-icons-round text-[11px] text-[#1f8268] select-none">check_circle</span>
                No credits will be used for viewing this profile
              </p>
            </>
          ) : isPreview ? (
            /* ── Preview free unlock ── */
            <button
              onClick={onUnlock}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <span className="material-icons-round text-[15px] select-none">lock</span>
              Unlock for free · Preview
            </button>
          ) : hasCredits && remaining > 0 ? (
            /* ── State 1: Locked, has credits ── */
            <button
              onClick={onUnlock}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-sm font-semibold rounded-xl transition-colors"
            >
            <span className="material-icons-round text-[15px] select-none">lock</span>
              Unlock · 1 credit
            </button>
          ) : (
            /* ── State 1: Locked, no credits ── */
            <button onClick={() => onBuyCredits?.()} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <span className="material-icons-round text-[15px] select-none">lock</span>
              Buy credits to unlock
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#dfe1e6]">
          <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
            <span className="material-icons-round text-[11px] select-none">lock</span>
            Contacted by 33 recruiters
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
              <span className="material-icons-round text-[11px] select-none">description</span>
              CV attached
            </span>
            <span className="text-[#dfe1e6]">|</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e7f9f9] border border-[#b6ecec] text-[11px] text-[#00857c] font-medium">
              <span className="material-icons-round text-[10px] select-none">schedule</span>
              {freshnessLabel(profile.lastActiveDays)}
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
              <span className="material-icons-round text-[9px] text-white select-none">check</span>
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
            <span className="material-icons-round text-[16px] text-[#172b4d] flex-shrink-0 select-none">chevron_right</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
              <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">work</span>
              {profile.freshness}
            </span>
            <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]">
              <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">location_on</span>
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
                <span className="material-icons-round text-[10px] text-[#172b4d] select-none">check</span>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detail rows */}
      <div className="px-4 pb-3 flex flex-col gap-3">
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
              <span className="material-icons-round text-[15px] select-none">phone</span>
              View number
            </button>
            <p className="text-[11px] text-[#5e6c84] flex items-center gap-1">
              <span className="material-icons-round text-[11px] text-[#1f8268] select-none">check_circle</span>
              No credits will be used for viewing this profile
            </p>
          </>
        ) : hasCredits && remaining > 0 ? (
          <button onClick={onUnlock} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-sm font-semibold rounded-xl transition-colors">
            <span className="material-icons-round text-[15px] select-none">lock</span>
            Unlock · 1 credit
          </button>
        ) : (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            <span className="material-icons-round text-[15px] select-none">lock</span>
            Buy credits to unlock
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#dfe1e6]">
        <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
          <span className="material-icons-round text-[11px] select-none">lock</span>
          Contacted by 33 recruiters
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
            <span className="material-icons-round text-[11px] select-none">description</span>
            CV attached
          </span>
          <span className="text-[#dfe1e6]">|</span>
          <span className="flex items-center gap-1 text-[11px] text-[#42526e]">
            <span className="material-icons-round text-[10px] select-none">schedule</span>
            {freshnessLabel(profile.lastActiveDays)}
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
            aria-label={copied ? 'Phone number copied' : 'Copy phone number'}
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#eaf8f4] transition-colors"
          >
            {copied ? (
              <span className="material-icons-round text-[14px] text-[#1f8268] flex-shrink-0 select-none">check</span>
            ) : (
              <span className="material-icons-round text-[14px] text-[#1f8268] flex-shrink-0 select-none">content_copy</span>
            )}
            <span className={`text-sm font-semibold transition-colors ${copied ? 'text-[#1f8268]' : 'text-[#172b4d]'}`}>
              {copied ? 'Copied!' : phone}
            </span>
          </button>
          {/* Separator */}
          <div className="w-px h-8 bg-[#dfe1e6] flex-shrink-0" />
          {/* Right: QR zone */}
          <button
            aria-label="Show QR code to scan and call"
            onClick={() => setQrOpen(true)}
            className="flex items-center justify-center px-3 py-2.5 hover:bg-[#eaf8f4] transition-colors"
            title="Show QR code to scan & call"
          >
            <span className="material-icons-round text-[16px] text-[#1f8268] select-none">qr_code</span>
          </button>
        </div>

        {/* WhatsApp */}
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#dfe1e6] text-[#172b4d] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          <span className="material-icons-round text-[#25D366] text-[15px] select-none">chat</span>
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
                aria-label="Close"
                onClick={() => setQrOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="material-icons-round text-[14px] select-none">close</span>
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
  briefcase: <span className="material-icons-round text-[16px] text-[#42526e] select-none">business_center</span>,
  education: <span className="material-icons-round text-[16px] text-[#42526e] select-none">school</span>,
  location:  <span className="material-icons-round text-[16px] text-[#42526e] select-none">location_on</span>,
  skills:    <span className="material-icons-round text-[16px] text-[#42526e] select-none">star</span>,
  language:  <span className="material-icons-round text-[16px] text-[#42526e] select-none">language</span>,
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
