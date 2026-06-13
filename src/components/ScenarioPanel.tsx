import { useState } from 'react';
import { SCENARIOS } from '../types';
import type { UserScenario } from '../types';

const NUDGE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  buy_credits:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  first_unlock: { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  educate_buy:  { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-400' },
  repurchase:   { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-400' },
  first_try:    { bg: 'bg-teal-100',    text: 'text-teal-700',    dot: 'bg-teal-400' },
  engage:       { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
};

interface ScenarioPanelProps {
  current: UserScenario;
  onChange: (id: string) => void;
  onReplayFtue?: () => void;
  showReplay?: boolean;
}

export function ScenarioPanel({ current, onChange, onReplayFtue, showReplay }: ScenarioPanelProps) {
  const [open, setOpen] = useState(false);
  const colors = NUDGE_COLOR[current.nudgeVariant];
  const newScenarios = SCENARIOS.filter(s => s.userType === 'new');
  const oldScenarios = SCENARIOS.filter(s => s.userType === 'old');

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating trigger */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {showReplay && (
          <button
            onClick={onReplayFtue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.17"/>
            </svg>
            Replay FTUE
          </button>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-lg transition-colors"
        >
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {current.tag}
          </span>
          <span className="text-xs font-medium">{current.label}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">User Journey Scenarios</p>
              <p className="text-xs text-gray-400 mt-0.5">Select a scenario to preview its design & nudge logic</p>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[520px]">
            <UserGroup
              label="New user"
              sublabel="First job posted · No prior experience on platform"
              dot="bg-gray-400"
              scenarios={newScenarios}
              current={current.id}
              onSelect={id => { onChange(id); setOpen(false); }}
            />
            <div className="my-3 border-t border-gray-100" />
            <UserGroup
              label="Returning user"
              sublabel="Posted jobs before · May or may not have used DB"
              dot="bg-gray-800"
              scenarios={oldScenarios}
              current={current.id}
              onSelect={id => { onChange(id); setOpen(false); }}
            />
          </div>

          {/* Current scenario goal */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wide">Current goal</p>
            <p className="text-xs text-gray-600">{current.goal}</p>
          </div>
        </div>
      )}
    </>
  );
}

function UserGroup({
  label, sublabel, dot, scenarios, current, onSelect,
}: {
  label: string; sublabel: string; dot: string;
  scenarios: UserScenario[]; current: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <div>
          <span className="text-xs font-bold text-gray-800">{label}</span>
          <span className="text-[10px] text-gray-400 ml-2">{sublabel}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {scenarios.map(s => {
          const c = NUDGE_COLOR[s.nudgeVariant];
          const isActive = s.id === current;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                isActive
                  ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${c.bg} ${c.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {s.tag}
                </span>
                {isActive && (
                  <span className="text-[9px] font-semibold text-emerald-600 ml-auto">Active</span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-gray-800 mb-1 leading-tight">{s.label}</p>
              <p className="text-[10px] text-gray-400 leading-snug mb-2 line-clamp-2">{s.description}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  s.dbCredits > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  {s.dbCredits > 0 ? `${s.dbCredits} credits` : '0 credits'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  s.dbExperience === 'used_before' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.dbExperience === 'used_before' ? 'Used DB' : 'DB-naive'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
