import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

export function Sidebar() {
  const { pathname } = useLocation();
  const { collapsed } = useSidebar();
  const isJobs = pathname === '/' || pathname.startsWith('/job');

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="company">
        <div className="z-icon">Z</div>
        <div className="company-name">Zomato pvt ltd</div>
      </div>

      <div className="nav-list">
        <Link className={`nav-item${isJobs ? ' active' : ''}`} to="/" title="Jobs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <span className="nav-label">Jobs</span>
        </Link>
        <Link className="nav-item" to="#plans" title="Plans & Usage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <span className="nav-label">Plans &amp; Usage</span>
          <span className="arrow">›</span>
        </Link>
        <Link className="nav-item" to="#database" title="Database">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
          </svg>
          <span className="nav-label">Database</span>
          <span className="arrow">›</span>
        </Link>
        <Link className="nav-item" to="#reports" title="Reports">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span className="nav-label">Reports</span>
        </Link>
      </div>

      <div className="divider"/>

      <div className="sidebar-bottom">
        <a className="contact" href="#contact" title="Contact Sales">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span className="nav-label">Contact Sales</span>
        </a>

        <div className="sidebar-divider-line"/>

        <div className="sidebar-cta-group">
          <button className="sidebar-cta sidebar-cta-primary" title="Buy credits">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M16.4436 9.16364C16.5063 8.96334 16.5405 8.75526 16.5455 8.54545V5.63636C16.5455 3.56364 13.4182 2 9.27273 2C5.12727 2 2 3.56364 2 5.63636V8.54545C2.04009 9.02997 2.20436 9.49598 2.47698 9.89853C2.74959 10.3011 3.12134 10.6266 3.55636 10.8436C3.48959 11.0404 3.4552 11.2467 3.45455 11.4545V14.3636C3.45455 16.4364 6.58182 18 10.7273 18C14.8727 18 18 16.4364 18 14.3636V11.4545C17.9608 10.9707 17.7968 10.5053 17.524 10.1038C17.2512 9.70228 16.879 9.37835 16.4436 9.16364ZM9.27273 12.1818C12.0727 12.1818 14.4073 11.4545 15.6291 10.3636C16.2109 10.7127 16.5455 11.0909 16.5455 11.4545C16.5455 12.3418 14.2764 13.6364 10.7273 13.6364C7.17818 13.6364 4.97455 12.3782 4.90909 11.4909C6.31313 11.9703 7.78929 12.204 9.27273 12.1818ZM9.27273 3.45455C12.8218 3.45455 15.0909 4.74909 15.0909 5.63636C15.0909 6.52364 12.8218 7.81818 9.27273 7.81818C5.72364 7.81818 3.45455 6.52364 3.45455 5.63636C3.45455 4.74909 5.72364 3.45455 9.27273 3.45455ZM3.45455 7.86182C5.2234 8.86805 7.23944 9.35694 9.27273 9.27273C11.306 9.35694 13.3221 8.86805 15.0909 7.86182V8.54545C15.0909 9.43273 12.8218 10.7273 9.27273 10.7273C5.72364 10.7273 3.45455 9.43273 3.45455 8.54545V7.86182ZM10.7273 16.5455C7.17818 16.5455 4.90909 15.2509 4.90909 14.3636V13.68C6.67795 14.6862 8.69398 15.1751 10.7273 15.0909C12.7606 15.1751 14.7766 14.6862 16.5455 13.68V14.3636C16.5455 15.2509 14.2764 16.5455 10.7273 16.5455Z"/>
            </svg>
            <span className="nav-label">Buy credits</span>
          </button>
          <button className="sidebar-cta sidebar-cta-secondary" title="Get apna unlimited">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4.58333 14.5827C3.30556 14.5827 2.22222 14.1382 1.33333 13.2493C0.444444 12.3605 0 11.2771 0 9.99935C0 8.72157 0.444444 7.63824 1.33333 6.74935C2.22222 5.86046 3.30556 5.41602 4.58333 5.41602C5.09722 5.41602 5.59028 5.50629 6.0625 5.68685C6.53472 5.8674 6.95833 6.12435 7.33333 6.45768L8.75 7.74935L7.5 8.87435L6.20833 7.70768C5.98611 7.51324 5.73611 7.36046 5.45833 7.24935C5.18056 7.13824 4.88889 7.08268 4.58333 7.08268C3.77778 7.08268 3.09028 7.3674 2.52083 7.93685C1.95139 8.50629 1.66667 9.19379 1.66667 9.99935C1.66667 10.8049 1.95139 11.4924 2.52083 12.0618C3.09028 12.6313 3.77778 12.916 4.58333 12.916C4.88889 12.916 5.18056 12.8605 5.45833 12.7493C5.73611 12.6382 5.98611 12.4855 6.20833 12.291L12.6667 6.45768C13.0417 6.12435 13.4653 5.8674 13.9375 5.68685C14.4097 5.50629 14.9028 5.41602 15.4167 5.41602C16.6944 5.41602 17.7778 5.86046 18.6667 6.74935C19.5556 7.63824 20 8.72157 20 9.99935C20 11.2771 19.5556 12.3605 18.6667 13.2493C17.7778 14.1382 16.6944 14.5827 15.4167 14.5827C14.9028 14.5827 14.4097 14.4924 13.9375 14.3118C13.4653 14.1313 13.0417 13.8743 12.6667 13.541L11.25 12.2493L12.5 11.1243L13.7917 12.291C14.0139 12.4855 14.2639 12.6382 14.5417 12.7493C14.8194 12.8605 15.1111 12.916 15.4167 12.916C16.2222 12.916 16.9097 12.6313 17.4792 12.0618C18.0486 11.4924 18.3333 10.8049 18.3333 9.99935C18.3333 9.19379 18.0486 8.50629 17.4792 7.93685C16.9097 7.3674 16.2222 7.08268 15.4167 7.08268C15.1111 7.08268 14.8194 7.13824 14.5417 7.24935C14.2639 7.36046 14.0139 7.51324 13.7917 7.70768L7.33333 13.541C6.95833 13.8743 6.53472 14.1313 6.0625 14.3118C5.59028 14.4924 5.09722 14.5827 4.58333 14.5827Z"/>
            </svg>
            <span className="nav-label">Get apna unlimited</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
