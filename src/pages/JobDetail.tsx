import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { JobTabContext } from '../context/JobTabContext';
import { useCredits } from '../context/CreditsContext';
import { SCENARIOS } from '../types';
import type { UserScenario, ScenarioProps } from '../types';
import { FiltersPanel } from '../components/FiltersPanel';
import { FtueModal } from '../components/FtueModal';
import { CoachMarks } from '../components/ftue/CoachMarks';
import type { CoachStep } from '../components/ftue/CoachMarks';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { DatabaseTab, DB_SKILL_FILTERS, type DbFilterValues } from '../components/DatabaseTab';
import { NoCreditsApplied } from '../scenarios/NoCreditsApplied';
import { HasCreditsApplied } from '../scenarios/HasCreditsApplied';
import { OldHasCreditsUsedDb } from '../scenarios/OldHasCreditsUsedDb';

type Tab = 'applied' | 'leads' | 'database';

const APPLIED_TAB_CONTENT: Record<string, React.ComponentType<ScenarioProps>> = {
  'new-no-credits':           NoCreditsApplied,
  'new-has-credits':          HasCreditsApplied,
  'old-no-credits-used-db':   NoCreditsApplied,
  'old-has-credits-never-db':    HasCreditsApplied,
  'old-has-credits-used-leads':  HasCreditsApplied,
  'old-has-credits-used-db':     OldHasCreditsUsedDb,
};

function buildDynamicScenario(params: URLSearchParams): UserScenario {
  const tenure  = params.get('tenure')  ?? 'new';
  const credits = Number(params.get('credits') ?? 0);
  const exp     = params.get('exp')     ?? 'never';
  const leads   = Number(params.get('leads') ?? 6);
  const apps    = Number(params.get('apps')    ?? 0);
  const nudge   = credits === 0
    ? (exp === 'never' ? 'buy_credits' : 'repurchase')
    : (exp === 'never' ? 'first_try'   : 'engage');
  const db = Number(params.get('db') ?? -1);
  const dbTotal = db >= 0 ? db : Math.max(leads * 30 + 180, 200);
  return {
    id: 'dynamic',
    label: tenure === 'new' ? 'New user' : 'Returning user',
    tag: 'Custom',
    userType: tenure as 'new' | 'old',
    dbCredits: credits,
    dbExperience: exp as 'never' | 'used_before' | 'used_leads',
    jobLeads: leads,
    dbTotal,
    applicationsCount: apps,
    description: 'Configured via journey builder',
    userBehavior: '',
    productObjective: '',
    goal: '',
    nudgeVariant: nudge as UserScenario['nudgeVariant'],
    leadsLocation: 'database',
  };
}

// The rendered solution depends only on credits (does the recruiter have credits to spend?).
// Familiarity (dbExperience) and tenure are passed through as props — they tune copy, the
// nudge banner, and the FTUE, not which component renders. The Power-User custom view is
// reachable only via the fixed scenario in APPLIED_TAB_CONTENT.
function getAppliedComponent(scenario: UserScenario): React.ComponentType<ScenarioProps> {
  return scenario.dbCredits === 0 ? NoCreditsApplied : HasCreditsApplied;
}

