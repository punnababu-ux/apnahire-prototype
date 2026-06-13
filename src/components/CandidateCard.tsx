import type { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  locked?: boolean;
  unlocked?: boolean;
  onUnlock?: () => void;
}

export function CandidateCard({ candidate, locked, unlocked, onUnlock }: CandidateCardProps) {
  return (
    <div
      className={`relative border border-gray-200 rounded-xl overflow-hidden transition-all ${
        locked ? 'cursor-pointer hover:border-emerald-300 hover:shadow-sm' : ''
      }`}
      onClick={locked ? onUnlock : undefined}
    >
      <div className="h-11 bg-emerald-50" />
      <div className="px-3 pb-3">
        <div className="-mt-5 mb-2">
          <div
            className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold text-gray-700"
            style={{ background: candidate.avatarColor }}
          >
            {candidate.initials}
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-900 truncate">{candidate.name}</p>
        <p className="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-2">{candidate.role}</p>
        <p className="text-[10px] text-gray-400 mt-1.5">
          {candidate.experience} · {candidate.salary} · {candidate.location}
        </p>
        {unlocked && (
          <div className="mt-2 flex gap-1.5">
            <button className="flex-1 py-1 text-[10px] font-semibold bg-emerald-600 text-white rounded">
              View Contact
            </button>
            <button className="px-2 py-1 text-[10px] font-medium border border-gray-200 rounded text-gray-600">
              Save
            </button>
          </div>
        )}
      </div>

      {locked && (
        <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1.5">
          <div
            className="absolute inset-0 rounded-xl"
            style={{ backdropFilter: 'blur(3px)', background: 'rgba(255,255,255,0.52)' }}
          />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 text-center">Unlock profile</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MoreCandidatesCard({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <div
      className="border border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 gap-2 cursor-pointer hover:border-emerald-300 transition-colors"
      onClick={onClick}
    >
      <div className="flex -space-x-2">
        {['#a7f3d0', '#bfdbfe', '#fde68a'].map((c, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600"
            style={{ background: c }}
          >
            {['S', 'R', 'A'][i]}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-800">+ {count} more</p>
        <p className="text-[10px] text-gray-500">active candidates</p>
        <p className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
          See all
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </p>
      </div>
    </div>
  );
}
