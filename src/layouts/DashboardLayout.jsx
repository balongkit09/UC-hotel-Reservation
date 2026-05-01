import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StaffSidebar from '../components/StaffSidebar';
import GuestSidebar from '../components/GuestSidebar';
import AdminSidebar from '../components/AdminSidebar';
import DashboardTopbar from '../components/DashboardTopbar';
import { getDashboardPath } from '../utils/roles';

function DashboardLayout({ children }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    // If a logged-in user hits browser-back to "/", keep them in their portal.
    const onPopState = () => {
      const path = window.location.pathname;
      if (path === '/' && role) {
        navigate(getDashboardPath(role), { replace: true });
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate, role]);

  useEffect(() => {
    if (role && location.pathname === '/') {
      navigate(getDashboardPath(role), { replace: true });
    }
  }, [location.pathname, navigate, role]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="dashboard-shell min-h-screen bg-[#F6F7FB]">
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={closeMobileNav}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(280px,92vw)] flex-col overflow-y-auto border-r border-slate-100 bg-white shadow-xl">
            {role === 'staff' ? <StaffSidebar variant="drawer" onNavigate={closeMobileNav} /> : null}
            {role === 'guest' ? <GuestSidebar variant="drawer" onNavigate={closeMobileNav} /> : null}
            {role === 'admin' ? <AdminSidebar variant="drawer" onNavigate={closeMobileNav} /> : null}
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        {role === 'staff' ? <StaffSidebar variant="rail" /> : null}
        {role === 'guest' ? <GuestSidebar variant="rail" /> : null}
        {role === 'admin' ? <AdminSidebar variant="rail" /> : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;

