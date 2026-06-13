import { useState, type ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { JobTabContext } from '../context/JobTabContext';
import { SCENARIOS } from '../types';
import type { UserScenario, ScenarioProps } from '../types';
import { FiltersPanel } from '../components/FiltersPanel';
import { FtueModal } from '../components/FtueModal';
import { ProgressStrip } from '../components/ftue/ProgressStrip';
import { InlineTip } from '../components/ftue/InlineTip';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { DatabaseTab } from '../components/DatabaseTab';
import { NewNoCredits } from '../scenarios/NewNoCredits';
import { NewHasCredits } from '../scenarios/NewHasCredits';
import { OldNoCreditsUsedDb } from '../scenarios/OldNoCreditsUsedDb';
import { OldHasCreditsNeverDb } from '../scenarios/OldHasCreditsNeverDb';
import { OldHasCreditsUsedDb } from '../scenarios/OldHasCreditsUsedDb';

type Tab = 'applied' | 'database';

const APPLIED_TAB_CONTENT: Record<string, React.ComponentType<ScenarioProps>> = {
  'new-no-credits':           NewNoCredits,
  'new-has-credits':          NewHasCredits,
  'old-no-credits-used-db':   OldNoCreditsUsedDb,
  'old-has-credits-never-db': OldHasCreditsNeverDb,
  'old-has-credits-used-db':  OldHasCreditsUsedDb,
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
    dbExperience: exp as 'never' | 'used_before',
    jobLeads: leads,
    dbTotal,
    applicationsCount: apps,
    description: 'Configured via journey builder',
    userBehavior: '',
    productObjective: '',
    goal: '',
    nudgeVariant: nudge as UserScenario['nudgeVariant'],
  };
}

