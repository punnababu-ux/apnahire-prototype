import { Link } from 'react-router-dom';
import { JOB_LISTINGS, SCENARIOS } from '../types';

// Each job is paired with a scenario so dashboard stats stay coherent with JobDetail.
const SCENARIO_BY_JOB: Record<string, string> = {
  '1': 'old-has-credits-used-db',   // Field Sales Executive  — experienced power user
  '2': 'new-has-credits',           // Business Dev Manager   — new user, credits ready
  '3': 'old-no-credits-used-db',    // Sales Team Lead        — needs repurchase
};

const JOB_META: Record<string, { postedOn: string; postedBy: string }> = {
  '1': { postedOn: 'Dec 10, 2022', postedBy: 'Rahul Pandey' },
  '2': { postedOn: 'Nov 30, 2022', postedBy: 'Rahul Pandey' },
  '3': { postedOn: 'Nov 15, 2022', postedBy: 'Priya Sharma' },
};

const JOBS = JOB_LISTINGS.map(job => {
  const scenarioId = SCENARIO_BY_JOB[job.id];
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;
  return {
    ...job,
    ...JOB_META[job.id],
    scenarioId,
    appliedCount: scenario.applicationsCount,
    toReview: Math.round(scenario.applicationsCount * 0.4),
    matchesCount: scenario.dbTotal,
  };
});

export function Dashboard() {
  return (
    <>
      <div className="jobs-header-row">
        <h1 className="jobs-title">All Jobs ({JOBS.length})</h1>
        <button className="post-btn">
          Post a new job
          <span className="material-icons-round text-[18px] select-none align-middle ml-1">expand_more</span>
        </button>
      </div>

      <div className="jobs-list">
        {JOBS.map(job => (
          <div className="job-row" key={job.id}>
            <div className="job-row-info">
              <div className="job-row-title-line">
                <Link to={`/job/${job.id}?scenario=${job.scenarioId}`} className="job-row-title">
                  {job.title}
                </Link>
                <span className={`pill ${job.status === 'expired' ? 'expired' : 'active'}`}>
                  {job.status === 'expired' ? 'Expired' : 'Active'}
                </span>
              </div>
              <div className="job-row-meta">
                <span>{job.location}</span>
                <span className="job-row-sep" aria-hidden="true"/>
                <span>Posted on : {job.postedOn}</span>
                <span className="job-row-sep" aria-hidden="true"/>
                <span>{job.postedBy}<span className="job-row-plus">+1</span></span>
              </div>
            </div>

            <div className="job-row-stats">
              <Link to={`/job/${job.id}?scenario=${job.scenarioId}`} className="job-row-stat">
                <div className="job-row-stat-top">
                  <span className="material-icons-round text-[18px] text-[#5e6c84] select-none">business_center</span>
                  <span className="job-row-stat-num">{job.appliedCount}</span>
                  <span className="job-row-stat-chevron" aria-hidden="true">›</span>
                  {job.toReview > 0 && (
                    <span className="pill pending">{job.toReview} pending</span>
                  )}
                </div>
                <span className="job-row-stat-label">Applied to job</span>
              </Link>

              <div className="job-row-stat-divider" aria-hidden="true"/>

              <Link to={`/job/${job.id}?scenario=${job.scenarioId}`} className="job-row-stat">
                <div className="job-row-stat-top">
                  <span className="material-icons-round text-[18px] text-[#5e6c84] select-none">person_search</span>
                  <span className="job-row-stat-num">{job.matchesCount.toLocaleString()}</span>
                  <span className="job-row-stat-chevron" aria-hidden="true">›</span>
                </div>
                <span className="job-row-stat-label">Database Matches</span>
              </Link>
            </div>

            <button className="duplicate-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
              Duplicate
            </button>
            <button className="job-row-more" aria-label="More options" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
              <span className="material-icons-round text-[20px] select-none text-gray-500">more_vert</span>
            </button>
          </div>
        ))}
      </div>

      <Link
        to="/archetypes"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-xl border border-gray-700 transition-colors"
      >
        <span className="material-icons-round text-[16px] select-none">home</span>
        Go to all journeys
      </Link>
    </>
  );
}
