import { useSidebar } from '../context/SidebarContext';
import { useCredits } from '../context/CreditsContext';

export function TopNav() {
  const { toggle } = useSidebar();
  const { credits, pulseKey } = useCredits();

  return (
    <header className="topbar">
      <button
        className="hamburger"
        aria-label="Toggle sidebar"
        onClick={toggle}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="logo">apna<span className="g">Hire</span></div>

      <div className="topbar-right">
        <button
          type="button"
          key={pulseKey}
          className="available-credit"
          title={`Available credit: ${credits.toLocaleString()}`}
          onClick={() => alert(`You have ${credits} database credits.\n\nCredits unlock candidate contacts (1 credit each).`)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M16.4436 9.16364C16.5063 8.96334 16.5405 8.75526 16.5455 8.54545V5.63636C16.5455 3.56364 13.4182 2 9.27273 2C5.12727 2 2 3.56364 2 5.63636V8.54545C2.04009 9.02997 2.20436 9.49598 2.47698 9.89853C2.74959 10.3011 3.12134 10.6266 3.55636 10.8436C3.48959 11.0404 3.4552 11.2467 3.45455 11.4545V14.3636C3.45455 16.4364 6.58182 18 10.7273 18C14.8727 18 18 16.4364 18 14.3636V11.4545C17.9608 10.9707 17.7968 10.5053 17.524 10.1038C17.2512 9.70228 16.879 9.37835 16.4436 9.16364ZM9.27273 12.1818C12.0727 12.1818 14.4073 11.4545 15.6291 10.3636C16.2109 10.7127 16.5455 11.0909 16.5455 11.4545C16.5455 12.3418 14.2764 13.6364 10.7273 13.6364C7.17818 13.6364 4.97455 12.3782 4.90909 11.4909C6.31313 11.9703 7.78929 12.204 9.27273 12.1818ZM9.27273 3.45455C12.8218 3.45455 15.0909 4.74909 15.0909 5.63636C15.0909 6.52364 12.8218 7.81818 9.27273 7.81818C5.72364 7.81818 3.45455 6.52364 3.45455 5.63636C3.45455 4.74909 5.72364 3.45455 9.27273 3.45455ZM3.45455 7.86182C5.2234 8.86805 7.23944 9.35694 9.27273 9.27273C11.306 9.35694 13.3221 8.86805 15.0909 7.86182V8.54545C15.0909 9.43273 12.8218 10.7273 9.27273 10.7273C5.72364 10.7273 3.45455 9.43273 3.45455 8.54545V7.86182ZM10.7273 16.5455C7.17818 16.5455 4.90909 15.2509 4.90909 14.3636V13.68C6.67795 14.6862 8.69398 15.1751 10.7273 15.0909C12.7606 15.1751 14.7766 14.6862 16.5455 13.68V14.3636C16.5455 15.2509 14.2764 16.5455 10.7273 16.5455Z"/>
          </svg>
          <span className="available-credit-label">Available credit</span>
        </button>
        <div className="avatar">RS</div>
      </div>
    </header>
  );
}