function getAppliedComponent(scenario: UserScenario): React.ComponentType<ScenarioProps> {
  if (scenario.dbCredits === 0)               return OldNoCreditsUsedDb;
  if (scenario.dbExperience === 'never')      return OldHasCreditsNeverDb;
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

  const ftueVersion = (params.get('ftue') ?? 'v2') as 'v1' | 'v2';

  const [tab, setTab] = useState<Tab>('applied');
  const [ftueCompleted, setFtueCompleted] = useState(false);
  const [ftueOpen, setFtueOpen] = useState(true);
  const [stripDismissed, setStripDismissed] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [dbTabVisited, setDbTabVisited] = useState(false);
  const [highlightLeadId, setHighlightLeadId] = useState<string | null>(null);

  // Shared unlock state — persists across tab switches
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [creditsRemaining, setCreditsRemaining] = useState(scenario.dbCredits);

  const jobAge = (params.get('age') ?? 'active') as 'fresh' | 'active' | 'aging';
  const totalLeads = scenario.jobLeads;
  const dbTotal = scenario.dbTotal;
  const showFtue = (scenario.userType === 'new' || scenario.dbExperience === 'never') && !ftueCompleted && totalLeads > 0;

  // Maps CANDIDATES ids to ACTIVE_LEADS ids in DatabaseTab
  const CANDIDATE_TO_LEAD_ID: Record<string, string> = {
    '1': 'al0', '2': 'al1', '3': 'al2',
  };

  function handleUnlock(id: string) {
    if (unlockedIds.has(id)) return;
    setUnlockedIds(prev => new Set(prev).add(id));
    setCreditsRemaining(r => Math.max(r - 1, 0));
  }

  function handleFreeUnlock(id: string) {
    setUnlockedIds(prev => new Set(prev).add(id));
    // No credit decrement — this is a free preview unlock
  }

  function handleUnlockAndView(candidateId: string) {
    // Register the free unlock so the card shows "Unlocked" when the user returns
    handleFreeUnlock(candidateId);
    const leadId = CANDIDATE_TO_LEAD_ID[candidateId];
    if (leadId) {
      setHighlightLeadId(leadId);
      switchToDatabase();
    }
  }

  function switchToDatabase() {
    if (!dbTabVisited) setDbTabVisited(true);
    setTab('database');
  }

  function handleFtueComplete() {
    setFtueCompleted(true);
    setFtueOpen(false);
  }

  return (
    <div className="flex flex-col flex-1" style={{ margin: '-23px -32px 0' }}>
      {/* FTUE v1 — modal */}
      {ftueVersion === 'v1' && showFtue && ftueOpen && (
        <FtueModal hasCredits={scenario.dbCredits > 0} onComplete={handleFtueComplete} />
      )}

      {/* Job header — sticky, full width, sits below the topbar */}
      <div className="sticky top-[62px] z-20 bg-white border-b border-gray-200">
        {/* Row 1: job info */}
        <div className="flex items-center gap-0 px-4 h-12">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center text-gray-500 mr-2 hover:bg-gray-100 rounded"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>

          <span className="text-sm font-semibold text-gray-900">Field Sales Executive</span>
          <span className="ml-2 px-2 py-0.5 bg-[#e7f9f9] text-[#1f8268] rounded-full text-[11px] font-semibold">Active</span>
          <div className="w-px h-4 bg-gray-300 mx-3" />
          <span className="text-xs text-gray-500">Saket, Delhi-NCR</span>
          <div className="w-px h-4 bg-gray-300 mx-3" />
          <button className="text-xs text-emerald-600 font-medium">Edit</button>
          <div className="flex-1" />

          <button className="w-8 h-8 flex items-center justify-center text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>

        {/* Row 2: segmented switch centered */}
        <div className="flex items-center justify-center border-t border-gray-100 py-2">
          <div className="flex items-center gap-2 bg-[#f4f5f7] border border-[#dfe1e6] rounded-full p-[3px]">
            <TabBtn active={tab === 'applied'} onClick={() => setTab('applied')}>
              Applied to job ({scenario.applicationsCount})
            </TabBtn>
            <TabBtn active={tab === 'database'} onClick={switchToDatabase} highlight={dbTotal > 0} disabled={dbTotal === 0}>
              Database ({dbTotal})
            </TabBtn>
          </div>
        </div>

        {/* FTUE v2 — progress strip */}
        {ftueVersion === 'v2' && showFtue && !stripDismissed && (
          <ProgressStrip unlockedCount={unlockedIds.size} onDismiss={() => setStripDismissed(true)} />
        )}
      </div>

      {/* Content */}
      <JobTabContext.Provider value={{ goToDatabase: () => setTab('database') }}>
      <div className="flex-1 overflow-hidden bg-gray-50 flex justify-center" style={{ padding: '12px 32px 23px' }}>
        <div className="flex w-full max-w-[1200px] gap-3 min-h-0">
        {tab === 'applied' && scenario.applicationsCount > 0 && <FiltersPanel mode="applied" />}
        {tab === 'database' && dbTotal > 0 && <FiltersPanel mode="database" totalLeads={dbTotal} />}

        <div className="flex-1 overflow-y-auto bg-gray-50 min-w-0">
          {tab === 'applied' && (
            <div className="flex flex-col gap-3">
              {/* Job posted success card — only when no applicants yet */}
              {scenario.applicationsCount === 0 && (
                <JobPostedCard totalLeads={totalLeads} dbTotal={dbTotal} jobAge={jobAge} />
              )}

              {/* Live leads widget — only when no applicants yet and leads exist */}
              {scenario.applicationsCount === 0 && totalLeads > 0 && (
                <ActiveLeadsTab
                  key={scenarioId ?? 'dynamic'}
                  totalLeads={totalLeads}
                  dbMatchCount={dbTotal}
                  hasCredits={scenario.dbCredits > 0}
                  credits={scenario.dbCredits}
                  hasUsedDb={scenario.dbExperience === 'used_before'}
                  unlockedCount={unlockedIds.size}
                  lockedCount={Math.max(totalLeads - unlockedIds.size, 0)}
                  showBuyCredits={scenario.dbCredits === 0}
                  onExploreAll={() => dbTotal > 0 && switchToDatabase()}
                  onGoToDatabase={() => dbTotal > 0 && switchToDatabase()}
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
                hasUsedDb={scenario.dbExperience === 'used_before'}
                dbTotal={dbTotal}
              />
            </div>
          )}

          {tab === 'database' && (
            <DatabaseTab
              key={scenarioId}
              hasCredits={scenario.dbCredits > 0}
              credits={scenario.dbCredits}
              totalLeads={totalLeads}
              dbTotal={dbTotal}
              highlightLeadId={highlightLeadId}
              onHighlightClear={() => setHighlightLeadId(null)}
              unlockedIds={unlockedIds}
              creditsRemaining={creditsRemaining}
              onUnlock={handleUnlock}
              onFreeUnlock={handleFreeUnlock}
              ftueVersion={ftueVersion}
              inlineTip={ftueVersion === 'v2' && showFtue && dbTabVisited && !tipDismissed
                ? <InlineTip creditsRemaining={creditsRemaining} onDismiss={() => setTipDismissed(true)} />
                : null}
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

function JobPostedCard({ totalLeads, dbTotal, jobAge }: { totalLeads: number; dbTotal: number; jobAge: JobAge }) {
  let title: string;
  let body: ReactNode;
  let iconColor = '#1F8268';
  let iconBg = 'bg-emerald-100';

  if (dbTotal === 0) {
    title = 'Your job has been successfully posted!';
    body = "We'll notify you as soon as candidates start applying.";
  } else if (totalLeads > 0) {
    title = 'Your job has been successfully posted!';
    body = <>No applicants yet — but{' '}
      <span className="text-emerald-600 font-medium">{totalLeads} live leads</span>
      {' '}from the apna database are already matching your requirements.</>;
  } else if (jobAge === 'aging') {
    title = 'Your job is in its final week.';
    body = <>{dbTotal} candidates in the database match your role.{' '}
      <span className="font-medium text-amber-700">Reach out to them now — your job expires soon.</span></>;
    iconColor = '#b45309';
    iconBg = 'bg-amber-100';
  } else {
    // fresh or active, leads=0, db>0 — positive, no alarm
    title = 'Your job has been successfully posted!';
    body = `${dbTotal} candidates in the database match your requirements. We'll surface live leads as candidates become active.`;
  }

  return (
    <div className="bg-white rounded-xl border border-[#dfe1e6] px-5 py-4 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function TabBtn({
  children, active, onClick, highlight, disabled,
}: {
  children: React.ReactNode; active: boolean; onClick: () => void; highlight?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`flex items-center gap-1.5 px-6 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
        disabled
          ? 'text-[#c1c7d0] font-normal cursor-not-allowed'
          : active
          ? 'bg-[#172b4d] text-white font-semibold'
          : 'text-[#8c8594] font-normal hover:text-gray-600'
      }`}
    >
      {highlight && !active && !disabled && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
      )}
      {children}
    </button>
  );
}
