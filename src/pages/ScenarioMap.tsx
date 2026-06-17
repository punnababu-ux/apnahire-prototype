import { Link } from 'react-router-dom';

// ─── types ────────────────────────────────────────────────────────────────────
type HotLeadsTreatment = 'lead' | 'end' | 'none';
interface Outcome { applied: HotLeadsTreatment; appliedNote: string; db: string }
interface AppsCase { label: string; outcomes: { leads: string; outcome: Outcome }[] }
interface ComponentEntry {
  id: string;
  tag: string;
  tagColor: string;
  name: string;
  trigger: string;
  component: string;
  /** Forward-looking note: what code change is needed to match this spec. Omit when code already matches. */
  align?: string;
  apps: AppsCase[];
}

// ─── DB tab — single unlock flow. The CTA is ALWAYS "View Profile" (Applied tab) → ──
// it opens the profile in the DB tab. Unlocking the phone there spends 1 credit; with
// no credits the "not enough credits" popup appears with a Buy credits CTA. The profile
// is never "locked" from view — only the unlock action branches on credits.
const DB = {
  // Same string whether or not the recruiter has credits — credits only change what
  // happens AFTER they attempt the unlock, not whether the profile opens.
  leads: 'Hot Leads pinned at top. "View Profile" opens the profile here → unlocking reveals the phone (1 credit) · no credits → "not enough credits" popup → Buy credits.',
  noLeads: 'No Hot Leads pinned. DB profiles open via "View Profile" → same unlock-or-buy-credits-popup flow.',
  empty: 'No Hot Leads pinned · DB empty when size = none.',
};

// Treatment-note builders (placement × credit treatment overlay)
const LEAD_SHARED_CREDIT = 'Hot Leads lead — JobDetail shared ActiveLeadsTab (default header). Cards "View Profile". Footer: "{N} credits available — view a profile to unlock & contact".';
const LEAD_SHARED_NOCREDIT = 'Hot Leads lead — JobDetail shared ActiveLeadsTab (default header). First card = free preview (blurred phone) + "How it works". Footer: buy / top-up CTA.';
const LEAD_TOP_CREDIT = 'Hot Leads lead — ActiveLeadsTab at top (custom header), single. Organic is thin, DB is the bigger opportunity. Cards "View Profile".';
const END_CREDIT = 'Organic leads — AppliedCandidateList · LiveLeadsMidFeedCard ingress at end. Substantial organic — don\'t interrupt.';
const END_NOCREDIT = 'Organic leads — AppliedCandidateList · LiveLeadsMidFeedCard ingress at end. Can\'t action without credits — repurchase nudge.';
const NONE = 'No Hot Leads card (jobLeads = 0).';

