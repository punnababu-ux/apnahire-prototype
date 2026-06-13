import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tenure   = 'new' | 'old';
type Credits  = 'none' | 'has';
type DbExp    = 'never' | 'used';
type DbSize   = 'none' | 'low' | 'normal';
type LeadVol  = 'zero' | 'low' | 'normal';
type AppVol   = 'zero' | 'few' | 'many';
type JobAge   = 'fresh' | 'active' | 'aging';

interface Config {
  tenure:  Tenure;
  credits: Credits;
  exp:     DbExp;
  db:      DbSize;
  leads:   LeadVol;
  apps:    AppVol;
  age:     JobAge;
}

const DEFAULT_CONFIG: Config = {
  tenure: 'new', credits: 'none', exp: 'never', db: 'normal', leads: 'normal', apps: 'zero', age: 'active',
};

const PRESETS: Array<{ label: string; color: string; config: Config }> = [
  {
    label: 'Cold Start',
    color: 'border-amber-500/40 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10',
    config: { tenure: 'new', credits: 'none', exp: 'never', db: 'normal', leads: 'normal', apps: 'zero', age: 'active' },
  },
  {
    label: 'Ready to Go',
    color: 'border-blue-500/40 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10',
    config: { tenure: 'new', credits: 'has', exp: 'never', db: 'normal', leads: 'low', apps: 'zero', age: 'active' },
  },
  {
    label: 'No Credits',
    color: 'border-red-500/40 text-red-400 hover:border-red-400 hover:bg-red-500/10',
    config: { tenure: 'old', credits: 'none', exp: 'used', db: 'normal', leads: 'normal', apps: 'few', age: 'active' },
  },
  {
    label: 'Untapped Budget',
    color: 'border-teal-500/40 text-teal-400 hover:border-teal-400 hover:bg-teal-500/10',
    config: { tenure: 'old', credits: 'has', exp: 'never', db: 'normal', leads: 'normal', apps: 'few', age: 'active' },
  },
  {
    label: 'Power User',
    color: 'border-emerald-500/40 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10',
    config: { tenure: 'old', credits: 'has', exp: 'used', db: 'normal', leads: 'normal', apps: 'many', age: 'active' },
  },
];

function configMatches(a: Config, b: Config) {
  return a.tenure === b.tenure && a.credits === b.credits &&
    a.exp === b.exp && a.db === b.db && a.leads === b.leads && a.apps === b.apps && a.age === b.age;
}

function computeSummary(c: Config): { situation: string; goal: string; warnings: string[] } {
  const tenure  = c.tenure === 'new' ? 'First-time recruiter.' : 'Returning recruiter.';
  const agePart = c.age === 'fresh' && c.leads !== 'zero' ? 'Job just posted (< 1 day) — some DB candidates are already active as live leads.'
                : c.age === 'fresh'  ? 'Job just posted (< 1 day) — no active leads yet.'
                : c.age === 'aging'  ? 'Job in its final week (day 8–14) — expires soon.'
                :                     'Job has been live 1–7 days.';
  const appPart = c.apps   === 'zero' ? 'No organic applications yet.'
                : c.apps   === 'few'  ? 'A handful of organic applications coming in.'
                :                       'Strong organic application flow.';
  const dbPart  = c.db === 'none'   ? 'No candidates exist in the apna database for this job.'
                : c.db === 'low'    ? 'Very few candidates in the database match this role.'
                :                    'A healthy pool of matching candidates in the database.';
  const leadPart = c.db === 'none'    ? ''
                 : c.leads === 'zero' ? 'None are currently active/looking.'
                 : c.leads === 'low'  ? 'Only a few are currently live (1–5).'
                 :                     'A good pool are actively looking (6+).';
  const creditPart = c.credits === 'none'
    ? (c.exp === 'never' ? 'Has never tried DB and has no credits.' : 'Credits depleted after past DB use.')
    : (c.exp === 'never' ? 'Has credits sitting unused — never tried DB.' : 'Active DB user with credits remaining.');

  const situation = [tenure, agePart, appPart, dbPart, leadPart, creditPart].filter(Boolean).join(' ');

  let goal: string;
  if (c.db === 'none' && c.age === 'aging') {
    goal = 'Last chance to help. Strongly push the recruiter to broaden requirements before the job expires.';
  } else if (c.db === 'none') {
    goal = 'Inform honestly. Guide the recruiter to broaden their job requirements.';
  } else if (c.age === 'fresh') {
    goal = 'Set expectations. Reassure the recruiter that leads are coming — no alarm needed yet.';
  } else if (c.leads === 'zero' && c.age === 'aging') {
    goal = 'Create urgency. DB matches exist but no active leads — push to broaden requirements before expiry.';
  } else if (c.leads === 'zero') {
    goal = 'Manage expectations. DB exists but no active leads yet — encourage broadening and checking back.';
  } else if (c.credits === 'none' && c.exp === 'never') {
    goal = 'Introduce database value. Motivate the first credit purchase.';
  } else if (c.credits === 'none' && c.exp === 'used') {
    goal = 'Reinforce past DB value. Drive credit top-up.';
  } else if (c.credits === 'has' && c.exp === 'never') {
    goal = 'Surface leads prominently. Make the first unlock feel effortless.';
  } else {
    goal = 'Surface best matches quickly. Keep hiring momentum going.';
  }

  const warnings: string[] = [];
  if (c.tenure === 'new' && c.exp === 'used')
    warnings.push('New users cannot have used DB before — DB history reset to Never tried.');
  if (c.db === 'none' && c.leads !== 'zero')
    warnings.push('No database means no live leads — live leads reset to Zero.');
  if (c.age === 'fresh' && c.apps !== 'zero')
    warnings.push('A job just posted cannot have applicants yet — applicants reset to None.');

  return { situation, goal, warnings };
}

