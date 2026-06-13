import { useState } from 'react';

const SAMPLE_LEADS = [
  { id: 'd1', name: 'Shankar Gopal',  initials: 'SG', color: '#a7f3d0', freshness: 'Fresher',  location: 'Near Koramangala, Bangalore',  tags: ['Field Sales', 'B2B Sales', 'MS Excel'],      title: 'Field Sales Executive, B2B Sales · +2 more',        skills: 'B2B Sales · MS Excel · Telecalling · Negotiation',      languages: 'English (Good) · Kannada · Hindi' },
  { id: 'd2', name: 'Kavya Reddy',    initials: 'KR', color: '#bfdbfe', freshness: '2 yr exp', location: 'Near Indiranagar, Bangalore',   tags: ['Field Sales', 'Banking', 'MS Excel'],        title: 'Field Sales Executive, Direct Sales · +1 more',     skills: 'B2B Sales · MS Excel · Product knowledge',             languages: 'English (Good) · Kannada · Hindi' },
  { id: 'd3', name: 'Arjun Mehta',    initials: 'AM', color: '#fde68a', freshness: '3 yr exp', location: 'Near HSR Layout, Bangalore',    tags: ['Field Sales', 'Product Knowledge', 'CRM'], title: 'Senior Sales Executive, Field Sales · +1 more',     skills: 'CRM · B2B Sales · MS Powerpoint · Negotiation',        languages: 'English (Good) · Hindi · Punjabi' },
];

interface EmbeddedLeadsSectionProps {
  totalLeads: number;
  dbCredits: number;
  hasUsedDb: boolean;
  nudgeVariant: 'educate_buy' | 'repurchase' | 'first_try' | 'engage';
}

export function EmbeddedLeadsSection({ totalLeads, dbCredits, hasUsedDb, nudgeVariant }: EmbeddedLeadsSectionProps) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(hasUsedDb ? ['d1'] : []));
  const [credits, setCredits] = useState(dbCredits);
  const canUnlock = credits > 0;

  const headerColor = {
    educate_buy: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-600', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
    repurchase:  { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'bg-red-500',    text: 'text-red-900',   badge: 'bg-red-100 text-red-700 border-red-200' },
    first_try:   { bg: 'bg-teal-50',   border: 'border-teal-200',   icon: 'bg-teal-600',   text: 'text-teal-800',  badge: 'bg-teal-100 text-teal-700 border-teal-200' },
    engage:      { bg: 'bg-emerald-50',border: 'border-emerald-200',icon: 'bg-emerald-600',text: 'text-emerald-800',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }[nudgeVariant];

  function handleUnlock(id: string) {
    if (!canUnlock || unlocked.has(id)) return;
    setUnlocked(prev => new Set(prev).add(id));
    setCredits(c => c - 1);
  }

  const nudgeFooter = {
    educate_buy: (
      <div className={`px-4 py-3 border-t ${headerColor.border} ${headerColor.bg} flex items-center justify-between`}>
        <p className="text-xs text-purple-700"><strong>78% response rate</strong> · avg reply &lt;24h · 42K+ active profiles</p>
        <button className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors ml-3 flex-shrink-0">
          Buy credits to unlock
        </button>
      </div>
    ),
    repurchase: (
      <div className={`px-4 py-3 border-t ${headerColor.border} ${headerColor.bg} flex items-center justify-between`}>
        <p className="text-xs text-red-700"><strong>You're missing {totalLeads} active candidates</strong> who applied to similar jobs.</p>
        <button className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors ml-3 flex-shrink-0">
          Top up credits
        </button>
      </div>
    ),
    first_try: (
      <div className={`px-4 py-3 border-t ${headerColor.border} ${headerColor.bg} flex items-center justify-between`}>
        <p className="text-xs text-teal-700">{credits} credits left · Tap any card to unlock instantly</p>
        <button className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors ml-3 flex-shrink-0">
          Unlock all {totalLeads} · {totalLeads} credits
        </button>
      </div>
    ),
    engage: (
      <div className={`px-4 py-3 border-t ${headerColor.border} ${headerColor.bg} flex items-center justify-between`}>
        <p className="text-xs text-emerald-700">{credits} credits left · 3 of {totalLeads} shown</p>
        <button className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg transition-colors ml-3 flex-shrink-0">
          Unlock all {totalLeads} →
        </button>
      </div>
    ),
  }[nudgeVariant];

  return (
    <div className={`mt-3 mb-3 rounded-xl border ${headerColor.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${headerColor.bg} px-4 py-3 flex items-start gap-3`}>
        <div className={`w-8 h-8 rounded-lg ${headerColor.icon} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-bold ${headerColor.text}`}>
              Live leads ({totalLeads}) from apna database
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <p className={`text-xs ${headerColor.text} opacity-80`}>
            Candidates actively looking for jobs, recently applied to similar roles, and matching your key requirements.
          </p>
        </div>
        {canUnlock && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${headerColor.badge}`}>
            {credits} credits left
          </span>
        )}
        {!canUnlock && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 bg-red-50 text-red-600 border-red-200">
            0 credits
          </span>
        )}
      </div>

      {/* Lead rows */}
      <div className="divide-y divide-gray-100 bg-white">
        {SAMPLE_LEADS.map(lead => {
          const isUnlocked = unlocked.has(lead.id);
          return (
            <div key={lead.id} className="px-4 py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0" style={{ background: lead.color }}>
                {lead.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-gray-900">{lead.name}</span>
                  <span className="text-[10px] text-gray-400">{lead.freshness}</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-1.5">📍 {lead.location}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {lead.tags.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-medium">✓ {t}</span>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mb-2">{lead.title} · {lead.skills}</p>

                {isUnlocked ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6z"/></svg>
                    View Phone Number
                  </button>
                ) : canUnlock ? (
                  <button onClick={() => handleUnlock(lead.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Unlock · 1 credit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-10 rounded-lg overflow-hidden border border-gray-200">
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span className="text-[11px] text-gray-500 font-medium">Buy credits to unlock</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {nudgeFooter}
    </div>
  );
}
