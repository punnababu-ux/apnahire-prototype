import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function OldHasCreditsUsedLeads({ totalLeads, dbCredits, applicantCount }: ScenarioProps) {
  if (applicantCount === 0) return null;

  return (
    <AppliedCandidateList
      applicantCount={applicantCount}
      totalLeads={totalLeads}
      dbCredits={dbCredits}
      hasUsedDb={true}
      nudgeVariant="engage"
      insertLeadsAfter={totalLeads > 0 ? 2 : undefined}
    />
  );
}
