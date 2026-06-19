import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// "Recruiter experience" is a single 3-state axis (replaces the old tenure + DB-history pair).
// It is the only thing that tunes copy/FTUE/nudges — which component renders depends only on credits.
type Experience = 'never' | 'used_db' | 'used_leads';
type Credits  = 'none' | 'has';
type DbSize   = 'none' | 'has';
type LeadVol  = 'zero' | 'low' | 'normal';
type AppVol   = 'zero' | 'few' | 'many';
type JobAge   = 'fresh' | 'active' | 'aging';
type LeadsLoc = 'database' | 'individual';

interface Config {
  experience: Experience;
  credits:    Credits;
  db:         DbSize;
  leads:      LeadVol;
  apps:       AppVol;
  age:        JobAge;
  leadsLoc?:  LeadsLoc;
}

const DEFAULT_CONFIG: Config = {
  experience: 'never', credits: 'none', db: 'has', leads: 'normal', apps: 'zero', age: 'active', leadsLoc: 'database',
};

const PRESETS: Array<{ label: string; color: string; config: Config }> = [
  {
    label: 'Cold Start',
    color: 'border-amber-500/40 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10',
    config: { experience: 'never', credits: 'none', db: 'has', leads: 'normal', apps: 'zero', age: 'active' },
  },
  {
    label: 'Ready to Go',
    color: 'border-blue-500/40 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10',
    config: { experience: 'never', credits: 'has', db: 'has', leads: 'low', apps: 'zero', age: 'active' },
  },
  {
    label: 'No Credits',
    color: 'border-red-500/40 text-red-400 hover:border-red-400 hover:bg-red-500/10',
    config: { experience: 'used_db', credits: 'none', db: 'has', leads: 'normal', apps: 'few', age: 'active' },
  },
  {
    label: 'Untapped Budget',
    color: 'border-teal-500/40 text-teal-400 hover:border-teal-400 hover:bg-teal-500/10',
    config: { experience: 'never', credits: 'has', db: 'has', leads: 'normal', apps: 'few', age: 'active' },
  },
  {
    label: 'Power User',
    color: 'border-emerald-500/40 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10',
    config: { experience: 'used_leads', credits: 'has', db: 'has', leads: 'normal', apps: 'many', age: 'active' },
  },
];

function configMatches(a: Config, b: Config) {
  return a.experience === b.experience && a.credits === b.credits &&
    a.db === b.db && a.leads === b.leads && a.apps === b.apps && a.age === b.age &&
    (a.leadsLoc ?? 'database') === (b.leadsLoc ?? 'database');
}

function computeSummary(c: Config): { situation: string; goal: string; warnings: string[] } {
  const tenure  = c.experience === 'never' ? 'First-time recruiter.' : 'Returning recruiter.';
  const agePart = c.age === 'fresh' && c.leads !== 'zero' ? 'Job just posted (< 1 day) — some DB candidates are already active as Hot Leads.'
                : c.age === 'fresh'  ? 'Job just posted (< 1 day) — no active leads yet.'
                : c.age === 'aging'  ? 'Job in its final week (day 8–14) — expires soon.'
                :                     'Job has been live 1–7 days.';
  const appPart = c.apps   === 'zero' ? 'No organic applications yet.'
                : c.apps   === 'few'  ? 'A handful of organic applications coming in.'
                :                       'Strong organic application flow.';
  const dbPart  = c.db === 'none'   ? 'No candidates exist in the apna database for this job.'
                :                    'A healthy pool of matching candidates in the database.';
  const leadPart = c.db === 'none'    ? ''
                 : c.leads === 'zero' ? 'None are currently active/looking.'
                 : c.leads === 'low'  ? 'Only a few are currently active (1–5).'
                 :                     'A good pool are actively looking (6+).';
  const creditPart = c.credits === 'none'
    ? (c.experience === 'never' ? 'Has never tried DB and has no credits.' : 'Credits depleted after past DB use.')
    : c.experience === 'never' ? 'Has credits sitting unused — never tried DB.'
    : c.experience === 'used_leads' ? 'Has used Hot Leads before and has credits. Knows the feature, ready to act.'
    : 'Has used the database before but is new to Hot Leads — credits available.';

  const situation = [tenure, agePart, appPart, dbPart, leadPart, creditPart].filter(Boolean).join(' ');

  let goal: string;
  if (c.db === 'none' && c.age === 'aging') {
    goal = 'Last chance to help. Strongly push the recruiter to broaden requirements before the job expires.';
  } else if (c.db === 'none') {
    goal = 'Inform honestly. Guide the recruiter to broaden their job requirements.';
  } else if (c.age === 'fresh') {
    goal = 'Set expectations — applications are just starting. Surface any Hot Leads already active and reassure the recruiter that more are coming.';
  } else if (c.leads === 'zero' && c.age === 'aging') {
    goal = 'Create urgency — the job is expiring and no Hot Leads are active yet. Flag the deadline and alert the recruiter the moment a match becomes active.';
  } else if (c.leads === 'zero') {
    goal = 'Manage expectations. Matches exist but none are active right now — reassure the recruiter and alert them when Hot Leads become active.';
  } else if (c.credits === 'none') {
    // No credits → never-tried recruiters get a first-purchase intro nudge; recruiters
    // who used Hot Leads before get a repurchase/top-up nudge that reinforces past value.
    // (Matches AppliedCandidateList's nudge banner, keyed on the same signal.)
    goal = c.experience === 'never'
      ? 'Introduce database value. Motivate the first credit purchase.'
      : 'Reinforce past DB value. Drive credit top-up.';
  } else if (c.experience === 'never') {
    // Has credits, never tried DB → drive the first unlock (HasCreditsApplied).
    goal = 'Drive the first Hot Leads unlock — make it feel effortless.';
  } else if (c.experience === 'used_db') {
    // Has credits, used DB but new to Hot Leads → introduce the feature (HasCreditsApplied).
    goal = 'Introduce Hot Leads to a returning DB user. Make the first unlock easy.';
  } else {
    // Has credits, used Hot Leads before → confident, no hand-holding (HasCreditsApplied).
    goal = 'Surface best matches fast — no hand-holding. Keep hiring momentum going.';
  }

  const warnings: string[] = [];
  if (c.db === 'none' && c.leads !== 'zero')
    warnings.push('No database means no Hot Leads — Hot Leads reset to Zero.');
  if (c.age === 'fresh' && c.apps !== 'zero')
    warnings.push('A job just posted cannot have applicants yet — applicants reset to None.');

  return { situation, goal, warnings };
}

