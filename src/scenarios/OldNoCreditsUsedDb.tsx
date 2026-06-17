import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function OldNoCreditsUsedDb({ totalLeads, dbCredits, applicantCount, hasUsedDb }: ScenarioProps) {
  if (applicantCount === 0) return null;

  return (
    <AppliedCandidateList
      applicantCount={applicantCount}
      totalLeads={totalLeads}
      dbCredits={dbCredits}
      hasUsedDb={hasUsedDb}
      nudgeVariant={hasUsedDb ? 'repurchase' : 'educate_buy'}
      leadsAtEnd={totalLeads > 0}
    />
  );
}