// ─── data (INTENDED DESIGN — one Hot Leads placement per cell) ──────────────────
const COMPONENTS: ComponentEntry[] = [
  {
    id: 'new-no-credits',
    tag: 'Cold Start',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    name: 'New · No Credits',
    trigger: 'userType=new · credits=0',
    component: 'NewNoCredits',
    apps: [
      {
        label: 'No applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_NOCREDIT + ' Footer: "buy credits to view & contact".', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'JobStatusCard + NoLeadsCard.', db: DB.empty } },
        ],
      },
      {
        label: 'Any applicants (1+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: END_NOCREDIT + ' Ingress CTA: "Explore Hot Leads".', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
    ],
  },
  {
    id: 'new-has-credits',
    tag: 'Ready to Go',
    tagColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    name: 'New · Has Credits',
    trigger: 'userType=new · credits>0',
    component: 'NewHasCredits',
    apps: [
      {
        label: 'No applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'JobStatusCard + NoLeadsCard.', db: DB.noLeads } },
        ],
      },
      {
        label: 'Few applicants (1–4)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_TOP_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
      {
        label: 'Many applicants (5+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: END_CREDIT + ' ActiveLeadsTab suppressed (applicantCount ≥ 5).', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
    ],
  },
  {
    id: 'old-no-credits',
    tag: 'No Credits',
    tagColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    name: 'Returning · No Credits',
    trigger: 'userType=old · credits=0 (any dbExperience)',
    component: 'OldNoCreditsUsedDb',
    apps: [
      {
        label: 'No applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_NOCREDIT + ' Footer: "top up" if previously used DB, else "buy credits".', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'JobStatusCard + NoLeadsCard.', db: DB.empty } },
        ],
      },
      {
        label: 'Any applicants (1+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: END_NOCREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
    ],
  },
  {
    id: 'old-has-credits-never-db',
    tag: 'Untapped Budget',
    tagColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    name: 'Returning · Has Credits · Never Used DB',
    trigger: 'userType=old · credits>0 · dbExperience=never',
    component: 'OldHasCreditsNeverDb',
    apps: [
      {
        label: 'No applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'JobStatusCard + NoLeadsCard.', db: DB.noLeads } },
        ],
      },
      {
        label: 'Few applicants (1–4)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_TOP_CREDIT + ' First DB interaction — make unlocking effortless.', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
      {
        label: 'Many applicants (5+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: END_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
    ],
  },
  {
    id: 'old-has-credits-used-before',
    tag: 'Knows Feature',
    tagColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    name: 'Returning · Has Credits · Used DB, New to Leads',
    trigger: 'userType=old · credits>0 · dbExperience=used_before',
    component: 'OldHasCreditsNewToLeads',
    apps: [
      {
        label: 'No applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'JobStatusCard + NoLeadsCard.', db: DB.noLeads } },
        ],
      },
      {
        label: 'Few applicants (1–4)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_TOP_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
      {
        label: 'Many applicants (5+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: END_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
    ],
  },
  {
    id: 'old-has-credits-used-leads',
    tag: 'Returning Pro',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    name: 'Returning · Has Credits · Used Leads Before',
    trigger: 'userType=old · credits>0 · dbExperience=used_leads',
    component: 'OldHasCreditsUsedLeads',
    apps: [
      {
        label: 'No applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_CREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'JobStatusCard + NoLeadsCard.', db: DB.noLeads } },
        ],
      },
      {
        label: 'Few applicants (1–4)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_TOP_CREDIT + ' No hand-holding copy — they know the flow.', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
      {
        label: 'Many applicants (5+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: END_CREDIT + ' They self-serve from the DB tab.', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: NONE, db: DB.noLeads } },
        ],
      },
    ],
  },
  {
    id: 'old-has-credits-power-user',
    tag: 'Power User',
    tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    name: 'Returning · Has Credits · Power User (fixed scenario)',
    trigger: 'scenario=old-has-credits-used-db only (dynamic switch is exhaustive; getAppliedComponent line 68 fallback is dead code)',
    component: 'OldHasCreditsUsedDb',
    apps: [
      {
        label: 'With applicants (fixed scenario = 8 apps, i.e. 5+)',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: 'Custom card view (High + Medium Matches) · LiveLeadsMidFeedCard at end. Does NOT use AppliedCandidateList. Efficiency mode.', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: 'Custom card view only.', db: DB.noLeads } },
        ],
      },
    ],
  },
];

const TREATMENT_STYLES: Record<HotLeadsTreatment, string> = {
  'lead': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'end':  'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'none': 'bg-gray-800 text-gray-500 border-gray-700',
};

const TREATMENT_LABELS: Record<HotLeadsTreatment, string> = {
  'lead': '🔥 Hot Leads lead',
  'end':  '⬇ Hot Leads at end',
  'none': '— No lead card',
};

const RULE_ROWS = [
  { cond: '0 applicants', rule: 'Hot Leads lead (shared ActiveLeadsTab — the only signal)' },
  { cond: '1–4 applicants · has credits', rule: 'Hot Leads lead (ActiveLeadsTab at top, single)' },
  { cond: '1–4 applicants · no credits', rule: 'Ingress at end — can\'t action, drive repurchase' },
  { cond: '5+ applicants', rule: 'Ingress at end (organic leads, don\'t interrupt)' },
  { cond: 'CTA (every Hot Lead)', rule: 'Always "View Profile" → opens the profile in the DB tab. Never an unlock/buy button in the Applied tab.' },
  { cond: 'Unlock (no credits)', rule: 'Profile still opens via "View Profile". The unlock attempt triggers the "not enough credits" popup → Buy credits.' },
];

// Hot Leads location — configurable via Archetypes "Hot Leads location" toggle.
// The placement rule above is IDENTICAL in both modes; only the destination + where
// leads physically live differ.
const LOCATION_MODES = [
  {
    tag: 'Default',
    tagColor: 'text-gray-300 border-gray-600 bg-gray-700/40',
    name: 'Part of Database',
    trigger: 'leadsLocation = "database" (or unset)',
    points: [
      'Hot Leads are pinned inside the Database tab (teal container at the top).',
      'Applied-tab CTAs ("View Profile", "Explore Hot Leads") → Database tab.',
      'Database filter rail shows the Hot Leads summary card; green "active" dot sits on the Database tab.',
      'The component matrix below describes this mode.',
    ],
  },
  {
    tag: 'Own tab',
    tagColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    name: 'Dedicated Hot Leads tab',
    trigger: 'leadsLocation = "individual"  ·  Archetypes → Hot Leads location → Own tab',
    points: [
      'A "Hot Leads (N)" tab sits between Applied and Database (always shown in this mode).',
      'Leads render in the teal container, unfiltered, with a slim "Explore Database →" index at the end. Left rail = Hot Leads summary card.',
      'Applied-tab CTAs → the Hot Leads tab (skeleton → highlight there), not the Database.',
      'Database tab is cleaned of Hot Leads (no pinned section, no summary card) and its filters open expanded; the green "active" dot moves to the Hot Leads tab.',
      'FTUE (coach marks + modal) reference the Hot Leads tab instead of the database.',
    ],
  },
];