function configToParams(c: Config): string {
  const dbTotal = c.db === 'none' ? '0' : '300';
  const leads   = c.leads === 'zero' ? '0' : c.leads === 'low' ? '3' : '9';
  // The journey URL still carries the granular tenure/exp params JobDetail reads — derived
  // from the single experience axis so no journey variety is lost.
  const exp     = c.experience === 'used_db' ? 'used_before' : c.experience === 'used_leads' ? 'used_leads' : 'never';
  const tenure  = c.experience === 'never' ? 'new' : 'old';
  return new URLSearchParams({
    tenure,
    credits: c.credits === 'none' ? '0' : '10',
    exp,
    db:      dbTotal,
    leads,
    apps:    c.apps === 'zero' ? '0' : c.apps === 'few' ? '3' : '8',
    age:     c.age,
    leadsLoc: c.leadsLoc ?? 'database',
  }).toString();
}

const STORAGE_KEY = 'apnahire_archetype_config';

function loadSaved(): { config: Config; ftueVersion: 'v1' | 'v2' | 'off' } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Guard against pre-refactor saved shapes (had `tenure`/`exp`, db 'low'/'normal').
      if (parsed?.config && 'experience' in parsed.config) return parsed;
    }
  } catch {}
  return { config: DEFAULT_CONFIG, ftueVersion: 'v2' };
}

