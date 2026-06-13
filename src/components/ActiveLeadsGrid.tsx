import { useState } from 'react';
import { CANDIDATES } from '../types';
import { CandidateCard, MoreCandidatesCard } from './CandidateCard';

interface ActiveLeadsGridProps {
  totalLeads?: number;
  lockedCount?: number;
  preUnlocked?: string[];
  credits?: number;
  onCreditSpend?: (remaining: number) => void;
  showBulkUnlock?: boolean;
}

export function ActiveLeadsGrid({
  totalLeads = 15,
  lockedCount = 3,
  preUnlocked = [],
  credits = 0,
  onCreditSpend,
  showBulkUnlock = false,
}: ActiveLeadsGridProps) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(preUnlocked));
  const [remaining, setRemaining] = useState(credits);

  function handleUnlock(id: string) {
    if (remaining <= 0 || unlocked.has(id)) return;
    const next = remaining - 1;
    setUnlocked(prev => new Set(prev).add(id));
    setRemaining(next);
    onCreditSpend?.(next);
  }

  const visible = CANDIDATES.slice(0, 3);
  const moreCount = totalLeads - 3;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {totalLeads} Live Leads from apna database
          </p>
          <p className="text-xs text-gray-500">
            Candidates actively looking for jobs, recently applied to similar roles, and matching your requirements.
          </p>
        </div>
        {showBulkUnlock && remaining > 0 && (
          <button className="ml-4 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0">
            Unlock all ({totalLeads})
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 px-5 pb-4">
        {visible.map((c, i) => {
          const isLocked = i < lockedCount && !unlocked.has(c.id);
          const isUnlocked = unlocked.has(c.id) || (i >= lockedCount && preUnlocked.length === 0);
          return (
            <CandidateCard
              key={c.id}
              candidate={c}
              locked={isLocked}
              unlocked={isUnlocked && !isLocked}
              onUnlock={() => handleUnlock(c.id)}
            />
          );
        })}
        <MoreCandidatesCard count={moreCount > 0 ? moreCount : 12} />
      </div>

      <div className="px-5 pb-4 pt-1 flex items-center justify-between border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {totalLeads} live leads shortlisted from{' '}
          <strong className="text-gray-800">42,321</strong> matching database profiles
        </p>
        {unlocked.size > 0 && (
          <span className="text-xs text-emerald-600 font-medium">
            {unlocked.size} unlocked · {remaining} credits left
          </span>
        )}
      </div>
    </div>
  );
}
