import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

// Credits = 0 (new or returning). No ActiveLeadsTab widget — Hot Leads can't be actioned
// without credits while organic applicants exist, so they appear as a single ingress at the
// END of the feed. The credit-nudge banner reinforces past value ("repurchase") for anyone
// who's used the database/Hot Leads before, else introduces it ("educate_buy"). The 0-applicant
// state is handled by JobDetail's shared widget, so this returns null there.
export function NoCreditsApplied({ totalLeads, dbCredits, applicantCount, dbTotal, hasUsedDb }: ScenarioProps) {
  if (applicantCount === 0) return null;

  return (
    <AppliedCandidateList
      applicantCount={applicantCount}
      totalLeads={totalLeads}
      dbCredits={dbCredits}
      dbTotal={dbTotal}
      nudgeVariant={hasUsedDb ? 'repurchase' : 'educate_buy'}
      leadsAtEnd={totalLeads > 0}
    />
  );
}
