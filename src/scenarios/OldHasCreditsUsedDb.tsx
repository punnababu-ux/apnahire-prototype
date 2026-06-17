import { useState } from 'react';
import { LiveLeadsMidFeedCard } from '../components/LiveLeadsMidFeedCard';

const APPLICANTS = [
  { id: '1', name: 'Manoj Kumar',        initials: 'MK', color: '#bfdbfe', age: 'M, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Whitefield, Bengaluru, KA',  tier: 'high' as const, matchTags: ['Work Experience', 'Industry', 'Education', 'Skills'], current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · Product knowledge · MS Excel · MS Powerpoint · Telecalling', languages: 'English (Good) · Hindi · Malaylam · Odiya · Marathi' },
  { id: '2', name: 'Priya Singh',         initials: 'PS', color: '#fde68a', age: 'F, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Koramangala, Bengaluru, KA', tier: 'high' as const, matchTags: ['Work Experience', 'Industry', 'Education', 'Skills'], current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · Product knowledge · MS Excel · Telecalling',         languages: 'English (Good) · Hindi · Malaylam · Odiya' },
  { id: '3', name: 'Bharath Kumar Gorle', initials: 'BG', color: '#a7f3d0', age: 'M, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Indiranagar, Bengaluru, KA', tier: 'high' as const, matchTags: ['Work Experience', 'Industry', 'Education'],           current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · Product knowledge · MS Excel · MS Powerpoint',        languages: 'English (Good) · Hindi · Malaylam' },
  { id: '4', name: 'Raj Singh',           initials: 'RS', color: '#d8b4fe', age: 'M, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Paharganj, New Delhi, DL',   tier: 'high' as const, matchTags: ['Work Experience', 'Industry'],                     current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · MS Excel · MS Powerpoint · Telecalling',            languages: 'English (Good) · Hindi · Punjabi' },
];

const MEDIUM_MATCHES = [
  { id: '5', name: 'Mrinal Kumar', initials: 'MK', color: '#fecdd3', age: 'M, 31 yr', exp: '4 yr 6 m', salary: '₹ 32k / m', location: 'Paharganj, New Delhi, DL', tier: 'medium' as const, matchTags: ['Work Experience'], current: 'Sales Executive at Max Life, Jan 2020-Mar 2023 · Role: Field sales · Industry: Insurance', previous: 'Field Agent at Bajaj, Jun 2018-Dec 2020 · Role: Sales · Industry: Finance', education: 'B.Com · Delhi University, 2019', skills: 'B2B Sales · MS Excel', languages: 'English (Basic) · Hindi' },
];

type ApplicantStatus = 'none' | 'shortlisted' | 'rejected';
type Candidate = Omit<typeof APPLICANTS[0], 'tier'> & { tier: 'high' | 'medium' };

import type { ScenarioProps } from '../types';

export function OldHasCreditsUsedDb({ totalLeads, applicantCount }: ScenarioProps) {
  const [statuses, setStatuses] = useState<Record<string, ApplicantStatus>>({ '1': 'shortlisted' });

  if (applicantCount === 0) return null;

  function setStatus(id: string, s: ApplicantStatus) {
    setStatuses(prev => ({ ...prev, [id]: s }));
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Stats strip */}
      <div className="bg-white border border-[#dfe1e6] rounded-xl px-4 pt-3 pb-4 mb-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold text-[#172b4d]">Applied to job</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] text-[#172b4d]"><span className="font-semibold">Sort by</span>: Most Relevant</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#172b4d" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: 'All Candidates', value: '220', active: true },
            { label: 'Action Pending', value: '100', active: false },
            { label: 'Number viewed',  value: '22',  active: false },
            { label: 'Rejected',       value: '40',  active: false },
            { label: 'Shortlisted',    value: '12',  active: false },
          ].map(s => (
            <button
              key={s.label}
              className={`flex flex-col items-center justify-center h-[72px] flex-1 rounded-xl text-center transition-colors ${
                s.active
                  ? 'bg-[#eaf8f4]/30 border-2 border-[#1f8268]'
                  : 'bg-white border border-[#b3bac5] hover:bg-gray-50'
              }`}
            >
              <span className={`text-[16px] font-bold leading-6 ${s.active ? 'text-[#1f8268]' : 'text-[#190a28]'}`}>{s.value}</span>
              <span className={`text-[14px] mt-2 ${s.active ? 'text-[#1f8268] font-bold' : 'text-[#190a28]'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* High Matches container */}
      <div className="border border-purple-200 rounded-xl bg-purple-50/40 mb-3 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M33.8395 24.7483C22.4049 26.6287 20.3721 29.0173 18.8474 42.9421C18.7966 43.3995 18.136 43.3995 18.0851 42.9421C16.5605 29.0173 14.5277 26.6795 3.09304 24.7483C2.63565 24.6975 2.63565 24.0368 3.09304 23.986C14.5277 22.1057 16.5605 19.7679 18.0851 5.84304C18.136 5.38565 18.7966 5.38565 18.8474 5.84304C20.3721 19.7679 22.4049 22.0548 33.8395 23.986C34.2461 24.0368 34.2461 24.6467 33.8395 24.7483Z" fill="url(#hm0)"/>
              <path d="M39.8311 8.30344C36.2737 9.01493 35.2573 10.1838 34.6474 14.3511C34.5966 14.8085 33.9359 14.8085 33.8851 14.3511C33.2753 10.1838 32.2589 9.01493 28.7014 8.25262C28.2948 8.15098 28.2948 7.59195 28.7014 7.49031C32.208 6.77882 33.2753 5.60994 33.8851 1.44265C33.9359 0.985263 34.5966 0.985263 34.6474 1.44265C35.2573 5.60994 36.2737 6.77882 39.8311 7.54113C40.2377 7.64277 40.2377 8.25262 39.8311 8.30344Z" fill="url(#hm1)"/>
              <defs>
                <linearGradient id="hm0" x1="-7.39069" y1="17.7049" x2="18.5605" y2="51.0817" gradientUnits="userSpaceOnUse"><stop stopColor="#3E7BFA"/><stop offset="1" stopColor="#6600CC"/></linearGradient>
                <linearGradient id="hm1" x1="24.6045" y1="5.49076" x2="33.8466" y2="17.8449" gradientUnits="userSpaceOnUse"><stop stopColor="#3E7BFA"/><stop offset="1" stopColor="#6600CC"/></linearGradient>
              </defs>
            </svg>
            <span className="text-sm font-semibold text-purple-700">High Matches</span>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{APPLICANTS.length} candidates</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 ml-6">Candidates matching all your key requirements.</p>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {APPLICANTS.map(c => (
            <CandidateCard key={c.id} candidate={c} status={statuses[c.id] ?? 'none'} onShortlist={() => setStatus(c.id, 'shortlisted')} onReject={() => setStatus(c.id, 'rejected')} />
          ))}
        </div>
      </div>

      {/* Medium Matches container */}
      <div className="border border-amber-200 rounded-xl bg-amber-50/40 mb-3 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="text-sm font-semibold text-gray-900">Medium Matches with Minor Gaps</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{MEDIUM_MATCHES.length} candidates</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-5">Meeting most of your requirements but missing a few criteria.</p>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {MEDIUM_MATCHES.map(c => (
            <CandidateCard key={c.id} candidate={c} status={statuses[c.id] ?? 'none'} onShortlist={() => setStatus(c.id, 'shortlisted')} onReject={() => setStatus(c.id, 'rejected')} />
          ))}
        </div>
      </div>

      {/* Hot Leads ingress at end */}
      {totalLeads > 0 && <LiveLeadsMidFeedCard totalLeads={totalLeads} hasCredits />}
    </div>
  );
}

function CandidateCard({ candidate, status, onShortlist, onReject }: {
  candidate: Candidate;
  status: ApplicantStatus;
  onShortlist: () => void;
  onReject: () => void;
}) {
  const isHigh = candidate.tier === 'high';
  const detailRows = [
    { icon: <BriefcaseIcon />, label: 'Current/ Latest', value: candidate.current },
    ...(candidate.previous ? [{ icon: <BriefcaseIcon />, label: 'Previous', value: candidate.previous }] : []),
    { icon: <EducationIcon />, label: 'Education',       value: candidate.education },
    { icon: <SkillsIcon />,    label: 'Skills / tags',   value: candidate.skills },
    { icon: <LanguageIcon />,  label: 'Language',        value: candidate.languages },
  ];

  return (
    <div className="bg-white border border-[#dfe1e6] rounded-xl overflow-hidden">
      <div className="px-6 pt-4 pb-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 flex-shrink-0 shadow-sm" style={{ background: candidate.color }}>
              {candidate.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[16px] font-semibold text-[#172b4d]">{candidate.name}</span>
                <button className="text-[14px] font-semibold text-[#1f8268] hover:underline whitespace-nowrap">View Full Profile with resume ›</button>
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]"><PersonIcon /> {candidate.age}</span>
                <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]"><JobIcon /> {candidate.exp}</span>
                <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]"><SalaryIcon /> {candidate.salary}</span>
                <span className="flex items-center gap-1 text-[14px] font-semibold text-[#5e6c84]"><LocationIcon /> {candidate.location}</span>
              </div>
            </div>
          </div>
          {isHigh ? (
            <div className="flex-shrink-0 flex items-center gap-1 px-3 h-6 rounded-full" style={{ background: 'linear-gradient(to right, #f1eafa, #ebf3fe)' }}>
              <span className="text-[14px] bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(170deg, #3e7bfa 7%, #6600cc 93%)' }}>✦</span>
              <span className="text-[14px] font-semibold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(170deg, #3e7bfa 7%, #6600cc 93%)' }}>High Match</span>
            </div>
          ) : (
            <div className="flex-shrink-0 flex items-center gap-1 px-3 h-6 rounded-full bg-amber-50 border border-amber-200">
              <span className="text-[13px] font-semibold text-amber-700">Medium Match</span>
            </div>
          )}
        </div>

        {/* Matching row */}
        <div className="flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(to right, #f1eafa, #ebf3fe)' }}>
          <span className="text-[14px] font-semibold bg-clip-text text-transparent flex-shrink-0" style={{ backgroundImage: 'linear-gradient(170deg, #3e7bfa 7%, #6600cc 93%)' }}>✦ Matching :</span>
          {candidate.matchTags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-white border border-[#3e7bfa] px-2 h-6 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3e7bfa" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-[14px] bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(170deg, #3e7bfa 7%, #6600cc 93%)' }}>{tag}</span>
            </span>
          ))}
          <span className="ml-auto flex items-center justify-center w-6 h-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6600cc" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>

        {/* Detail rows */}
        <div className="flex flex-col gap-3">
          {detailRows.map(row => (
            <div key={row.label} className="flex gap-4 items-start">
              <div className="flex items-center gap-2 w-[136px] flex-shrink-0">
                <span className="text-[#42526e] flex-shrink-0">{row.icon}</span>
                <span className="text-[14px] font-semibold text-[#42526e]">{row.label}</span>
              </div>
              <p className="text-[14px] text-[#172b4d] flex-1 min-w-0">{row.value.split(' · ').join(' | ')}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 h-10 bg-[#1f8268] hover:bg-[#186b55] text-white text-[14px] font-semibold rounded-xl transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6z"/></svg>
              View number
            </button>
            <button aria-label="Message on WhatsApp" className="w-10 h-10 flex items-center justify-center border border-[#dfe1e6] rounded-xl hover:bg-gray-50">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.001 21.75A9.75 9.75 0 1 1 21.75 12a9.762 9.762 0 0 1-9.749 9.75z"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {status === 'rejected' ? (
              <span className="flex items-center gap-2 px-3 h-10 bg-red-50 border border-[#cc0000] text-[#cc0000] text-[14px] font-semibold rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Rejected
              </span>
            ) : (
              <button onClick={onReject} className="flex items-center gap-2 px-3 h-10 bg-white border border-[#cc0000] hover:bg-red-50 text-[#cc0000] text-[14px] font-semibold rounded-xl transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Reject
              </button>
            )}
            {status === 'shortlisted' ? (
              <span className="flex items-center gap-2 px-3 h-10 bg-emerald-50 border border-[#1f8268] text-[#1f8268] text-[14px] font-semibold rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Shortlisted
              </span>
            ) : (
              <button onClick={onShortlist} className="flex items-center gap-2 px-3 h-10 bg-white border border-[#1f8268] hover:bg-emerald-50 text-[#1f8268] text-[14px] font-semibold rounded-xl transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Shortlist
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#dfe1e6] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3 text-[12px] text-[#5e6c84]">
          <span>Applied 3 days ago</span>
          <span className="w-px h-2.5 bg-[#b3bac5]" />
          <span>Active 4 mins ago</span>
          <span className="w-px h-2.5 bg-[#b3bac5]" />
          <span className="flex items-center gap-2">
            Help improve with your feedback.
            <button aria-label="This match is helpful" className="hover:opacity-70">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            </button>
            <button aria-label="This match is not helpful" className="hover:opacity-70">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="1.8"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
            </button>
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-[14px] font-semibold text-[#172b4d] hover:text-gray-600 px-3 py-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Add a note
        </button>
      </div>
    </div>
  );
}

function PersonIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function JobIcon()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function SalaryIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function LocationIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5e6c84" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function BriefcaseIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function EducationIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>; }
function SkillsIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function LanguageIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#42526e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
