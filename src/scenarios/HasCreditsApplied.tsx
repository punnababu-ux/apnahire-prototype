import type { ScenarioProps } from '../types';
import { useJobTab } from '../context/JobTabContext';
import { ActiveLeadsTab } from '../components/ActiveLeadsTab';
import { AppliedCandidateList } from '../components/AppliedCandidateList';

// Credits > 0 (new or returning, any DB history). Placement by organic volume:
//   • 1–4 applicants → Hot Leads lead (ActiveLeadsTab at top, single).
//   • 5+ applicants  → single ingress at the end of the feed (widget suppressed).
// Header copy adapts to familiarity: recruiters who've used Hot Leads before get a confident,
// no-hand-holding line; everyone new to Hot Leads gets an encouraging intro. (The explainer
// and coach-mark differences are driven separately by dbExperience via JobTabContext.)
export function HasCreditsApplied({ totalLeads, dbCredits, applicantCount, dbTotal, dbExperience, unlockedIds, creditsRemaining, onUnlock, onUnlockAndView }: ScenarioProps) {
  const jobTab = useJobTab();

  if (applicantCount === 0) return null;

  const knowsHotLeads = dbExperience === 'used_leads';
  const headerTitle = knowsHotLeads
    ? `${totalLeads} Hot Lead${totalLeads === 1 ? '' : 's'} matched for this role`
    : `Only ${applicantCount} applicant${applicantCount === 1 ? '' : 's'} so far — but ${totalLeads} Hot Leads are ready`;
  const headerSubtitle = knowsHotLeads
    ? 'Actively looking and matching your job — view a profile to unlock & contact.'
    : `These Hot Leads are actively looking and match your job. You have ${dbCredits} credit${dbCredits === 1 ? '' : 's'} — view a profile to unlock & contact.`;

  return (
    <div className="flex flex-col gap-3">
      {totalLeads > 0 && applicantCount < 5 && (
        <ActiveLeadsTab
          totalLeads={totalLeads}
          dbMatchCount={dbTotal}
          hasCredits={true}
          credits={dbCredits}
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
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
        leadsAtEnd={totalLeads > 0 && applicantCount >= 5}
      />
    </div>
  );
}
