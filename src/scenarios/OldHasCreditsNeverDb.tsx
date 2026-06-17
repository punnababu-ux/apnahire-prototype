import type { ScenarioProps } from '../types';
import { useJobTab } from '../context/JobTabContext';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

// Spec: Returning · Has Credits · Never used DB. Thresholded by organic volume —
// 1–4 applicants ⇒ Hot Leads lead (ActiveLeadsTab at top, single); 5+ ⇒ single ingress
// at end (ActiveLeadsTab suppressed). First DB interaction — make unlocking effortless.
export function OldHasCreditsNeverDb({ totalLeads, dbCredits, applicantCount, dbTotal, unlockedIds, creditsRemaining, onUnlock, onUnlockAndView }: ScenarioProps) {
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
          headerTitle={`Only ${applicantCount} applicant${applicantCount === 1 ? '' : 's'} so far — but ${totalLeads} Hot Leads are ready`}
          headerSubtitle={`These Hot Leads are actively looking and match your job. You have ${dbCredits} credit${dbCredits === 1 ? '' : 's'} — view a profile to unlock & contact.`}
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
        hasUsedDb={false}
        nudgeVariant="first_try"
        leadsAtEnd={totalLeads > 0 && applicantCount >= 5}
      />
    </div>
  );
}