export function JobDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const scenarioId = params.get('scenario');
  const scenario = scenarioId
    ? (SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS[0])
    : buildDynamicScenario(params);

  const AppliedContent = scenarioId
    ? (APPLIED_TAB_CONTENT[scenarioId] ?? NoCreditsApplied)
    : getAppliedComponent(scenario);

  const ftueVersion = (params.get('ftue') ?? 'v2') as 'v1' | 'v2' | 'off';

  const [tab, setTab] = useState<Tab>('applied');
  const [ftueCompleted, setFtueCompleted] = useState(false);
  const [ftueOpen, setFtueOpen] = useState(true);
  const [forceFtueOpen, setForceFtueOpen] = useState(false);
  const [highlightLeadId, setHighlightLeadId] = useState<string | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);

  // Shared unlock state — persists across tab switches
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [creditsRemaining, setCreditsRemaining] = useState(scenario.dbCredits);

  // Database-tab Live Leads pinning. Pinned by default; applying any filter unpins
  // them (they weave into the results list). The header toggle re-pins.
  const [dbPinned, setDbPinned] = useState(true);
  const [scrolledBeyondLeads, setScrolledBeyondLeads] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [filterResetKey, setFilterResetKey] = useState(0);
  const [dbFilterValues, setDbFilterValues] = useState<DbFilterValues>({
    skills: DB_SKILL_FILTERS, hideUnlocked: false, hideExcel: false, hideWhatsApp: false,
  });

  function enterDbSearch() { setDbPinned(false); }
  function toggleDbPin() { setDbPinned(p => !p); }
  function resetDbFilters() {
    setDbPinned(true);
    setScrolledBeyondLeads(false);
    setDbFilterValues({ skills: DB_SKILL_FILTERS, hideUnlocked: false, hideExcel: false, hideWhatsApp: false });
    setFilterResetKey(k => k + 1);
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    if (tab !== 'database') return;
    const leadsEl = document.getElementById('db-hot-leads-container');
    if (leadsEl) {
      const containerRect = e.currentTarget.getBoundingClientRect();
      const elRect = leadsEl.getBoundingClientRect();
      // Scrolled beyond when the bottom of the Hot Leads container is above the top of the scroll container
      setScrolledBeyondLeads(elRect.bottom <= containerRect.top + 20);
    } else {
      setScrolledBeyondLeads(e.currentTarget.scrollTop > 200);
    }
  }

  // Reset scroll and scroll state when tab changes
  useEffect(() => {
    setScrolledBeyondLeads(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [tab]);

  // Listen to window scroll when database tab is active (in case layout scrolls window instead of right panel)
  useEffect(() => {
    if (tab !== 'database') return;
    function handleWindowScroll() {
      const leadsEl = document.getElementById('db-hot-leads-container');
      if (leadsEl) {
        const elRect = leadsEl.getBoundingClientRect();
        // Since the window is scrolling, it's scrolled beyond when the bottom of the leads element
        // is above the top of the viewport (or below the sticky job header, which is at 178px)
        setScrolledBeyondLeads(elRect.bottom <= 178);
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        setScrolledBeyondLeads(scrollTop > 200);
      }
    }
    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [tab]);

  const { setCredits, pulse } = useCredits();
  useEffect(() => { setCredits(scenario.dbCredits); }, [scenario.dbCredits, setCredits]);

  useEffect(() => {
    setUnlockedIds(new Set());
    setCreditsRemaining(scenario.dbCredits);
    setDbPinned(true);
    setScrolledBeyondLeads(false);
    setDbFilterValues({ skills: DB_SKILL_FILTERS, hideUnlocked: false, hideExcel: false, hideWhatsApp: false });
    setFilterResetKey(k => k + 1);
  }, [scenarioId, scenario.dbCredits]);

  const jobAge = (params.get('age') ?? 'active') as 'fresh' | 'active' | 'aging';
  const totalLeads = scenario.jobLeads;
  const dbTotal = scenario.dbTotal;
  // Hot Leads location: always part of database tab by default.
  const leadsIndividual = false;

  // Celebration phase — only runs once on mount when jobAge === 'fresh'
  const [celebPhase, setCelebPhase] = useState<'live' | 'radar' | 'done'>(jobAge === 'fresh' ? 'live' : 'done');
  const celebTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (jobAge !== 'fresh') return;
    const t1 = setTimeout(() => setCelebPhase('radar'), 2000);
    celebTimers.current = [t1];
    return () => celebTimers.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FTUE delayed until celebration settles (Option A)
  const showFtue = ftueVersion !== 'off' && (scenario.userType === 'new' || scenario.dbExperience === 'never' || scenario.dbExperience === 'used_before') && !ftueCompleted && totalLeads > 0 && (celebPhase === 'radar' || celebPhase === 'done');

  // Maps CANDIDATES ids to ACTIVE_LEADS ids in DatabaseTab
  const CANDIDATE_TO_LEAD_ID: Record<string, string> = {
    '1': 'al0', '2': 'al1', '3': 'al2',
  };

  function handleUnlock(id: string) {
    if (unlockedIds.has(id)) return;
    setUnlockedIds(prev => new Set(prev).add(id));
    setCreditsRemaining(r => Math.max(r - 1, 0));
    setCredits(c => Math.max(c - 1, 0));
    pulse();
  }



  function handleUnlockAndView(candidateId: string) {
    const leadId = CANDIDATE_TO_LEAD_ID[candidateId];
    if (leadId) {
      resetDbFilters();
      // 1. Switch tab immediately so the user sees the destination. When Hot Leads have
      //    their own tab, "View Profile" lands there; otherwise it lands in the Database.
      setTab(leadsIndividual ? 'leads' : 'database');
      // 2. Show skeleton in the destination tab for 700ms
      setPendingHighlightId(leadId);
      setTimeout(() => {
        // 3. Resolve: trigger real highlight + unlock toast
        setPendingHighlightId(null);
        setHighlightLeadId(leadId);
      }, 700);
    }
  }

  function switchToDatabase() {
    setTab('database');
  }

  // Skeleton bridge into the Database tab (the leads-tab "Explore Database" index uses this).
  function handleGoToDatabase() {
    switchToDatabase();
    setPendingHighlightId('__browse__');
    setTimeout(() => setPendingHighlightId(null), 700);
  }

  // Skeleton bridge into the standalone Hot Leads tab.
  function handleGoToLeads() {
    setTab('leads');
    setPendingHighlightId('__browse__');
    setTimeout(() => setPendingHighlightId(null), 700);
  }

  // What the Applied-tab Hot Leads surfaces ("Explore Hot Leads", "See all Hot Leads",
  // scenario components' jobTab.goToDatabase()) should do: go to the Leads tab when Hot
  // Leads live there, else the Database tab. Keeps the default behavior identical.
  function handleExploreLeads() {
    if (leadsIndividual) handleGoToLeads();
    else handleGoToDatabase();
  }

  function handleFtueComplete() {
    setFtueCompleted(true);
    setFtueOpen(false);
  }

  return (
    <div className="flex flex-col flex-1" style={{ margin: '-23px -32px 0' }}>
      {/* FTUE v1 — modal */}
      {(forceFtueOpen || (ftueVersion === 'v1' && showFtue && ftueOpen)) && (
        <FtueModal
          hasCredits={scenario.dbCredits > 0}
          leadsIndividual={leadsIndividual}
          onComplete={() => {
            handleFtueComplete();
            setForceFtueOpen(false);
          }}
        />
      )}

      {/* Job header — sticky, full width, sits below the topbar */}
      <div className="sticky top-[62px] z-20 bg-white border-b border-gray-200">
        {/* Header: title row + underline tabs */}
        <div className="px-5 pt-3 pb-0">
        <div className="relative w-full max-w-[1100px] mx-auto">
          <button
            aria-label="Back to jobs"
            onClick={() => navigate('/')}
            className="absolute -left-8 top-0.5 w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
          >
            <span className="material-icons-round text-[18px]">arrow_back</span>
          </button>

          <div className="min-w-0">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">Field Sales Executive</span>
                <span className="px-2 py-0.5 bg-[#e7f9f9] text-[#1f8268] rounded-full text-[11px] font-semibold">Active</span>
              </div>
              <div className="flex items-center">
                <button aria-label="Edit job" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">
                  <span className="material-icons-round text-[18px]">edit</span>
                </button>
                <button aria-label="More options" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">
                  <span className="material-icons-round text-[18px]">more_vert</span>
                </button>
              </div>
            </div>

            {/* Location */}
            <span className="text-xs text-gray-400 mt-0.5 block">Saket, Delhi-NCR</span>

            {/* Underline tabs */}
            <div className="flex items-center gap-2 mt-5">
              <UnderlineTab active={tab === 'applied'} onClick={() => setTab('applied')}>
                <span className="material-icons-round text-[18px]">business_center</span>
                <span>Applied to job ({scenario.applicationsCount})</span>
              </UnderlineTab>
              <span data-ftue="database-tab">
                <UnderlineTab active={tab === 'database'} onClick={switchToDatabase} highlight={dbTotal > 0} disabled={dbTotal === 0}>
                  <span className="material-icons-round text-[18px]">person_search</span>
                  <span>Database ({dbTotal})</span>
                </UnderlineTab>
              </span>
            </div>
          </div>
        </div>
        </div>

      </div>

      {/* FTUE v2 — coach marks */}
      {ftueVersion === 'v2' && showFtue && ftueOpen && (() => {
        // The Applied-tab Hot Leads surface differs by scenario: the full ActiveLeadsTab
        // widget renders for 0 applicants or (few applicants + credits); otherwise leads
        // appear as the end-of-feed ingress (and a credit nudge for no-credits). Anchor
        // the tour to whatever is actually on screen so steps never silently skip.
        const leadsWidgetOnApplied = totalLeads > 0 &&
          (scenario.applicationsCount === 0 || (scenario.dbCredits > 0 && scenario.applicationsCount < 5));

        const tabStep: CoachStep = leadsIndividual
          ? {
              selector: '[data-ftue="leads-tab"]',
              title: 'Your Hot Leads, in one tab',
              body: `All ${totalLeads} active Hot Leads live in this tab — no filters, just the freshest matches. Explore the full database any time from the Database tab.`,
              cta: 'Got it!',
            }
          : {
              selector: '[data-ftue="database-tab"]',
              title: `All ${dbTotal} matching candidates`,
              body: 'Browse every candidate who fits this job. Hot Leads are pinned at the top — they\'re the most likely to respond.',
              cta: 'Got it!',
            };

        const coachSteps: CoachStep[] = leadsWidgetOnApplied
          ? [
              {
                selector: '[data-ftue="live-leads-section"]',
                title: 'Meet your Hot Leads',
                body: `These ${totalLeads} candidates aren't a static list — they're actively looking for work right now and match your job.`,
                cta: 'Got it',
              },
              {
                selector: '[data-ftue="first-lead-unlock-btn"]',
                title: 'View profile, then unlock',
                body: leadsIndividual
                  ? 'Tap "View Profile" to open the full profile in the Hot Leads tab. From there, unlock with 1 credit to get their phone number and contact them directly.'
                  : 'Tap "View Profile" to see the full profile in the database. From there, unlock with 1 credit to get their phone number and contact them directly.',
                cta: 'Got it',
              },
              tabStep,
            ]
          : [
              {
                // Leads live as the end-of-feed ingress (and a top credit nudge for
                // no-credits). Prefer the nudge (top, no scroll) when present, else the ingress.
                selector: '[data-ftue="leads-nudge"], [data-ftue="leads-ingress"]',
                title: 'Meet your Hot Leads',
                body: `${totalLeads} candidates from apna's database are actively looking right now and match your job — open them to view full profiles and contact details.`,
                cta: 'Got it',
              },
              tabStep,
            ];
        return <CoachMarks steps={coachSteps} onComplete={handleFtueComplete} />;
      })()}

      {/* Content */}
      <JobTabContext.Provider value={{ goToDatabase: handleExploreLeads, jobAge, newToHotLeads: scenario.dbExperience !== 'used_leads' }}>
      <div className="flex-1 bg-gray-50 flex justify-center" style={{ padding: '12px 20px 23px' }}>
        <div className="flex w-full max-w-[1100px] gap-3 min-h-0">
        {tab === 'applied' && scenario.applicationsCount > 0 && <FiltersPanel mode="applied" />}
        {tab === 'database' && dbTotal > 0 && (
          <FiltersPanel
            mode="database"
            totalLeads={dbTotal}
            onInteract={enterDbSearch}
            onFiltersChange={setDbFilterValues}
            resetSignal={filterResetKey}
            hideLeadsCard={leadsIndividual}
            scrolledBeyondLeads={scrolledBeyondLeads}
            dbPinned={dbPinned}
          />
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-gray-50 min-w-0 relative"
        >
          {tab === 'applied' && (
            <div className="flex flex-col gap-3 min-h-full relative pb-8">
              {/* Radar background container (rendered underneath cards) */}
              {jobAge === 'fresh' && scenario.applicationsCount === 0 && celebPhase === 'radar' && (
                <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none z-0 anim-fade-in" style={{ height: '260px' }}>
                  <div 
                    className="absolute left-1/2 flex items-center justify-center"
                    style={{
                      top: '160px',
                      left: '50%',
                      width: '1200px',
                      height: '1200px',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Concentric rings */}
                    <div className="absolute rounded-full border border-[#1f8268]/20" style={{ width: 120, height: 120 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/18" style={{ width: 240, height: 240 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/16" style={{ width: 360, height: 360 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/14" style={{ width: 480, height: 480 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/11" style={{ width: 600, height: 600 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/9" style={{ width: 720, height: 720 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/7" style={{ width: 840, height: 840 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/5" style={{ width: 960, height: 960 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/4" style={{ width: 1080, height: 1080 }} />
                    <div className="absolute rounded-full border border-[#1f8268]/3" style={{ width: 1200, height: 1200 }} />

                    {/* Sweep Scan Beam */}
                    <div
                      className="absolute anim-radar-spin pointer-events-none"
                      style={{
                        width: 1200,
                        height: 1200,
                        borderRadius: '50%',
                        clipPath: 'circle(50% at 50% 50%)',
                        background: 'conic-gradient(from 0deg, rgba(31, 130, 104, 0.08) 0deg, rgba(31, 130, 104, 0.01) 60deg, transparent 61deg)',
                      }}
                    />

                    {/* Central Beacon pulse */}
                    <div className="absolute w-8 h-8 rounded-full bg-[#1f8268] anim-beacon-pulse z-10 flex items-center justify-center text-white shadow-md">
                      <span className="material-icons-round text-sm">person</span>
                    </div>

                    {/* Floating Candidate pings with icon (no image) - placed in top hemisphere */}
                    <div
                      className="absolute anim-avatar-pop"
                      style={{
                        left: 'calc(50% + 180px)',
                        top: 'calc(50% - 80px)',
                        animationDelay: '0.8s',
                        opacity: 0,
                      }}
                    >
                      <div className="relative w-8 h-8 rounded-full border border-white shadow-md flex items-center justify-center bg-[#e8f5e9] text-[#1f8268] z-20">
                        <span className="material-icons-round text-sm">person</span>
                        <div className="absolute inset-0 rounded-full border border-[#1f8268]/30 anim-ping-glow" style={{ animationDelay: '0.8s' }} />
                      </div>
                    </div>

                    <div
                      className="absolute anim-avatar-pop"
                      style={{
                        left: 'calc(50% - 240px)',
                        top: 'calc(50% - 120px)',
                        animationDelay: '1.8s',
                        opacity: 0,
                      }}
                    >
                      <div className="relative w-8 h-8 rounded-full border border-white shadow-md flex items-center justify-center bg-[#e8f5e9] text-[#1f8268] z-20">
                        <span className="material-icons-round text-sm">person</span>
                        <div className="absolute inset-0 rounded-full border border-[#1f8268]/30 anim-ping-glow" style={{ animationDelay: '1.8s' }} />
                      </div>
                    </div>

                    <div
                      className="absolute anim-avatar-pop"
                      style={{
                        left: 'calc(50% + 60px)',
                        top: 'calc(50% - 140px)',
                        animationDelay: '2.8s',
                        opacity: 0,
                      }}
                    >
                      <div className="relative w-8 h-8 rounded-full border border-white shadow-md flex items-center justify-center bg-[#e8f5e9] text-[#1f8268] z-20">
                        <span className="material-icons-round text-sm">person</span>
                        <div className="absolute inset-0 rounded-full border border-[#1f8268]/30 anim-ping-glow" style={{ animationDelay: '2.8s' }} />
                      </div>
                    </div>

                    <div
                      className="absolute anim-avatar-pop"
                      style={{
                        left: 'calc(50% - 140px)',
                        top: 'calc(50% - 60px)',
                        animationDelay: '3.8s',
                        opacity: 0,
                      }}
                    >
                      <div className="relative w-8 h-8 rounded-full border border-white shadow-md flex items-center justify-center bg-[#e8f5e9] text-[#1f8268] z-20">
                        <span className="material-icons-round text-sm">person</span>
                        <div className="absolute inset-0 rounded-full border border-[#1f8268]/30 anim-ping-glow" style={{ animationDelay: '3.8s' }} />
                      </div>
                    </div>

                    <div
                      className="absolute anim-avatar-pop"
                      style={{
                        left: 'calc(50% + 320px)',
                        top: 'calc(50% - 100px)',
                        animationDelay: '4.8s',
                        opacity: 0,
                      }}
                    >
                      <div className="relative w-8 h-8 rounded-full border border-white shadow-md flex items-center justify-center bg-[#e8f5e9] text-[#1f8268] z-20">
                        <span className="material-icons-round text-sm">person</span>
                        <div className="absolute inset-0 rounded-full border border-[#1f8268]/30 anim-ping-glow" style={{ animationDelay: '4.8s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Spacer to push content below the radar center */}
              {scenario.applicationsCount === 0 && jobAge === 'fresh' && celebPhase === 'radar' && (
                <div style={{ height: '170px' }} className="w-full flex-shrink-0 pointer-events-none" />
              )}

              {/* Status card / celebration — only when applicationsCount === 0 and celebPhase === 'live' */}
              {scenario.applicationsCount === 0 && celebPhase === 'live' && (
                <div className="relative z-10">
                  <JobStatusCard phase={celebPhase} jobAge={jobAge} />
                </div>
              )}

              {/* In radar phase, we show a clean header text instead of the status card */}
              {scenario.applicationsCount === 0 && jobAge === 'fresh' && celebPhase === 'radar' && (
                <div className="relative z-10 text-center pb-4 pt-1 flex flex-col items-center anim-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Waiting for applications</h2>
                </div>
              )}

              {/* Live leads widget — only when no applicants yet and leads exist */}
              {scenario.applicationsCount === 0 && totalLeads > 0 && (celebPhase === 'radar' || celebPhase === 'done') && (
                <div className="relative z-10">
                  <ActiveLeadsTab
                    animateIn={jobAge === 'fresh'}
                    key={scenarioId ?? 'dynamic'}
                    totalLeads={totalLeads}
                    dbMatchCount={dbTotal}
                    hasCredits={scenario.dbCredits > 0}
                    credits={scenario.dbCredits}
                    hasUsedDb={scenario.dbExperience === 'used_before'}
                    unlockedCount={unlockedIds.size}
                    lockedCount={Math.max(totalLeads - unlockedIds.size, 0)}
                    showBuyCredits={scenario.dbCredits === 0}
                    onExploreAll={() => leadsIndividual ? handleGoToLeads() : (dbTotal > 0 && handleGoToDatabase())}
                    onGoToDatabase={() => leadsIndividual ? handleGoToLeads() : (dbTotal > 0 && handleGoToDatabase())}
                    onUnlockAndView={handleUnlockAndView}
                    unlockedIds={unlockedIds}
                    creditsRemaining={creditsRemaining}
                    onUnlock={handleUnlock}
                    onHelpClick={() => setForceFtueOpen(true)}
                  />
                </div>
              )}

              {/* Zero leads empty state */}
              {scenario.applicationsCount === 0 && totalLeads === 0 && (
                <div className="relative z-10">
                  <NoLeadsCard dbTotal={dbTotal} jobAge={jobAge} onGoToDatabase={() => setTab('database')} />
                </div>
              )}

              {/* Applied candidates from scenario */}
              <div className="relative z-10">
                <AppliedContent
                  key={`applied-${scenarioId ?? 'dynamic'}`}
                  totalLeads={totalLeads}
                  dbCredits={scenario.dbCredits}
                  applicantCount={scenario.applicationsCount}
                  hasUsedDb={scenario.dbExperience === 'used_before' || scenario.dbExperience === 'used_leads'}
                  dbExperience={scenario.dbExperience}
                  dbTotal={dbTotal}
                  unlockedIds={unlockedIds}
                  creditsRemaining={creditsRemaining}
                  onUnlock={handleUnlock}
                  onUnlockAndView={handleUnlockAndView}
                  onHelpClick={() => setForceFtueOpen(true)}
                />
              </div>
            </div>
          )}



          {tab === 'database' && (
            <DatabaseTab
              key={scenarioId}
              hasCredits={scenario.dbCredits > 0}
              credits={scenario.dbCredits}
              totalLeads={totalLeads}
              dbTotal={dbTotal}
              hideLeads={leadsIndividual}
              highlightLeadId={highlightLeadId}
              pendingHighlightId={pendingHighlightId}
              onHighlightClear={() => setHighlightLeadId(null)}
              unlockedIds={unlockedIds}
              creditsRemaining={creditsRemaining}
              onUnlock={handleUnlock}
              ftueVersion={ftueVersion}
              pinned={dbPinned}
              onTogglePin={toggleDbPin}
              onEnterSearch={enterDbSearch}
              onResetFilters={resetDbFilters}
              dbFilters={dbFilterValues}
            />
          )}
        </div>
        </div>
      </div>
      </JobTabContext.Provider>

      {/* Floating "Go to all journeys" */}
      <button
        onClick={() => navigate('/archetypes')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-xl border border-gray-700 transition-colors"
      >
        <span className="material-icons-round text-sm">home</span>
        Go to all journeys
      </button>
    </div>
  );
}

type JobAge = 'fresh' | 'active' | 'aging';

function NoLeadsCard({ dbTotal, jobAge, onGoToDatabase }: { dbTotal: number; jobAge: JobAge; onGoToDatabase: () => void }) {
  let icon: 'db' | 'empty' | 'clock';
  let title: string;
  let body: string;
  let cta: { label: string; action: 'db' | 'edit' } | null = null;

  if (dbTotal === 0) {
    // No candidates exist in DB at all — fresh and active are the same situation
    if (jobAge === 'aging') {
      icon = 'clock';
      title = 'Job expires soon — no matching candidates found';
      body = 'No candidates in the apna database match this job. Broadening your requirements now is your best chance of finding candidates before it closes.';
      cta = { label: 'Edit job requirements', action: 'edit' };
    } else {
      icon = 'empty';
      title = 'No candidates found in the database';
      body = 'The apna database doesn\'t have candidates matching this job yet. Try broadening your job title, location, or skill requirements.';
      cta = { label: 'Edit job requirements', action: 'edit' };
    }
  } else {
    // DB has candidates — count goes in the title only, not repeated in body or CTA
    if (jobAge === 'fresh') {
      icon = 'db';
      title = `Explore ${dbTotal} matching candidates while you wait`;
      body = 'Browse their profiles while applications come in.';
      cta = { label: 'Explore database matches', action: 'db' };
    } else if (jobAge === 'aging') {
      icon = 'clock';
      title = `${dbTotal} database matches — your job expires soon`;
      body = 'Browse these profiles and reach out before your job closes. Broadening your location or salary range can also surface more candidates.';
      cta = { label: 'Browse matches', action: 'db' };
    } else {
      icon = 'db';
      title = `${dbTotal} candidates match your job`;
      body = "We'll notify you as soon as any become active — browse their profiles in the database tab.";
      cta = { label: 'Browse database matches', action: 'db' };
    }
  }

  const iconEl = icon === 'db'
    ? <span className="material-icons-round text-xl text-[#1f8268]">dns</span>
    : icon === 'clock'
    ? <span className="material-icons-round text-xl text-[#b45309]">schedule</span>
    : <span className="material-icons-round text-xl text-[#5e6c84]">search</span>;

  const isWarning = icon === 'clock';
  const iconBg = icon === 'db' ? 'bg-emerald-50' : isWarning ? 'bg-amber-50' : 'bg-gray-100';

  return (
    <div className={`bg-white rounded-xl border px-5 py-4 flex items-center gap-4 ${isWarning ? 'border-amber-200' : 'border-[#dfe1e6]'}`}>
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {iconEl}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isWarning ? 'text-amber-900' : 'text-gray-900'}`}>{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
      </div>
      {cta && (
        <button
          onClick={cta.action === 'db' ? onGoToDatabase : undefined}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            isWarning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-[#1f8268] hover:bg-[#186b55] text-white'
          }`}
        >
          {cta.label}
          <span className="material-icons-round text-xs">arrow_forward</span>
        </button>
      )}
    </div>
  );
}

type CelebPhase = 'live' | 'radar' | 'done';

function JobStatusCard({
  phase, jobAge,
}: {
  phase: CelebPhase; jobAge: JobAge;
}) {
  // If the animation is not in live phase or it's not a fresh job, don't show it here
  if (phase !== 'live' || jobAge !== 'fresh') return null;

  return (
    <div
      className="relative flex flex-col items-center justify-center py-8 w-full overflow-visible bg-transparent border-0 select-none"
      style={{
        minHeight: 320,
        opacity: 1,
      }}
    >
      {/* ── Central Beacon / Done Checkmark ── */}
      <div
        className="absolute rounded-full bg-[#d1fae5] flex items-center justify-center z-10"
        style={{
          width: 80,
          height: 80,
          top: 80,
          left: 'calc(50% - 40px)',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle cx="24" cy="24" r="22" stroke="#e7f9f9" strokeWidth="3" />
          <circle
            cx="24" cy="24" r="22"
            stroke="#1f8268" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="151" className="anim-circle"
            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
          />
          <polyline
            points="13,25 21,33 35,15"
            stroke="#1f8268"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="36"
            className="anim-check"
          />
        </svg>
      </div>

      {/* ── Text block ── */}
      <div
        className="absolute text-center flex flex-col items-center justify-center w-full"
        style={{
          top: 180,
          left: 0,
          right: 0,
        }}
      >
        <p className="font-semibold text-[#111827] text-lg leading-snug m-0">
          Your job is live!
        </p>
        <p className="text-gray-500 text-sm mt-1 m-0">
          Finding right matches right now…
        </p>
      </div>
    </div>
  );
}

function UnderlineTab({
  children, active, onClick, highlight, disabled,
}: {
  children: React.ReactNode; active: boolean; onClick: () => void; highlight?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className="flex flex-col items-center gap-3 pb-0"
    >
      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
        disabled
          ? 'text-[#c1c7d0] bg-transparent cursor-not-allowed'
          : active
          ? 'text-white font-semibold bg-[#172b4d]'
          : 'text-[#5e6c84] bg-[#f4f5f7] hover:bg-[#ebecf0] hover:text-gray-800'
      }`}>
        {highlight && !active && !disabled && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        )}
        {children}
      </span>
      <span className={`h-0.5 w-full rounded-full transition-all ${active && !disabled ? 'bg-[#172b4d]' : 'bg-transparent'}`} />
    </button>
  );
}
