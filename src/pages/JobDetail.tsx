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
import { HotLeadsSummaryCard } from '../components/HotLeadsSummaryCard';
import { NewNoCredits } from '../scenarios/NewNoCredits';
import { NewHasCredits } from '../scenarios/NewHasCredits';
import { OldNoCreditsUsedDb } from '../scenarios/OldNoCreditsUsedDb';
import { OldHasCreditsNeverDb } from '../scenarios/OldHasCreditsNeverDb';
import { OldHasCreditsUsedDb } from '../scenarios/OldHasCreditsUsedDb';
import { OldHasCreditsUsedLeads } from '../scenarios/OldHasCreditsUsedLeads';
import { OldHasCreditsNewToLeads } from '../scenarios/OldHasCreditsNewToLeads';

type Tab = 'applied' | 'leads' | 'database';

const APPLIED_TAB_CONTENT: Record<string, React.ComponentType<ScenarioProps>> = {
  'new-no-credits':           NewNoCredits,
  'new-has-credits':          NewHasCredits,
  'old-no-credits-used-db':   OldNoCreditsUsedDb,
  'old-has-credits-never-db':    OldHasCreditsNeverDb,
  'old-has-credits-used-leads':  OldHasCreditsUsedLeads,
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
  const leadsLocation = params.get('leadsLoc') === 'individual' ? 'individual' : 'database';
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
    leadsLocation,
  };
}

function getAppliedComponent(scenario: UserScenario): React.ComponentType<ScenarioProps> {
  if (scenario.userType === 'new' && scenario.dbCredits === 0) return NewNoCredits;
  if (scenario.userType === 'new')                             return NewHasCredits;
  if (scenario.dbCredits === 0)                               return OldNoCreditsUsedDb;
  if (scenario.dbExperience === 'never')                      return OldHasCreditsNeverDb;
  if (scenario.dbExperience === 'used_before')                return OldHasCreditsNewToLeads;
  if (scenario.dbExperience === 'used_leads')                 return OldHasCreditsUsedLeads;
  return OldHasCreditsUsedDb;
}

