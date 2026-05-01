import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function initials(nameOrEmail) {
  if (!nameOrEmail) return 'FD';
  const parts = String(nameOrEmail).trim().split(/\s+/);
  const first = parts[0]?.[0] || 'F';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : 'D';
  return (first + last).toUpperCase();
}

const NAV = [
  { key: 'reservations', to: '/staff', label: 'Reservations', icon: '🗓️' },
  { key: 'rooms', to: '/staff/rooms', label: 'Rooms', icon: '🛏️' },
  { key: 'payments', to: '/staff?tab=payments', label: 'Payments', icon: '💳' },
  { key: 'profile', to: '/staff?tab=profile', label: 'Staff profile', icon: '👤' },
];

function navItemActive(pathname, search, key) {
  const params = new URLSearchParams(search);
  const tab = params.get('tab');
  if (key === 'rooms') return pathname.startsWith('/staff/rooms');
  if (key === 'reservations') {
    return pathname === '/staff' && tab !== 'payments' && tab !== 'profile';
  }
  if (key === 'payments') return pathname === '/staff' && tab === 'payments';
  if (key === 'profile') return pathname === '/staff' && tab === 'profile';
  return false;
}

function StaffSidebar({ variant = 'rail', onNavigate }) {
  const { user } = useAuth();
  const location = useLocation();
  const isDrawer = variant === 'drawer';

  const shellClass = isDrawer
    ? 'flex h-full min-h-0 flex-1 flex-col px-4 py-6'
    : 'hidden h-screen w-[260px] flex-shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex';

  return (
    <aside className={shellClass}>
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          UC
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">UC Hotel</p>
          <p className="text-xs text-slate-500">Front desk</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {NAV.map((item) => {
          const active = navItemActive(location.pathname, location.search, item.key);
          return (
            <NavLink
              key={item.key}
              to={item.to}
              onClick={() => onNavigate?.()}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                active
                  ? 'bg-orange-50 text-primary ring-1 ring-orange-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            {initials(user?.displayName || user?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900">
              {user?.displayName || 'Front desk'}
            </p>
            <p className="truncate text-[11px] text-slate-500">{user?.email || 'Staff account'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default StaffSidebar;
