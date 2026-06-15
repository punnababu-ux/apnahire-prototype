import type { ScenarioProps } from '../types';
import { useJobTab } from '../context/JobTabContext';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function NewHasCredits({ totalLeads, dbCredits, applicantCount, dbTotal, unlockedIds, creditsRemaining, onUnlock, onUnlockAndView }: ScenarioProps) {
  const jobTab = useJobTab();

  if (applicantCount === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {totalLeads > 0 && (
        <ActiveLeadsTab
          totalLeads={totalLeads}
          dbMatchCount={dbTotal}
          hasCredits={true}
          credits={dbCredits}
          headerTitle={`Only ${applicantCount} applicant${applicantCount === 1 ? '' : 's'} so far — but ${totalLeads} Active Candidates are ready`}
          headerSubtitle={`These candidates are actively looking and match your job. You have ${dbCredits} credits — unlock their profiles now.`}
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
        hasUsedDb={false}
        nudgeVariant="first_try"
        insertLeadsAfter={dbTotal > 0 ? 2 : undefined}
      />
    </div>
  );
}
