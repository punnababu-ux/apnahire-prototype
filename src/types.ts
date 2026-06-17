export type UserType = 'new' | 'old';
export type DbExperience = 'never' | 'used_before' | 'used_leads';
// Where Hot Leads live. 'database' = current behavior (pinned inside the Database tab).
// 'individual' = Hot Leads get their own tab between Applied and Database, and are
// removed from the Database tab. Optional; undefined is treated as 'database'.
export type LeadsLocation = 'database' | 'individual';

export interface UserScenario {
  id: string;
  label: string;
  tag: string;
  userType: UserType;
  dbCredits: number;
  dbExperience: DbExperience;
  jobLeads: number;
  dbTotal: number;
  applicationsCount: number;
  description: string;
  userBehavior: string;
  productObjective: string;
  goal: string;
  nudgeVariant: 'buy_credits' | 'first_unlock' | 'educate_buy' | 'repurchase' | 'first_try' | 'engage';
  leadsLocation?: LeadsLocation;
}

export const SCENARIOS: UserScenario[] = [
  {
    id: 'new-no-credits',
    label: 'New · No Credits',
    tag: 'Cold Start',
    userType: 'new',
    dbCredits: 0,
    dbExperience: 'never',
    jobLeads: 6,
    dbTotal: 289,
    applicationsCount: 0,
    description: 'First job posted, no DB credits, no leads yet.',
    userBehavior: 'Just posted their first job. Unfamiliar with DB. Unlikely to buy immediately.',
    productObjective: 'Introduce database value',
    goal: 'Show locked active leads to create desire — motivate first credit purchase.',
    nudgeVariant: 'buy_credits',
  },
  {
    id: 'new-has-credits',
    label: 'New · Has Credits',
    tag: 'Ready to Go',
    userType: 'new',
    dbCredits: 10,
    dbExperience: 'never',
    jobLeads: 4,
    dbTotal: 312,
    applicationsCount: 0,
    description: 'First job posted, has DB credits, no leads yet.',
    userBehavior: 'Bought credits upfront but hasn\'t used them. Waiting passively for applications.',
    productObjective: 'Drive first DB unlock',
    goal: 'Nudge user to proactively unlock matching candidates with their existing credits.',
    nudgeVariant: 'first_unlock',
  },
  {
    id: 'old-no-credits-used-db',
    label: 'Old · No Credits',
    tag: 'No Credits',
    userType: 'old',
    dbCredits: 0,
    dbExperience: 'used_before',
    jobLeads: 8,
    dbTotal: 321,
    applicationsCount: 5,
    description: 'Used DB before, credits depleted, leads waiting.',
    userBehavior: 'Knows the value of DB. Credits ran out. Seeing locked profiles they can\'t access.',
    productObjective: 'Drive credit repurchase',
    goal: 'Show what they\'re missing. Reinforce past value delivered. Trigger top-up.',
    nudgeVariant: 'repurchase',
  },
  {
    id: 'old-has-credits-never-db',
    label: 'Old · Has Credits · DB-Naive',
    tag: 'Untapped Budget',
    userType: 'old',
    dbCredits: 15,
    dbExperience: 'never',
    jobLeads: 12,
    dbTotal: 376,
    applicationsCount: 2,
    description: 'Has credits, active leads, but never tried DB.',
    userBehavior: 'Might have received credits as a gift or bundle. Hasn\'t explored DB tab yet.',
    productObjective: 'Drive first DB interaction',
    goal: 'Show leads and make unlocking feel effortless — one tap to try.',
    nudgeVariant: 'first_try',
  },
  {
    id: 'old-has-credits-used-leads',
    label: 'Old · Has Credits · Used Leads',
    tag: 'Returning Pro',
    userType: 'old',
    dbCredits: 6,
    dbExperience: 'used_leads',
    jobLeads: 3,
    dbTotal: 290,
    applicationsCount: 12,
    description: 'Used Hot Leads before, credits remaining, few leads live, strong organic flow.',
    userBehavior: 'Knows the feature. Strong applicant pipeline. Wants to act fast on the few live leads.',
    productObjective: 'Drive immediate unlock on live leads',
    goal: 'Surface leads directly — no intro copy. They know what to do.',
    nudgeVariant: 'engage',
  },
  {
    id: 'old-has-credits-used-db',
    label: 'Old · Has Credits · Used DB',
    tag: 'Power User',
    userType: 'old',
    dbCredits: 8,
    dbExperience: 'used_before',
    jobLeads: 15,
    dbTotal: 445,
    applicationsCount: 8,
    description: 'Experienced DB user, active credits, active leads.',
    userBehavior: 'Comfortable with DB. Actively hiring. Wants efficiency.',
    productObjective: 'Maximise engagement & unlock rate',
    goal: 'Surface best matches. Make bulk unlock easy. Keep momentum.',
    nudgeVariant: 'engage',
  },
];

export const JOB_LISTINGS: { id: string; title: string; location: string; status: 'active' | 'expired' }[] = [
  { id: '1', title: 'Field Sales Executive', location: 'Saket, Delhi-NCR', status: 'active' },
  { id: '2', title: 'Business Development Manager', location: 'Andheri, Mumbai', status: 'active' },
  { id: '3', title: 'Sales Team Lead', location: 'Koramangala, Bangalore', status: 'active' },
];

export interface ScenarioProps {
  totalLeads: number;
  dbCredits: number;
  applicantCount: number;
  hasUsedDb: boolean;
  dbTotal: number;
  // Lifted unlock state — passed from JobDetail so it survives tab switches
  unlockedIds?: Set<string>;
  creditsRemaining?: number;
  onUnlock?: (id: string) => void;
  onUnlockAndView?: (candidateId: string) => void;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  salary: string;
  location: string;
  initials: string;
  avatarColor: string;
  lastActive: string;
}

export const CANDIDATES: Candidate[] = [
  { id: '1', name: 'Simran Sharma', role: 'Business Development Executive at Reliance', experience: '4 Yrs', salary: '7 Lakh', location: 'Mumbai', initials: 'SS', avatarColor: '#a7f3d0', lastActive: '2h ago' },
  { id: '2', name: 'Rohan Roy', role: 'Development Executive at Game-berry', experience: '4 Yrs', salary: '7 Lakh', location: 'Mumbai', initials: 'RR', avatarColor: '#bfdbfe', lastActive: '5h ago' },
  { id: '3', name: 'Siddharth M.', role: 'Product Executive at Reliance SMSL Ltd', experience: '4 Yrs', salary: '7 Lakh', location: 'Mumbai', initials: 'SM', avatarColor: '#fde68a', lastActive: 'Today' },
  { id: '4', name: 'Priya Nair', role: 'Sales Manager at Bajaj Finserv', experience: '5 Yrs', salary: '9 Lakh', location: 'Pune', initials: 'PN', avatarColor: '#fecdd3', lastActive: '1h ago' },
  { id: '5', name: 'Arjun Mehta', role: 'Field Executive at HDFC Life', experience: '3 Yrs', salary: '6 Lakh', location: 'Delhi', initials: 'AM', avatarColor: '#d8b4fe', lastActive: '3h ago' },
  { id: '6', name: 'Neha Kapoor', role: 'Area Sales Executive at Max Life', experience: '6 Yrs', salary: '10 Lakh', location: 'Gurugram', initials: 'NK', avatarColor: '#99f6e4', lastActive: 'Today' },
];
