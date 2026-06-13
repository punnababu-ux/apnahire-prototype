import type { ScenarioProps } from '../types';
import { useJobTab } from '../context/JobTabContext';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function OldHasCreditsNewToLeads({ totalLeads, dbCredits, applicantCount, dbTotal, unlockedIds, creditsRemaining, onUnlock, onUnlockAndView }: ScenarioProps) {
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
          headerTitle={`New: ${totalLeads} candidate${totalLeads === 1 ? ' is' : 's are'} actively looking for this role`}
          headerSubtitle={`Live Leads are candidates from the apna database who are currently active and match your job — ready to contact now with your credits.`}
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
        insertLeadsAfter={dbTotal > 0 ? 2 : undefined}
      />
    </div>
  );
}
