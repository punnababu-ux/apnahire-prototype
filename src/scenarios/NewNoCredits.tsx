import type { ScenarioProps } from '../types';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

// Spec: New · No Credits. Credits=0 ⇒ never lead with an unactionable widget when organic
// exists. 0 applicants is handled by JobDetail's shared ActiveLeadsTab (component returns
// null). For any 1+ applicants, Hot Leads is a single ingress at the END of the feed.
export function NewNoCredits({ totalLeads, dbCredits, applicantCount }: ScenarioProps) {
  if (applicantCount === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <AppliedCandidateList
        applicantCount={applicantCount}
        totalLeads={totalLeads}
        dbCredits={dbCredits}
        hasUsedDb={false}
        nudgeVariant="educate_buy"
        leadsAtEnd={totalLeads > 0}
      />
    </div>
  );
}
