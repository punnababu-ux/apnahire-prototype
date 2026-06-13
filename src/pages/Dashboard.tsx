import { Link } from 'react-router-dom';
import { SCENARIOS } from '../types';

const JOBS = [
  {
    id: 'field-sales',
    title: 'Field Sales Executive',
    locationShort: 'Saket, Delhi-NCR',
    postedOn: 'Dec 10, 2022',
    postedBy: 'Rahul pandey',
    appliedCount: 50,
    toReview: 20,
    matchesCount: 10293,
    status: 'active',
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    locationShort: 'Narayana guda, Hyderabad',
    postedOn: 'Nov 30, 2022',
    postedBy: 'Rahul pandey',
    appliedCount: 0,
    toReview: 0,
    matchesCount: 12150,
    status: 'active',
  },
  {
    id: 'customer-support',
    title: 'Customer Support Executive',
    locationShort: 'Koramangala, Bengaluru',
    postedOn: 'Nov 15, 2022',
    postedBy: 'Priya sharma',
    appliedCount: 78,
    toReview: 35,
    matchesCount: 8420,
    status: 'expired',
  },
];

const defaultScenario = SCENARIOS[0].id;

export function Dashboard() {
  return (
    <>
      <div className="jobs-header-row">
        <h1 className="jobs-title">All Jobs ({JOBS.length})</h1>
        <button className="post-btn">
          Post a new job
          <svg className="post-btn-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <div className="jobs-list">
        {JOBS.map(job => (
          <div className="job-row" key={job.id}>
            <div className="job-row-info">
              <div className="job-row-title-line">
                <Link to={`/job/${job.id}?scenario=${defaultScenario}`} className="job-row-title">
                  {job.title}
                </Link>
                <span className={`pill ${job.status === 'expired' ? 'expired' : 'active'}`}>
                  {job.status === 'expired' ? 'Expired' : 'Active'}
                </span>
              </div>
              <div className="job-row-meta">
                <span>{job.locationShort}</span>
                <span className="job-row-sep" aria-hidden="true"/>
                <span>Posted on : {job.postedOn}</span>
                <span className="job-row-sep" aria-hidden="true"/>
                <span>{job.postedBy}<span className="job-row-plus">+1</span></span>
              </div>
            </div>

            <div className="job-row-stats">
              <Link to={`/job/${job.id}?scenario=${defaultScenario}`} className="job-row-stat">
                <div className="job-row-stat-top">
                  <span className="job-row-stat-num">{job.appliedCount}</span>
                  <span className="job-row-stat-chevron" aria-hidden="true">›</span>
                  {job.toReview > 0 && (
                    <span className="pill pending">{job.toReview} pending</span>
                  )}
                </div>
                <span className="job-row-stat-label">Applied to job</span>
              </Link>

              <div className="job-row-stat-divider" aria-hidden="true"/>

              <Link to={`/job/${job.id}?scenario=${defaultScenario}`} className="job-row-stat">
                <div className="job-row-stat-top">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.6"/>
                <circle cx="12" cy="12" r="1.6"/>
                <circle cx="12" cy="19" r="1.6"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <Link
        to="/archetypes"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-xl border border-gray-700 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Go to all journeys
      </Link>
    </>
  );
}
