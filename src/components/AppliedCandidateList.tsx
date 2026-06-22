import { useState } from 'react';
import { LiveLeadsMidFeedCard } from './LiveLeadsMidFeedCard';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import { useJobTab } from '../context/JobTabContext';

type NudgeVariant = 'educate_buy' | 'repurchase' | 'first_try' | 'engage';
type ApplicantStatus = 'none' | 'shortlisted' | 'rejected';

const APPLICANTS = [
  { id: '1', name: 'Manoj Kumar',          initials: 'MK', color: '#bfdbfe', age: 'M, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Whitefield, Bengaluru, KA',  tier: 'high' as const, matchTags: ['Work Experience', 'Industry', 'Education', 'Skills'], current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · Product knowledge · MS Excel · MS Powerpoint · Telecalling', languages: 'English (Good) · Hindi · Malaylam · Odiya · Marathi' },
  { id: '2', name: 'Priya Singh',           initials: 'PS', color: '#fde68a', age: 'F, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Koramangala, Bengaluru, KA', tier: 'high' as const, matchTags: ['Work Experience', 'Industry', 'Education', 'Skills'], current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · Product knowledge · MS Excel · Telecalling',          languages: 'English (Good) · Hindi · Malaylam · Odiya' },
  { id: '3', name: 'Bharath Kumar Gorle',   initials: 'BG', color: '#a7f3d0', age: 'M, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Indiranagar, Bengaluru, KA', tier: 'high' as const, matchTags: ['Work Experience', 'Industry', 'Education'],           current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · Product knowledge · MS Excel · MS Powerpoint',         languages: 'English (Good) · Hindi · Malaylam' },
  { id: '4', name: 'Raj Singh',             initials: 'RS', color: '#d8b4fe', age: 'M, 27 yr', exp: '1 yr 6 m', salary: '₹ 32k / m', location: 'Paharganj, New Delhi, DL',   tier: 'high' as const, matchTags: ['Work Experience', 'Industry'],                     current: 'Field Executive at India Mart, Jun 2021-Oct 2023 · Role: Field sales · Industry: Banking', previous: 'Field Executive at Jio, Jun 2020-Oct 2021 · Role: Field sales · Industry: Banking', education: 'B.Sc, Marketing · Lalit Narayan Mithila University, 2019', skills: 'B2B Sales · MS Excel · MS Powerpoint · Telecalling',             languages: 'English (Good) · Hindi · Punjabi' },
  { id: '5', name: 'Mrinal Kumar',          initials: 'MK', color: '#fecdd3', age: 'M, 31 yr', exp: '4 yr 6 m', salary: '₹ 32k / m', location: 'Paharganj, New Delhi, DL',   tier: 'medium' as const, matchTags: ['Work Experience'],                              current: 'Sales Executive at Max Life, Jan 2020-Mar 2023 · Role: Field sales · Industry: Insurance',  previous: 'Field Agent at Bajaj, Jun 2018-Dec 2020 · Role: Sales · Industry: Finance',             education: 'B.Com · Delhi University, 2019',                               skills: 'B2B Sales · MS Excel',                                          languages: 'English (Basic) · Hindi' },
  { id: '6', name: 'Sneha Joshi',           initials: 'SJ', color: '#99f6e4', age: 'F, 29 yr', exp: '2 yr 4 m', salary: '₹ 28k / m', location: 'Andheri, Mumbai',            tier: 'medium' as const, matchTags: ['Industry'],                                       current: 'Field Agent at Bajaj Finserv, Apr 2021-Aug 2023 · Role: Field sales · Industry: Finance', previous: '', education: 'B.A. Economics · Mumbai University, 2020',                     skills: 'Field Sales · Customer service',                                languages: 'English (Basic) · Hindi · Marathi' },
];

interface Props {
  applicantCount: number;
  totalLeads?: number;
  dbCredits?: number;
  dbTotal?: number;
  nudgeVariant?: NudgeVariant;
  leadsAtEnd?: boolean;
}

export function AppliedCandidateList({ applicantCount, totalLeads = 0, dbCredits = 0, dbTotal = 0, nudgeVariant, leadsAtEnd }: Props) {
  const [statuses, setStatuses] = useState<Record<string, ApplicantStatus>>({ '1': 'shortlisted' });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const isAging = useJobTab()?.jobAge === 'aging';

  // Context banner above the feed — at most one applies (the conditions are mutually
  // exclusive). All are aging-aware so the "expires soon" urgency reaches the default tab,
  // not only the 0-applicant cards.
  //  • No DB matches at all  → broaden requirements.
  //  • DB has matches, none active  → manage expectations (watching / will alert).
  //  • Active leads + no credits  → credit nudge (repurchase reinforces past value;
  //    educate_buy introduces Hot Leads). has-credits variants use ActiveLeadsTab instead.
  const isRepurchase = nudgeVariant === 'repurchase';
  const showNoDbNote   = dbTotal === 0 && applicantCount > 0;
  const showNoLeadsNote = dbTotal > 0 && totalLeads === 0 && applicantCount > 0;
  const showCreditNudge = totalLeads > 0 && applicantCount > 0 && (isRepurchase || nudgeVariant === 'educate_buy');

  const shownApplicants = APPLICANTS.slice(0, Math.min(applicantCount, APPLICANTS.length));
  const highMatches = shownApplicants.filter(a => a.tier === 'high');
  const medMatches  = shownApplicants.filter(a => a.tier === 'medium');

  const total       = applicantCount;
  const pending     = Math.round(total * 0.45);
  const viewed      = Math.round(total * 0.1);
  const rejected    = Math.round(total * 0.18);
  const shortlisted = Math.round(total * 0.05);

  return (
    <div className="flex flex-col gap-0">
      {/* Stats strip */}
      <div className="bg-white border border-[#dfe1e6] rounded-xl px-4 pt-3 pb-4 mb-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold text-[#172b4d]">Applied to job</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] text-[#172b4d]"><span className="font-semibold">Sort by</span>: Most Relevant</span>
            <span className="material-icons-round text-[16px] text-[#172b4d] select-none">expand_more</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: 'All Candidates', value: total,       active: true  },
            { label: 'Action Pending', value: pending,     active: false },
            { label: 'Number viewed',  value: viewed,      active: false },
            { label: 'Rejected',       value: rejected,    active: false },
            { label: 'Shortlisted',    value: shortlisted, active: false },
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

      {/* No DB matches at all — guide the recruiter to broaden requirements (aging-aware) */}
      {showNoDbNote && (
        <div className={`mb-3 flex items-start gap-2.5 px-4 py-3 rounded-xl border ${isAging ? 'border-amber-200 bg-amber-50' : 'border-[#dfe1e6] bg-white'}`}>
          <span className={`material-icons-round text-[16px] flex-shrink-0 mt-0.5 select-none ${isAging ? 'text-[#b45309]' : 'text-[#5e6c84]'}`}>search</span>
          <p className={`text-xs ${isAging ? 'text-amber-900' : 'text-[#42526e]'}`}>
            {isAging ? (
              <><span className="font-semibold">Your job expires soon and no database candidates match yet.</span> Broadening your job title, location, or skills is your best chance to find candidates before it closes.</>
            ) : (
              <><span className="font-semibold text-[#172b4d]">No database candidates match this job yet.</span> Broadening your job title, location, or skills can surface more.</>
            )}
          </p>
        </div>
      )}

      {/* No active Hot Leads yet — manage expectations (DB has matches, none active; aging-aware) */}
      {showNoLeadsNote && (
        <div className={`mb-3 flex items-start gap-2.5 px-4 py-3 rounded-xl border ${isAging ? 'border-amber-200 bg-amber-50' : 'border-[#dfe1e6] bg-white'}`}>
          <span className={`material-icons-round text-[16px] flex-shrink-0 mt-0.5 select-none ${isAging ? 'text-[#b45309]' : 'text-[#5e6c84]'}`}>{isAging ? 'schedule' : 'notifications'}</span>
          <p className={`text-xs ${isAging ? 'text-amber-900' : 'text-[#42526e]'}`}>
            {isAging ? (
              <><span className="font-semibold">Your job expires soon and no Hot Leads are active yet.</span> We're watching <span className="font-semibold">{dbTotal.toLocaleString()} matching candidates</span> — we'll alert you the moment one becomes active so you can reach out fast.</>
            ) : (
              <><span className="font-semibold text-[#172b4d]">No Hot Leads are active right now.</span> We're watching <span className="font-semibold text-[#172b4d]">{dbTotal.toLocaleString()} matching candidates</span> in the database and will alert you the moment one becomes active.</>
            )}
          </p>
        </div>
      )}

      {/* Credit nudge — reinforces past value (repurchase) or introduces Hot Leads (first buy) */}
      {showCreditNudge && (
        <div data-ftue="leads-nudge" className="mb-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#b6ecec] bg-[#eaf8f4]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-icons-round text-[16px] text-[#1f8268] flex-shrink-0 select-none">lock</span>
            <p className="text-xs text-[#42526e]">
              {isRepurchase ? (
                <>You've unlocked Hot Leads before — <span className="font-semibold text-[#172b4d]">{totalLeads} more are waiting</span>. Top up credits to keep contacting active candidates.</>
              ) : (
                <><span className="font-semibold text-[#172b4d]">{totalLeads} Hot Leads</span> from apna's database are actively looking and match this job — buy credits to view &amp; contact.</>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex-shrink-0 px-3 py-1.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {isRepurchase ? 'Top up credits' : 'Buy credits'}
          </button>
        </div>
      )}

      {/* High matches */}
      {highMatches.length > 0 && (
        <div className="border border-purple-200 rounded-xl bg-purple-50/40 mb-3 overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-[18px] text-purple-700 select-none">auto_awesome</span>
              <span className="text-sm font-semibold text-purple-700">High Matches</span>
              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{highMatches.length} candidates</span>
              <button className="ml-auto text-[11px] text-purple-500 hover:underline font-medium">Know more</button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 ml-6">Candidates matching all your key requirements.</p>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {highMatches.map((c) => (
              <CandidateCard key={c.id} candidate={c} status={statuses[c.id] ?? 'none'} onShortlist={() => setStatuses(p => ({ ...p, [c.id]: 'shortlisted' }))} onReject={() => setStatuses(p => ({ ...p, [c.id]: 'rejected' }))} />
            ))}
          </div>
        </div>
      )}

      {/* Medium matches */}
      {medMatches.length > 0 && (
        <div className="border border-amber-200 rounded-xl bg-amber-50/40 mb-3 overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-[14px] text-[#b45309] select-none">info</span>
              <span className="text-sm font-semibold text-gray-900">Medium Matches with Minor Gaps</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{medMatches.length} candidates</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 ml-5">Meeting most of your requirements but missing a few criteria.</p>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {medMatches.map(c => (
              <CandidateCard key={c.id} candidate={c} status={statuses[c.id] ?? 'none'} onShortlist={() => setStatuses(p => ({ ...p, [c.id]: 'shortlisted' }))} onReject={() => setStatuses(p => ({ ...p, [c.id]: 'rejected' }))} />
            ))}
          </div>
        </div>
      )}

      {/* Live leads end-of-feed card */}
      {leadsAtEnd && totalLeads > 0 && (
        <LiveLeadsMidFeedCard totalLeads={totalLeads} hasCredits={dbCredits > 0} />
      )}

      {showBuyModal && <InsufficientCreditsModal onClose={() => setShowBuyModal(false)} />}
    </div>
  );
}

