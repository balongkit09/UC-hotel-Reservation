import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function DashboardSidebar() {
  const { role } = useAuth();
  const location = useLocation();

  const itemsByRole = {
    guest: [
      { to: '/guest', label: 'My Reservations' },
      { to: '/rooms', label: 'Browse Rooms' },
    ],
    staff: [
      { to: '/staff', label: 'Today\'s Arrivals' },
      { to: '/staff?tab=all', label: 'All Reservations' },
    ],
    admin: [
      { to: '/admin', label: 'Overview' },
      { to: '/admin?tab=rooms', label: 'Manage Rooms' },
      { to: '/admin?tab=staff', label: 'Manage Staff' },
      { to: '/admin?tab=reservations', label: 'Manage Reservations' },
    ],
  };

  const items = itemsByRole[role] || [];

  return (
    <aside className="hidden w-56 flex-shrink-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:block">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Dashboard
      </p>
      <nav className="mt-3 space-y-1 text-sm">
        {items.map((item) => {
          const isActive = location.pathname + location.search === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
                isActive
                  ? 'bg-orange-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default DashboardSidebar;

