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

// Short, scannable cell labels (the badge carries the main signal; these add one line).
const DB = {
  leads: 'Pinned · unlock here',
  noLeads: 'DB profiles only',
  empty: 'Empty',
};

const LEAD_SHARED_CREDIT = 'Full widget at top';
const LEAD_SHARED_NOCREDIT = 'Full widget · 1st card free';
const LEAD_TOP_CREDIT = 'Widget at top';
const END_CREDIT = 'Ingress at end';
const END_NOCREDIT = 'Ingress at end · repurchase';
const NONE = '';

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
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_NOCREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.empty } },
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
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.noLeads } },
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
          { leads: 'Leads > 0', outcome: { applied: 'lead', appliedNote: LEAD_SHARED_NOCREDIT, db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.empty } },
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
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.noLeads } },
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
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.noLeads } },
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
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.noLeads } },
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
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: 'Custom card view · ingress at end', db: DB.leads } },
          { leads: 'No leads',  outcome: { applied: 'none', appliedNote: '', db: DB.noLeads } },
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
  { cond: '0 applicants', rule: 'Hot Leads lead' },
  { cond: '1–4 · has credits', rule: 'Hot Leads lead (widget at top)' },
  { cond: '1–4 · no credits', rule: 'Ingress at end' },
  { cond: '5+ applicants', rule: 'Ingress at end' },
  { cond: 'CTA', rule: 'Always "View Profile" — never unlock/buy in the Applied tab' },
  { cond: 'No credits', rule: 'Unlock → "not enough credits" popup → Buy credits' },
];

// Hot Leads location — configurable via Archetypes "Hot Leads location" toggle.
// The placement rule above is IDENTICAL in both modes; only the destination + where
// leads physically live differ.
const LOCATION_MODES = [
  {
    tag: 'Default',
    tagColor: 'text-gray-300 border-gray-600 bg-gray-700/40',
    name: 'Part of Database',
    trigger: 'default',
    points: [
      'Hot Leads pinned inside the Database tab.',
      'Applied CTAs & green dot → Database tab.',
    ],
  },
  {
    tag: 'Own tab',
    tagColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    name: 'Dedicated Hot Leads tab',
    trigger: 'Archetypes → Hot Leads location → Own tab',
    points: [
      'Own "Hot Leads" tab between Applied & Database.',
      'Leads in the teal container + "Explore Database" link.',
      'Removed from the Database tab; Applied CTAs, green dot & FTUE point here.',
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
            One Hot Leads placement per scenario. Hot Leads can live in the Database tab or their own tab — same rule either way.
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
                            {o.outcome.appliedNote && <p className="text-[11px] text-gray-500 leading-relaxed">{o.outcome.appliedNote}</p>}
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
          CTA is always "View Profile" → unlock happens in the DB / Hot Leads tab (buy-credits popup if no credits)
        </p>
      </div>
    </div>
  );
}
