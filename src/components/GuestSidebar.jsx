import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppModal from './AppModal';

function initials(nameOrEmail) {
  if (!nameOrEmail) return 'GU';
  const parts = String(nameOrEmail).trim().split(/\s+/);
  const first = parts[0]?.[0] || 'G';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : 'U';
  return (first + last).toUpperCase();
}

function GuestSidebar({ variant = 'rail', onNavigate }) {
  const { user } = useAuth();
  const [goProOpen, setGoProOpen] = useState(false);
  const [plan, setPlan] = useState('annual');
  const isDrawer = variant === 'drawer';
  const shellClass = isDrawer
    ? 'flex h-full min-h-0 flex-1 flex-col px-4 py-6'
    : 'hidden h-screen w-[280px] flex-shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex';

  const totalToday = useMemo(() => (plan === 'annual' ? 179.88 : 239.88), [plan]);

  return (
    <>
      <aside className={shellClass}>
        <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
          UC
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">UC Hotel</p>
          <p className="text-xs text-slate-500">Guest Member</p>
        </div>
      </div>

        <NavLink
          to="/guest/profile"
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `mt-7 block rounded-2xl p-3 ring-1 transition ${
              isActive
                ? 'bg-orange-50 ring-orange-100'
                : 'bg-slate-50 ring-slate-100 hover:bg-slate-100'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {initials(user?.displayName || user?.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">
                {user?.displayName || 'Guest'}
              </p>
              <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
        </NavLink>

        <nav className="mt-6 space-y-1">
          {[
            { to: '/guest/dashboard', label: 'Dashboard', icon: '🏠' },
            { to: '/guest/reservation', label: 'Reservation', icon: '🧾' },
            { to: '/rooms', label: 'Find a Room', icon: '🔎' },
            { to: '/guest/payment', label: 'Payment', icon: '💳' },
            { to: '/guest/profile', label: 'Profile', icon: '👤' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-orange-50 text-primary ring-1 ring-orange-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-50 to-white p-4 ring-1 ring-orange-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Upgrade now
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-900">Unlock extra 15% discount</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Enjoy exclusive member pricing and priority support.
          </p>
          <button
            type="button"
            onClick={() => setGoProOpen(true)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-orange-500"
          >
            Go Pro
          </button>
        </div>
      </aside>
      <AppModal
        open={goProOpen}
        title="Upgrade to Pro"
        message="Get premium member benefits with monthly or annual billing."
        onClose={() => setGoProOpen(false)}
        actions={
          <div className="w-full space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-900">Pro Member Benefits</p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                <li>15% off all bookings</li>
                <li>Priority customer support</li>
                <li>Free cancellation</li>
                <li>Early access to deals</li>
                <li>Exclusive member perks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPlan('monthly')}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                  plan === 'monthly' ? 'border-primary ring-1 ring-orange-100' : 'border-slate-200'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900">Monthly</span>
                <span className="text-lg font-semibold text-slate-900">$19.99</span>
              </button>
              <button
                type="button"
                onClick={() => setPlan('annual')}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                  plan === 'annual' ? 'border-primary ring-1 ring-orange-100' : 'border-slate-200'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900">Annual</span>
                <span className="text-lg font-semibold text-slate-900">$14.99</span>
              </button>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-[11px] text-slate-500">Total today</p>
              <p className="text-2xl font-semibold text-slate-900">${totalToday.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => setGoProOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
            >
              Upgrade to Pro
            </button>
            <button
              type="button"
              onClick={() => setGoProOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Maybe Later
            </button>
          </div>
        }
      />
    </>
  );
}

export default GuestSidebar;

