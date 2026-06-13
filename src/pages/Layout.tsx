import { Outlet } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { Sidebar } from '../components/Sidebar';
import { SidebarProvider } from '../context/SidebarContext';
import { CreditsProvider } from '../context/CreditsContext';

export function Layout() {
  return (
    <SidebarProvider>
      <CreditsProvider>
        <TopNav />
        <div className="layout">
          <Sidebar />
          <main>
            <Outlet />
          </main>
        </div>
      </CreditsProvider>
    </SidebarProvider>
  );
}
