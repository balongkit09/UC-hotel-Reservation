import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function initials(nameOrEmail) {
  if (!nameOrEmail) return 'GU';
  const parts = String(nameOrEmail).trim().split(/\s+/);
  const first = parts[0]?.[0] || 'G';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : 'U';
  return (first + last).toUpperCase();
}

function GuestProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest User');
  const email = user?.email || 'No email linked';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <section>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary ring-4 ring-orange-100">
            {initials(displayName)}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">{email}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoCard
          title="Payment Methods"
          text="Manage your connected cards and preferred payment options."
          action="Edit Methods"
        />
        <InfoCard
          title="Security & Login"
          text="Update your password and monitor account sign-in activity."
          action="Manage Security"
        />
        <InfoCard
          title="Notifications"
          text="Choose how you want to receive booking and account updates."
          action="Configure Settings"
        />
        <InfoCard
          title="Support & About"
          text="Access our help center and terms for platform usage."
          action="Help Center"
          secondaryAction="Terms"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-red-50 px-5 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-100 hover:bg-red-100"
        >
          Log Out
        </button>
      </div>
    </section>
  );
}

function InfoCard({ title, text, action, secondaryAction }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          {action}
        </button>
        {secondaryAction ? (
          <button
            type="button"
            className="rounded-lg bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {secondaryAction}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default GuestProfilePage;