function configToParams(c: Config): string {
  const dbTotal = c.db === 'none' ? '0' : c.db === 'low' ? '45' : '300';
  const leads   = c.leads === 'zero' ? '0' : c.leads === 'low' ? '3' : '9';
  return new URLSearchParams({
    tenure:  c.tenure,
    credits: c.credits === 'none' ? '0' : '10',
    exp:     c.exp,
    db:      dbTotal,
    leads,
    apps:    c.apps === 'zero' ? '0' : c.apps === 'few' ? '3' : '8',
    age:     c.age,
  }).toString();
}

export function Archetypes() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  function set<K extends keyof Config>(key: K, val: Config[K]) {
    setConfig(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'tenure' && val === 'new') next.exp = 'never';
      if (key === 'db' && val === 'none') next.leads = 'zero';
      if (key === 'age' && val === 'fresh') next.apps = 'zero';
      return next;
    });
  }

  const summary = computeSummary(config);
  const activePreset = PRESETS.findIndex(p => configMatches(p.config, config));

  function handleExperience() {
    navigate(`/job/1?${configToParams(config)}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-14 px-6">

      {/* Header */}
      <div className="w-full max-w-xl mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-5 text-sm text-gray-500 font-medium">
          <span className="text-white font-bold text-base">apna<span className="text-emerald-400">Hire</span></span>
          <span className="text-gray-700">·</span>
          <span>Database adoption · Design prototype</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Build a recruiter journey</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Configure the recruiter's state below and step into the live experience.
        </p>
      </div>

      {/* Presets */}
      <div className="w-full max-w-xl mb-8">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 text-center">Quick presets</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setConfig(p.config)}
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
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Configure state</p>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Tenure */}
          <ConfigRow label="User tenure" hint="First-time vs returning recruiter">
            <ToggleGroup
              options={[
                { value: 'new', label: 'New to platform' },
                { value: 'old', label: 'Returning user' },
              ]}
              value={config.tenure}
              onChange={v => set('tenure', v as Tenure)}
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

          {/* DB experience */}
          <ConfigRow label="DB history" hint="Whether they've unlocked a profile before">
            <ToggleGroup
              options={[
                { value: 'never', label: 'Never tried DB' },
                { value: 'used',  label: 'Used DB before', disabled: config.tenure === 'new' },
              ]}
              value={config.exp}
              onChange={v => set('exp', v as DbExp)}
            />
          </ConfigRow>

          {/* Database size */}
          <ConfigRow label="Database size" hint="Total candidates in apna DB matching this job">
            <ToggleGroup
              options={[
                { value: 'none',   label: 'None' },
                { value: 'low',    label: 'Low (~50)' },
                { value: 'normal', label: 'Normal (300+)' },
              ]}
              value={config.db}
              onChange={v => set('db', v as DbSize)}
            />
          </ConfigRow>

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

          {/* Live leads */}
          <ConfigRow label="Live leads" hint="Actively looking candidates from that database">
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
