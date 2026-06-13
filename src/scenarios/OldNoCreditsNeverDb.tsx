import { AppliedCandidateList } from '../components/AppliedCandidateList';

export function OldNoCreditsNeverDb() {
  return (
    <div className="flex flex-col gap-3">
      <AppliedCandidateList
        applicantCount={3}
        totalLeads={15}
        dbCredits={0}
        hasUsedDb={false}
        nudgeVariant="educate_buy"
        insertLeadsAfter={2}
      />
    </div>
  );
}
