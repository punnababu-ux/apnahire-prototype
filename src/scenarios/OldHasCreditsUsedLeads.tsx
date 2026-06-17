import type { ScenarioProps } from '../types';
import { useJobTab } from '../context/JobTabContext';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

// Spec: Returning · Has Credits · Used Leads before. Thresholded by organic volume —
// 1–4 applicants ⇒ Hot Leads lead (ActiveLeadsTab at top, single, confident copy — they
// know the flow); 5+ ⇒ single ingress at end, they self-serve from the DB tab.
export function OldHasCreditsUsedLeads({ totalLeads, dbCredits, applicantCount, dbTotal, unlockedIds, creditsRemaining, onUnlock, onUnlockAndView }: ScenarioProps) {
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
          headerTitle={`${totalLeads} Hot Lead${totalLeads === 1 ? '' : 's'} matched for this role`}
          headerSubtitle={`Actively looking and matching your job — view a profile to unlock & contact.`}
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
        dbTotal={dbTotal}
        hasUsedDb={true}
        nudgeVariant="engage"
        leadsAtEnd={totalLeads > 0 && applicantCount >= 5}
      />
    </div>
  );
}
