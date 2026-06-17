import type { ScenarioProps } from '../types';
import { useJobTab } from '../context/JobTabContext';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

// Spec: Returning · Has Credits · Used DB, new to Leads. Thresholded by organic volume —
// 1–4 applicants ⇒ Hot Leads lead (ActiveLeadsTab at top, single); 5+ ⇒ single ingress at end.
export function OldHasCreditsNewToLeads({ totalLeads, dbCredits, applicantCount, dbTotal, unlockedIds, creditsRemaining, onUnlock, onUnlockAndView }: ScenarioProps) {
  const jobTab = useJobTab();

  if (applicantCount === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {totalLeads > 0 && applicantCount < 5 && (
        <ActiveLeadsTab
          totalLeads={totalLeads}
          dbMatchCount={dbTotal}
          hasCredits={true}
          credits={dbCredits}
          headerTitle={`${totalLeads} Hot Lead${totalLeads === 1 ? '' : 's'} ready — actively looking for this role`}
          headerSubtitle={`These are active candidates from apna's database who match your job. You have ${dbCredits} credit${dbCredits === 1 ? '' : 's'} — view a profile to unlock & contact.`}
          onExploreAll={() => jobTab?.goToDatabase()}
          onGoToDatabase={() => jobTab?.goToDatabase()}
          unlockedIds={unlockedIds}
          creditsRemaining={creditsRemaining}
          onUnlock={onUnlock}
          onUnlockAndView={onUnlockAndView}
        />
      )}
      <AppliedCandidateList
        applicantCount={applicantCount}
        totalLeads={totalLeads}
        dbCredits={dbCredits}
        hasUsedDb={true}
        nudgeVariant="engage"
        leadsAtEnd={totalLeads > 0 && applicantCount >= 5}
      />
    </div>
  );
}