export function Archetypes() {
  const navigate = useNavigate();
  const saved = loadSaved();
  const [config, setConfig] = useState<Config>(saved.config);
  const [ftueVersion, setFtueVersion] = useState<'v1' | 'v2' | 'off'>(saved.ftueVersion);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function persist(nextConfig: Config, nextFtue: 'v1' | 'v2' | 'off') {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ config: nextConfig, ftueVersion: nextFtue })); } catch {}
  }

  function set<K extends keyof Config>(key: K, val: Config[K]) {
    setConfig(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'db' && val === 'none') next.leads = 'zero';
      if (key === 'age' && val === 'fresh') next.apps = 'zero';
      persist(next, ftueVersion);
      return next;
    });
  }

  const summary = computeSummary(config);
  const activePreset = PRESETS.findIndex(p => configMatches(p.config, config));

  function handleExperience() {
    navigate(`/job/1?${configToParams(config)}&ftue=${ftueVersion}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-14 px-6">

      {/* Header */}
      <div className="w-full max-w-3xl mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-5 text-sm text-gray-500 font-medium">
          <span className="text-white font-bold text-base">apna<span className="text-emerald-400">Hire</span></span>
          <span className="text-gray-700">·</span>
          <span>Database adoption · Design prototype</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Build a recruiter journey</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Configure the recruiter's state below and step into the live experience.
        </p>
        <Link
          to="/scenario-map"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-gray-500 hover:text-emerald-400 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          View scenario map
        </Link>
      </div>

      {/* Presets */}
      <div className="w-full max-w-3xl mb-8">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 text-center">Quick presets</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => { setConfig(p.config); persist(p.config, ftueVersion); }}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${p.color} ${
                activePreset === i ? 'ring-1 ring-offset-1 ring-offset-gray-950 ring-current' : ''
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configurator card */}
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Configure state</p>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Recruiter experience (merged tenure + DB history) */}
          <ConfigRow label="Recruiter experience" hint="What they've done before — tunes copy, nudges & FTUE">
            <ToggleGroup
              options={[
                { value: 'never',      label: 'Never tried' },
                { value: 'used_db',    label: 'Used database' },
                { value: 'used_leads', label: 'Used Hot Leads' },
              ]}
              value={config.experience}
              onChange={v => set('experience', v as Experience)}
            />
          </ConfigRow>

          {/* Credits */}
          <ConfigRow label="DB credits" hint="Whether the recruiter has credits to spend">
            <ToggleGroup
              options={[
                { value: 'none', label: 'No credits' },
                { value: 'has',  label: 'Has credits' },
              ]}
              value={config.credits}
              onChange={v => set('credits', v as Credits)}
            />
          </ConfigRow>

          {/* Applicants */}
          <ConfigRow label="Applicants" hint="Organic applications on the Applied tab">
            <ToggleGroup
              options={[
                { value: 'zero', label: 'None' },
                { value: 'few',  label: 'A few',  disabled: config.age === 'fresh' },
                { value: 'many', label: 'Many',   disabled: config.age === 'fresh' },
              ]}
              value={config.apps}
              onChange={v => set('apps', v as AppVol)}
            />
          </ConfigRow>

          {/* Hot Leads */}
          <ConfigRow label="Hot Leads" hint="Actively looking candidates from that database">
            <ToggleGroup
              options={[
                { value: 'zero',   label: 'Zero',        disabled: false },
                { value: 'low',    label: 'Low (1–5)',   disabled: config.db === 'none' },
                { value: 'normal', label: 'Normal (6+)', disabled: config.db === 'none' },
              ]}
              value={config.leads}
              onChange={v => set('leads', v as LeadVol)}
            />
          </ConfigRow>

          {/* Hot Leads location */}
          <ConfigRow label="Hot Leads location" hint="Inside the Database tab, or their own tab between Applied & Database">
            <ToggleGroup
              options={[
                { value: 'database',   label: 'Part of database' },
                { value: 'individual', label: 'Own tab' },
              ]}
              value={config.leadsLoc ?? 'database'}
              onChange={v => set('leadsLoc', v as LeadsLoc)}
            />
          </ConfigRow>

          {/* Advanced (collapsed by default) */}
          <div className="border-t border-gray-800 pt-4">
            <button
              onClick={() => setAdvancedOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`transition-transform ${advancedOpen ? 'rotate-90' : ''}`}
              >
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Advanced
            </button>

            {advancedOpen && (
              <div className="space-y-5 mt-5">
                {/* Job age */}
                <ConfigRow label="Job age" hint="How long the job has been live (max 15 days)">
                  <ToggleGroup
                    options={[
                      { value: 'fresh',  label: 'Just posted' },
                      { value: 'active', label: 'Day 1–7' },
                      { value: 'aging',  label: 'Day 8–14' },
                    ]}
                    value={config.age}
                    onChange={v => set('age', v as JobAge)}
                  />
                </ConfigRow>

                {/* Database size */}
                <ConfigRow label="Database size" hint="Candidates in apna's DB matching this job">
                  <ToggleGroup
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'has',  label: 'Has matches (300+)' },
                    ]}
                    value={config.db}
                    onChange={v => set('db', v as DbSize)}
                  />
                </ConfigRow>

                {/* FTUE style */}
                <ConfigRow label="FTUE style" hint="First-time user experience version">
                  <ToggleGroup
                    options={[
                      { value: 'v2',  label: 'Coach mark' },
                      { value: 'v1',  label: 'Modal' },
                      { value: 'off', label: 'Off' },
                    ]}
                    value={ftueVersion}
                    onChange={v => { const f = v as 'v1' | 'v2' | 'off'; setFtueVersion(f); persist(config, f); }}
                  />
                </ConfigRow>
              </div>
            )}
          </div>

        </div>

        {/* Summary */}
        <div className="px-6 py-5 bg-gray-950/50 border-t border-gray-800 space-y-4">
          {summary.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-xs leading-relaxed">{w}</p>
            </div>
          ))}

          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Situation</p>
            <p className="text-sm text-gray-300 leading-relaxed">{summary.situation}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Design goal</p>
            <p className="text-sm font-semibold text-emerald-400 leading-relaxed">{summary.goal}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 py-5 border-t border-gray-800">
          <button
            onClick={handleExperience}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Experience this journey
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-shrink-0 pt-0.5">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 max-w-[140px]">{hint}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-0.5 gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          disabled={opt.disabled}
          onClick={() => !opt.disabled && onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
            opt.disabled
              ? 'text-gray-700 cursor-not-allowed'
              : value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