export function JobDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const scenarioId = params.get('scenario');
  const scenario = scenarioId
    ? (SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS[0])
    : buildDynamicScenario(params);

  const AppliedContent = scenarioId
    ? (APPLIED_TAB_CONTENT[scenarioId] ?? NewNoCredits)
    : getAppliedComponent(scenario);

  const ftueVersion = (params.get('ftue') ?? 'v2') as 'v1' | 'v2' | 'off';

  const [tab, setTab] = useState<Tab>('applied');
  const [ftueCompleted, setFtueCompleted] = useState(false);
  const [ftueOpen, setFtueOpen] = useState(true);
  const [highlightLeadId, setHighlightLeadId] = useState<string | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);

  // Shared unlock state — persists across tab switches
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [creditsRemaining, setCreditsRemaining] = useState(scenario.dbCredits);

  // Database-tab Live Leads pinning. Pinned by default; applying any filter unpins
  // them (they weave into the results list). The header toggle re-pins.
  const [dbPinned, setDbPinned] = useState(true);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [dbFilterValues, setDbFilterValues] = useState<DbFilterValues>({
    skills: DB_SKILL_FILTERS, hideUnlocked: false, hideExcel: false, hideWhatsApp: false,
  });

  function enterDbSearch() { setDbPinned(false); }
  function toggleDbPin() { setDbPinned(p => !p); }
  function resetDbFilters() {
    setDbPinned(true);
    setDbFilterValues({ skills: DB_SKILL_FILTERS, hideUnlocked: false, hideExcel: false, hideWhatsApp: false });
    setFilterResetKey(k => k + 1);
  }

  const { setCredits, pulse } = useCredits();
  useEffect(() => { setCredits(scenario.dbCredits); }, [scenario.dbCredits, setCredits]);

  const jobAge = (params.get('age') ?? 'active') as 'fresh' | 'active' | 'aging';
  const totalLeads = scenario.jobLeads;
  const dbTotal = scenario.dbTotal;
  // Hot Leads location: 'individual' gives Hot Leads their own tab (between Applied and
  // Database) and removes them from the Database tab. Undefined → 'database' (current).
  const leadsIndividual = (scenario.leadsLocation ?? 'database') === 'individual';

  // Celebration phase — only runs once on mount when jobAge === 'fresh'
  const [celebPhase, setCelebPhase] = useState<'celebrate' | 'settling' | 'done'>(jobAge === 'fresh' ? 'celebrate' : 'done');
  const celebTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (jobAge !== 'fresh') return;
    const t1 = setTimeout(() => setCelebPhase('settling'), 1800);
    const t2 = setTimeout(() => setCelebPhase('done'),     2400);
    celebTimers.current = [t1, t2];
    return () => celebTimers.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FTUE delayed until celebration settles (Option A)
  const showFtue = ftueVersion !== 'off' && (scenario.userType === 'new' || scenario.dbExperience === 'never' || scenario.dbExperience === 'used_before') && !ftueCompleted && totalLeads > 0 && celebPhase === 'done';

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

  function handleFreeUnlock(id: string) {
    setUnlockedIds(prev => new Set(prev).add(id));
    // No credit decrement — this is a free preview unlock
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
      {ftueVersion === 'v1' && showFtue && ftueOpen && (
        <FtueModal hasCredits={scenario.dbCredits > 0} leadsIndividual={leadsIndividual} onComplete={handleFtueComplete} />
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button aria-label="More options" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Location */}
            <span className="text-xs text-gray-400 mt-0.5 block">Saket, Delhi-NCR</span>

            {/* Underline tabs */}
            <div className="flex items-center gap-2 mt-5">
              <UnderlineTab active={tab === 'applied'} onClick={() => setTab('applied')}>
                Applied to job ({scenario.applicationsCount})
              </UnderlineTab>
              {leadsIndividual && (
                <span data-ftue="leads-tab">
                  <UnderlineTab active={tab === 'leads'} onClick={handleGoToLeads} highlight={totalLeads > 0}>
                    Hot Leads ({totalLeads})
                  </UnderlineTab>
                </span>
              )}
              <span data-ftue="database-tab">
                <UnderlineTab active={tab === 'database'} onClick={switchToDatabase} highlight={dbTotal > 0 && !leadsIndividual} disabled={dbTotal === 0}>
                  Database ({dbTotal})
                </UnderlineTab>
              </span>
            </div>
          </div>
        </div>
        </div>

      </div>

      {/* FTUE v2 — coach marks */}
      {ftueVersion === 'v2' && showFtue && ftueOpen && (() => {
        const coachSteps: CoachStep[] = [
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
          leadsIndividual
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
              },
        ];
        return <CoachMarks steps={coachSteps} onComplete={handleFtueComplete} />;
      })()}

      {/* Content */}
      <JobTabContext.Provider value={{ goToDatabase: handleExploreLeads }}>
      <div className="flex-1 overflow-hidden bg-gray-50 flex justify-center" style={{ padding: '12px 20px 23px' }}>
        <div className="flex w-full max-w-[1100px] gap-3 min-h-0">
        {tab === 'applied' && scenario.applicationsCount > 0 && <FiltersPanel mode="applied" />}
        {tab === 'leads' && leadsIndividual && <HotLeadsSummaryCard totalLeads={totalLeads} />}
        {tab === 'database' && dbTotal > 0 && <FiltersPanel mode="database" totalLeads={dbTotal} onInteract={enterDbSearch} onFiltersChange={setDbFilterValues} resetSignal={filterResetKey} hideLeadsCard={leadsIndividual} />}

        <div className="flex-1 overflow-y-auto bg-gray-50 min-w-0">
          {tab === 'applied' && (
            <div className="flex flex-col gap-3">
              {/* Status card — morphs from celebration → compact when jobAge=fresh */}
              {scenario.applicationsCount === 0 && (
                <JobStatusCard phase={celebPhase} totalLeads={totalLeads} dbTotal={dbTotal} jobAge={jobAge} />
              )}

              {/* Live leads widget — only when no applicants yet and leads exist */}
              {scenario.applicationsCount === 0 && totalLeads > 0 && celebPhase === 'done' && (
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
                />
              )}

              {/* Zero leads empty state */}
              {scenario.applicationsCount === 0 && totalLeads === 0 && (
                <NoLeadsCard dbTotal={dbTotal} jobAge={jobAge} onGoToDatabase={() => setTab('database')} />
              )}

              {/* Applied candidates from scenario */}
              <AppliedContent
                key={`applied-${scenarioId ?? 'dynamic'}`}
                totalLeads={totalLeads}
                dbCredits={scenario.dbCredits}
                applicantCount={scenario.applicationsCount}
                hasUsedDb={scenario.dbExperience === 'used_before' || scenario.dbExperience === 'used_leads'}
                dbTotal={dbTotal}
                unlockedIds={unlockedIds}
                creditsRemaining={creditsRemaining}
                onUnlock={handleUnlock}
                onUnlockAndView={handleUnlockAndView}
              />
            </div>
          )}

          {/* Standalone Hot Leads tab — leads only, unfiltered, with an index to the DB */}
          {tab === 'leads' && leadsIndividual && (
            <DatabaseTab
              key={`leads-${scenarioId ?? 'dynamic'}`}
              variant="leads"
              hasCredits={scenario.dbCredits > 0}
              credits={scenario.dbCredits}
              totalLeads={totalLeads}
              dbTotal={dbTotal}
              highlightLeadId={highlightLeadId}
              pendingHighlightId={pendingHighlightId}
              onHighlightClear={() => setHighlightLeadId(null)}
              unlockedIds={unlockedIds}
              creditsRemaining={creditsRemaining}
              onUnlock={handleUnlock}
              onFreeUnlock={handleFreeUnlock}
              ftueVersion={ftueVersion}
              onExploreDatabase={handleGoToDatabase}
            />
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
              onFreeUnlock={handleFreeUnlock}
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
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
    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f8268" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/></svg>
    : icon === 'clock'
    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;

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
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      )}
    </div>
  );
}

type CelebPhase = 'celebrate' | 'settling' | 'done';

