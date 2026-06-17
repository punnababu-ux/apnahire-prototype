import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function OldNoCreditsUsedDb({ totalLeads, dbCredits, applicantCount, dbTotal, hasUsedDb }: ScenarioProps) {
  if (applicantCount === 0) return null;

  return (
    <AppliedCandidateList
      applicantCount={applicantCount}
      totalLeads={totalLeads}
      dbCredits={dbCredits}
      dbTotal={dbTotal}
      hasUsedDb={hasUsedDb}
      nudgeVariant={hasUsedDb ? 'repurchase' : 'educate_buy'}
      leadsAtEnd={totalLeads > 0}
    />
  );
}