export function ScenarioMap() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-14">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="mb-4">
            <Link to="/archetypes" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Archetypes</Link>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-bold text-base">apna<span className="text-emerald-400">Hire</span></span>
            <span className="text-gray-700">·</span>
            <span className="text-gray-500 text-sm">Database adoption · Design prototype</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Scenario Map</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Design spec — exactly one Hot Leads placement per cell, across every component, applicant
            volume, and lead volume. Hot Leads can live <span className="text-gray-300">inside the Database tab</span> or
            in <span className="text-gray-300">their own tab</span> (see below); the placement rule is the same either way.
            The code is aligned to this spec (verified).
          </p>
        </div>

        {/* Placement rule */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Placement rule — Applied to Job tab</p>
          </div>
          <div className="divide-y divide-gray-800">
            {RULE_ROWS.map(r => (
              <div key={r.cond} className="px-6 py-3 flex items-start gap-6">
                <span className="text-sm font-semibold text-gray-300 w-60 flex-shrink-0">{r.cond}</span>
                <span className="text-sm text-gray-400">{r.rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Leads location */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hot Leads location — configurable</p>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {LOCATION_MODES.map(m => (
              <div key={m.name} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.tagColor}`}>{m.tag}</span>
                  <span className="text-sm font-semibold text-white">{m.name}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-mono mb-3">{m.trigger}</p>
                <ul className="flex flex-col gap-1.5">
                  {m.points.map((p, i) => (
                    <li key={i} className="text-[12px] text-gray-400 leading-relaxed flex gap-2">
                      <span className="text-gray-600 flex-shrink-0">·</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-800 bg-gray-900/50">
            <p className="text-[12px] text-gray-400 leading-relaxed">
              <span className="font-semibold text-gray-300">Placement is identical in both modes</span> — only the destination
              and where leads live differ. The matrix below applies to both; in Own-tab mode, read "Database tab" as "Hot Leads tab"
              for the lead destination.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(Object.keys(TREATMENT_LABELS) as HotLeadsTreatment[]).map(t => (
            <span key={t} className={`inline-flex items-center text-[11px] font-semibold px-3 py-1 rounded-full border ${TREATMENT_STYLES[t]}`}>
              {TREATMENT_LABELS[t]}
            </span>
          ))}
        </div>

        {/* Component sections */}
        <div className="space-y-6">
          {COMPONENTS.map(comp => (
            <div key={comp.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

              {/* Component header */}
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${comp.tagColor}`}>{comp.tag}</span>
                  <code className="text-[10px] text-gray-600 font-mono">{comp.component}</code>
                </div>
                <p className="text-sm font-semibold text-white">{comp.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{comp.trigger}</p>
              </div>

              {/* Alignment banner */}
              {comp.align && (
                <div className="px-6 py-2.5 bg-amber-500/8 border-b border-amber-500/20 flex items-start gap-2">
                  <span className="text-amber-400 text-[11px] font-bold flex-shrink-0 mt-0.5">⟳ ALIGN CODE</span>
                  <p className="text-amber-300/80 text-[11px] leading-relaxed">{comp.align}</p>
                </div>
              )}

              {/* Apps cases */}
              <div className="divide-y divide-gray-800">
                {comp.apps.map((appsCase, ai) => (
                  <div key={ai} className="grid grid-cols-[160px_1fr] divide-x divide-gray-800">
                    <div className="px-5 py-4 flex items-start">
                      <span className="text-[11px] font-semibold text-gray-400 leading-snug">{appsCase.label}</span>
                    </div>
                    <div className="divide-y divide-gray-800/60">
                      {appsCase.outcomes.map((o, oi) => (
                        <div key={oi} className="grid grid-cols-[120px_1fr_220px] divide-x divide-gray-800/60">
                          <div className="px-4 py-3 flex items-start">
                            <span className="text-[10px] text-gray-600 font-medium leading-snug">{o.leads}</span>
                          </div>
                          <div className="px-4 py-3">
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mb-1.5 ${TREATMENT_STYLES[o.outcome.applied]}`}>
                              {TREATMENT_LABELS[o.outcome.applied]}
                            </span>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{o.outcome.appliedNote}</p>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-[11px] text-gray-400 leading-relaxed">{o.outcome.db}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Column key */}
        <div className="mt-6 grid grid-cols-[160px_120px_1fr_220px] gap-0 px-6">
          <div /><div className="px-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest">Leads</div>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Applied to Job tab treatment</p>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Database tab state</p>
        </div>

        <p className="text-xs text-gray-700 text-center mt-10">
          One Hot Leads placement per cell · CTA always "View Profile" → DB tab · unlock spends 1 credit, no credits → buy-credits popup
        </p>
      </div>
    </div>
  );
}