function JobStatusCard({
  phase, totalLeads, dbTotal, jobAge,
}: {
  phase: CelebPhase; totalLeads: number; dbTotal: number; jobAge: JobAge;
}) {
  // Trigger initial fade-in without an animation class (avoids CSS animation/transition conflicts)
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAppeared(true), 50); return () => clearTimeout(t); }, []);

  const isDone = phase === 'done';

  let title: string;
  let iconStroke = '#1f8268';
  let iconBg = '#d1fae5';
  if (jobAge === 'aging') {
    title = 'Your job is in its final week.';
    iconStroke = '#b45309';
    iconBg = '#fef3c7';
  } else {
    title = 'Your job is live!';
  }

  const isCelebrating = phase === 'celebrate';
  // During settling we move toward compact positions but keep celebration text until done
  const compact = !isCelebrating;

  const T = 'all 520ms cubic-bezier(0.4, 0, 0.2, 1)';

  // Icon: 80px centered during celebrate → 40px top-left during compact
  // Use fixed px for all positions — no % in top/left — so the transition is a true diagonal
  // Celebration: card is 220px tall, icon is 80px → center Y = (220/2) - 40 = 70px
  // Celebration: icon centered horizontally via calc(50% - 40px) — card width is static so % is stable
  const iconSize  = compact ? 40             : 80;
  const iconTop   = compact ? 16             : 70;
  const iconLeft  = compact ? 20             : 'calc(50% - 40px)';
  const iconXform = 'none';   // no transform needed — position is fully encoded in top/left

  const textTop   = compact ? 18  : 170;
  const textLeft  = compact ? 76  : 20;
  const textRight = compact ? 20  : 20;
  const titleSize = compact ? 14  : 18;    // px

  return (
    <div
      className="relative bg-white rounded-xl border border-[#dfe1e6] overflow-hidden"
      style={{
        minHeight: isCelebrating ? 260 : 0,
        transition: 'min-height 520ms cubic-bezier(0.4, 0, 0.2, 1)',
        // Spacer: compact layer height (py-4 = 16px×2 + ~40px icon = 72px)
      }}
    >
      {/* Invisible in-flow spacer keeps compact height when min-height collapses */}
      <div style={{ height: 72 }} />

      {/* ── Icon — single element, morphs size + position ── */}
      <div
        style={{
          position: 'absolute',
          width:  iconSize,
          height: iconSize,
          top:    iconTop,
          left:   iconLeft,
          transform: iconXform,
          borderRadius: '50%',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: T,
        }}
      >
        <svg
          width="100%" height="100%"
          viewBox="0 0 48 48" fill="none"
        >
          <circle cx="24" cy="24" r="22" stroke={isCelebrating ? '#e7f9f9' : 'transparent'} strokeWidth="3" style={{ transition: T }} />
          <circle
            cx="24" cy="24" r="22"
            stroke={iconStroke} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="151" className="anim-circle"
            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: T }}
          />
          <polyline
            points="13,25 21,33 35,15"
            stroke={iconStroke} strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="36" className="anim-check"
          />
        </svg>
      </div>

      {/* ── Text block — single element, morphs position + size ── */}
      <div
        style={{
          position: 'absolute',
          top:    textTop,
          left:   textLeft,
          right:  textRight,
          textAlign: compact ? 'left' : 'center',
          transition: T,
          pointerEvents: isDone ? 'auto' : 'none',
        }}
      >
        <p
          style={{
            fontSize: titleSize,
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.4,
            margin: 0,
            textAlign: compact ? 'left' : 'center',
            whiteSpace: compact ? 'normal' : 'nowrap',
            opacity: isDone ? 1 : (appeared ? 1 : 0),
            transform: appeared && isCelebrating ? 'translateY(0)' : isCelebrating ? 'translateY(8px)' : 'none',
            transition: isCelebrating
              ? 'opacity 0.4s ease 0.8s, transform 0.4s ease 0.8s, font-size 520ms cubic-bezier(0.4,0,0.2,1)'
              : T,
          }}
        >
          {isDone ? title : 'Your job is live!'}
        </p>
        <p
          style={{
            fontSize: 12,
            color: compact ? '#6b7280' : '#9ca3af',
            marginTop: compact ? 2 : 6,
            lineHeight: 1.5,
            textAlign: compact ? 'left' : 'center',
            opacity: isDone ? 1 : (appeared ? 1 : 0),
            transform: isDone ? 'none' : (appeared ? 'translateY(0)' : 'translateY(8px)'),
            transition: 'opacity 0.4s ease 1.0s, transform 0.4s ease 1.0s',
          }}
        >
          {jobAge === 'aging'
            ? <>{dbTotal} candidates in the database match your role.{' '}<span className="font-medium text-amber-700">Reach out to them now — your job expires soon.</span></>
            : <>
                Finding matching candidates right now
                {!isDone && <span>…</span>}
                {isDone && totalLeads > 0 && (
                  <span className="anim-fade-in">
                    {' '}— meanwhile <span className="text-emerald-600 font-medium">{totalLeads} Hot Leads</span> from the apna database are already matching your requirements.
                  </span>
                )}
              </>
          }
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
