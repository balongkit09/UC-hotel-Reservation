import React from 'react';
import { NavLink } from 'react-router-dom';

function AdminSidebar({ variant = 'rail', onNavigate }) {
  const isDrawer = variant === 'drawer';
  const shellClass = isDrawer
    ? 'flex h-full min-h-0 flex-1 flex-col px-4 py-6'
    : 'hidden h-screen w-[260px] flex-shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex';

  return (
    <aside className={shellClass}>
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          UC
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">UC Hotel</p>
          <p className="text-xs text-slate-500">Administration</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {[
          { to: '/admin', label: 'Overview', icon: '📊' },
          { to: '/admin?tab=rooms', label: 'Rooms', icon: '🛏️' },
          { to: '/admin?tab=staff', label: 'Staff', icon: '👥' },
          { to: '/admin?tab=reservations', label: 'Reservations', icon: '🗓️' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;