function CandidateCard({ candidate, status, onShortlist, onReject }: {
  candidate: typeof APPLICANTS[0];
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
              <span className="material-icons-round text-[14px] text-[#3e7bfa] select-none">check</span>
              <span className="text-[14px] bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(170deg, #3e7bfa 7%, #6600cc 93%)' }}>{tag}</span>
            </span>
          ))}
            <span className="material-icons-round text-[16px] text-[#6600cc] select-none">chevron_right</span>
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
              <span className="material-icons-round text-[18px] select-none">phone</span>
              View number
            </button>
            <button aria-label="Message on WhatsApp" className="w-10 h-10 flex items-center justify-center border border-[#dfe1e6] rounded-xl hover:bg-gray-50">
              <span className="material-icons-round text-[#25D366] text-[22px] select-none">chat</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {status === 'rejected' ? (
              <span className="flex items-center gap-2 px-3 h-10 bg-red-50 border border-[#cc0000] text-[#cc0000] text-[14px] font-semibold rounded-xl">
                <span className="material-icons-round text-[16px] select-none">close</span>Rejected
              </span>
            ) : (
              <button onClick={onReject} className="flex items-center gap-2 px-3 h-10 bg-white border border-[#cc0000] hover:bg-red-50 text-[#cc0000] text-[14px] font-semibold rounded-xl transition-colors">
                <span className="material-icons-round text-[16px] select-none">close</span>Reject
              </button>
            )}
            {status === 'shortlisted' ? (
              <span className="flex items-center gap-2 px-3 h-10 bg-emerald-50 border border-[#1f8268] text-[#1f8268] text-[14px] font-semibold rounded-xl">
                <span className="material-icons-round text-[16px] select-none">check</span>Shortlisted
              </span>
            ) : (
              <button onClick={onShortlist} className="flex items-center gap-2 px-3 h-10 bg-white border border-[#1f8268] hover:bg-emerald-50 text-[#1f8268] text-[14px] font-semibold rounded-xl transition-colors">
                <span className="material-icons-round text-[16px] select-none">check</span>Shortlist
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
              <span className="material-icons-round text-[14px] text-[#5e6c84] select-none">thumb_up</span>
            </button>
            <button aria-label="This match is not helpful" className="hover:opacity-70">
              <span className="material-icons-round text-[14px] text-[#5e6c84] select-none">thumb_down</span>
            </button>
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-[14px] font-semibold text-[#172b4d] hover:text-gray-600 px-3 py-1.5">
          <span className="material-icons-round text-[16px] select-none">edit</span>
          Add a note
        </button>
      </div>
    </div>
  );
}

function PersonIcon()    { return <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">person</span>; }
function JobIcon()       { return <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">work</span>; }
function SalaryIcon()    { return <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">payments</span>; }
function LocationIcon()  { return <span className="material-icons-round text-[16px] text-[#5e6c84] select-none">location_on</span>; }
function BriefcaseIcon() { return <span className="material-icons-round text-[16px] text-[#42526e] select-none">business_center</span>; }
function EducationIcon() { return <span className="material-icons-round text-[16px] text-[#42526e] select-none">school</span>; }
function SkillsIcon()    { return <span className="material-icons-round text-[16px] text-[#42526e] select-none">star</span>; }
function LanguageIcon()  { return <span className="material-icons-round text-[16px] text-[#42526e] select-none">language</span>; }
