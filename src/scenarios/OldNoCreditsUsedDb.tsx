import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function OldNoCreditsUsedDb({ totalLeads, dbCredits, applicantCount, hasUsedDb, dbTotal }: ScenarioProps) {
  if (applicantCount === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <AppliedCandidateList
        applicantCount={applicantCount}
        totalLeads={totalLeads}
        dbCredits={dbCredits}
        hasUsedDb={hasUsedDb}
        nudgeVariant="repurchase"
        insertLeadsAfter={dbTotal > 0 ? 2 : undefined}
      />
    </div>
  );
}
