import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function NewNoCredits({ totalLeads, dbCredits, applicantCount, dbTotal }: ScenarioProps) {
  if (applicantCount === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <AppliedCandidateList
        applicantCount={applicantCount}
        totalLeads={totalLeads}
        dbCredits={dbCredits}
        hasUsedDb={false}
        nudgeVariant="buy_credits"
        insertLeadsAfter={dbTotal > 0 ? 2 : undefined}
      />
    </div>
  );
}
