import { useState } from 'react';
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
  /** How copy/treatment varies *within* this one component by familiarity (dbExperience). */
  note?: string;
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

// ─── Component Placement data ───────────────────────────────────────────────────
const COMPONENTS: ComponentEntry[] = [
  {
    id: 'no-credits',
    tag: 'No Credits',
    tagColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    name: 'No Credits — new or returning',
    trigger: 'dbCredits = 0',
    component: 'NoCreditsApplied',
    note: 'Nudge banner: "repurchase / top up" if they\'ve used Hot Leads before, else "buy credits" intro. Layout is identical either way.',
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
    id: 'has-credits',
    tag: 'Has Credits',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    name: 'Has Credits — new or returning',
    trigger: 'dbCredits > 0',
    component: 'HasCreditsApplied',
    note: 'Header + "how it works" explainer adapt to familiarity: confident, no hand-holding for recruiters who\'ve used Hot Leads before; an encouraging intro for everyone new to Hot Leads. Placement is identical either way.',
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
    id: 'power-user',
    tag: 'Power User',
    tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    name: 'Power User (fixed scenario)',
    trigger: 'scenario=old-has-credits-used-db only · not in dynamic routing',
    component: 'OldHasCreditsUsedDb',
    apps: [
      {
        label: 'With applicants',
        outcomes: [
          { leads: 'Leads > 0', outcome: { applied: 'end',  appliedNote: 'Custom detailed applicant view · ingress at end', db: DB.leads } },
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

const LOCATION_MODES = [
  {
    tag: 'Default',
    tagColor: 'text-gray-300 border-gray-600 bg-gray-700/40',
    name: 'Part of Database',
    trigger: 'default',
    points: [
      'Hot Leads segmented inside the Database tab.',
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

// ─── Scenario Map data ──────────────────────────────────────────────────────────
const SCENARIO_ROWS = [
  {
    id: 'new-no-credits',
    name: 'New · No Credits',
    tag: 'Cold Start',
    tagColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    credits: 0,
    familiarity: 'Naive (never)',
    goal: 'Motivate credit purchase',
    zeroApps: {
      widget: 'ActiveLeadsTab shown',
      pill: '0 Database Credits',
      cta: 'Buy credits'
    },
    hasApps: {
      widget: 'Mid-feed Nudge banner',
      copy: '"{totalLeads} Hot Leads from apna\'s database are actively looking and match this job — buy credits..."',
      cta: 'Buy credits'
    },
    databaseTab: {
      filters: 'All: Filters Panel visible | Hot Leads: Filters Panel hidden',
      emptyState: 'All: "No candidates match..." | Hot Leads: "No Hot Leads active..."'
    },
    ftue: 'Eligible (modal/coachmarks)'
  },
  {
    id: 'new-has-credits',
    name: 'New · Has Credits',
    tag: 'Ready to Go',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    credits: 10,
    familiarity: 'Naive (never)',
    goal: 'Drive first DB unlock',
    zeroApps: {
      widget: 'ActiveLeadsTab shown',
      pill: '10 Database Credits',
      cta: 'None'
    },
    hasApps: {
      widget: 'Top Widget (if 1-4 apps) or End-feed Ingress (if 5+)',
      copy: '"Only {applicantCount} applicants so far — but {totalLeads} Hot Leads are ready"',
      cta: 'Unlock profile (1 credit)'
    },
    databaseTab: {
      filters: 'All: Filters Panel visible | Hot Leads: Filters Panel hidden',
      emptyState: 'All: "No candidates match..." | Hot Leads: "No Hot Leads active..."'
    },
    ftue: 'Eligible (modal/coachmarks)'
  },
  {
    id: 'old-no-credits-used-db',
    name: 'Old · No Credits',
    tag: 'No Credits',
    tagColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    credits: 0,
    familiarity: 'Familiar (used_before)',
    goal: 'Drive credit repurchase',
    zeroApps: {
      widget: 'ActiveLeadsTab shown',
      pill: '0 Database Credits',
      cta: 'Buy credits'
    },
    hasApps: {
      widget: 'Mid-feed Nudge banner',
      copy: '"You\'ve unlocked Hot Leads before — {totalLeads} more are waiting. Top up credits..."',
      cta: 'Top up credits'
    },
    databaseTab: {
      filters: 'All: Filters Panel visible | Hot Leads: Filters Panel hidden',
      emptyState: 'All: "No candidates match..." | Hot Leads: "No Hot Leads active..."'
    },
    ftue: 'Eligible (modal/coachmarks)'
  },
  {
    id: 'old-has-credits-never-db',
    name: 'Old · Has Credits · DB-Naive',
    tag: 'Untapped Budget',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    credits: 15,
    familiarity: 'Naive (never)',
    goal: 'Drive first DB interaction',
    zeroApps: {
      widget: 'ActiveLeadsTab shown',
      pill: '15 Database Credits',
      cta: 'None'
    },
    hasApps: {
      widget: 'Top Widget (if 1-4 apps) or End-feed Ingress (if 5+)',
      copy: '"Only {applicantCount} applicants so far — but {totalLeads} Hot Leads are ready"',
      cta: 'Unlock profile (1 credit)'
    },
    databaseTab: {
      filters: 'All: Filters Panel visible | Hot Leads: Filters Panel hidden',
      emptyState: 'All: "No candidates match..." | Hot Leads: "No Hot Leads active..."'
    },
    ftue: 'Eligible (modal/coachmarks)'
  },
  {
    id: 'old-has-credits-used-leads',
    name: 'Old · Has Credits · Used Leads',
    tag: 'Returning Pro',
    tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    credits: 6,
    familiarity: 'Familiar (used_leads)',
    goal: 'Drive immediate unlock',
    zeroApps: {
      widget: 'ActiveLeadsTab shown',
      pill: '6 Database Credits',
      cta: 'None'
    },
    hasApps: {
      widget: 'Top Widget (if 1-4 apps) or End-feed Ingress (if 5+)',
      copy: '"{totalLeads} Hot Leads matched for this role"',
      cta: 'Unlock profile (1 credit)'
    },
    databaseTab: {
      filters: 'All: Filters Panel visible | Hot Leads: Filters Panel hidden',
      emptyState: 'All: "No candidates match..." | Hot Leads: "No Hot Leads active..."'
    },
    ftue: 'Skipped (already familiar)'
  },
  {
    id: 'old-has-credits-used-db',
    name: 'Old · Has Credits · Used DB',
    tag: 'Power User',
    tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    credits: 8,
    familiarity: 'Familiar (used_before)',
    goal: 'Maximise unlock rates',
    zeroApps: {
      widget: 'ActiveLeadsTab shown',
      pill: '8 Database Credits',
      cta: 'None'
    },
    hasApps: {
      widget: 'Top Widget (if 1-4 apps) or End-feed Ingress (if 5+)',
      copy: '"Only {applicantCount} applicants so far — but {totalLeads} Hot Leads are ready"',
      cta: 'Unlock profile (1 credit)'
    },
    databaseTab: {
      filters: 'All: Filters Panel visible | Hot Leads: Filters Panel hidden',
      emptyState: 'All: "No candidates match..." | Hot Leads: "No Hot Leads active..."'
    },
    ftue: 'Eligible (modal/coachmarks)'
  }
];

export function ScenarioMap() {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'components'>('scenarios');

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-14">
      <div className="max-w-6xl mx-auto">

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
          <h1 className="text-3xl font-bold text-white mb-2">Scenario &amp; Component Map</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
            This map highlights exactly how headers, nudges, empty states, and FTUE guides adapt dynamically based on 
            user budget (credits), familiarity (dbExperience), and organic applicant volumes.
          </p>
        </div>

        {/* Switcher Tabs */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'scenarios'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Scenario Messaging Matrix
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'components'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Component Placement Rules
          </button>
        </div>

        {activeTab === 'scenarios' ? (
          /* TAB 1: SCENARIOS MATRIX */
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">6 Target User Scenarios</h3>
                <p className="text-xs text-gray-400 mt-1">Cross-component view of messaging and treatments adapted to specific user segment states.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] text-gray-300 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/60 font-semibold text-gray-400">
                      <th className="px-5 py-3.5 w-[220px]">Scenario &amp; Goal</th>
                      <th className="px-5 py-3.5 w-[130px]">State Variables</th>
                      <th className="px-5 py-3.5">Applied Tab (0 applicants)</th>
                      <th className="px-5 py-3.5">Applied Tab (1+ applicants)</th>
                      <th className="px-5 py-3.5">Database Tab &amp; Filters</th>
                      <th className="px-5 py-3.5 w-[140px]">FTUE Tour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {SCENARIO_ROWS.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-800/10 transition-colors align-top">
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-white text-sm">{row.name}</span>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border self-start ${row.tagColor}`}>
                              {row.tag}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-1 leading-snug">{row.goal}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1 text-[11px] text-gray-400">
                            <span className="font-mono text-gray-300">Credits: {row.credits}</span>
                            <span className="capitalize">{row.familiarity}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5 leading-snug">
                            <span className="font-medium text-gray-300">{row.zeroApps.widget}</span>
                            <span className="text-gray-500 font-mono text-[11px] bg-gray-800/30 px-1.5 py-0.5 rounded border border-gray-800/50 self-start">
                              {row.zeroApps.pill}
                            </span>
                            {row.zeroApps.cta && (
                              <span className="text-[11px] text-emerald-400">CTA: {row.zeroApps.cta}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5 leading-snug">
                            <span className="font-medium text-gray-300">{row.hasApps.widget}</span>
                            <p className="text-gray-500 italic text-[11px]">{row.hasApps.copy}</p>
                            <span className="text-[11px] text-emerald-400 font-semibold">CTA: {row.hasApps.cta}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5 leading-snug">
                            <span className="text-gray-300">{row.databaseTab.filters}</span>
                            <span className="text-gray-500 text-[11px]">{row.databaseTab.emptyState}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-gray-300">{row.ftue}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: COMPONENT PLACEMENT RULES */
          <div className="space-y-8">
            {/* Placement rule */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
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
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
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
            <div className="flex flex-wrap gap-2">
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

                  {/* Familiarity note — how copy/treatment varies within this one component */}
                  {comp.note && (
                    <div className="px-6 py-2.5 bg-gray-800/40 border-b border-gray-800 flex items-start gap-2">
                      <span className="text-gray-400 text-[11px] font-bold flex-shrink-0 mt-0.5">BY FAMILIARITY</span>
                      <p className="text-gray-400 text-[11px] leading-relaxed">{comp.note}</p>
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
            <div className="grid grid-cols-[160px_120px_1fr_220px] gap-0 px-6">
              <div /><div className="px-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest">Leads</div>
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Applied to Job tab treatment</p>
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Database tab state</p>
            </div>

            <p className="text-xs text-gray-700 text-center mt-10">
              CTA is always "View Profile" → unlock happens in the DB / Hot Leads tab (buy-credits popup if no credits)
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
