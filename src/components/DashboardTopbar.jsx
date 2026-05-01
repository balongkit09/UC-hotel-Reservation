import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/roles';
import { subscribeRecentNotifications } from '../services/notificationsService';
import { applyTheme, getPreferences, savePreferences } from '../services/preferencesService';

function DashboardTopbar({ onOpenMobileNav }) {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [seenLatestNotificationId, setSeenLatestNotificationId] = useState(null);
  const [preferences, setPreferences] = useState(() => getPreferences(user?.uid));
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState('preference');

  useEffect(() => {
    const next = getPreferences(user?.uid);
    setPreferences(next);
    applyTheme(next.theme);
  }, [user?.uid]);

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    const unsub = subscribeRecentNotifications((items) => {
      setNotifications(items);
    }, 12);
    return () => unsub && unsub();
  }, []);

  const unreadCount = useMemo(() => {
    if (!notifications.length) return 0;
    if (!seenLatestNotificationId) return notifications.length;
    const seenIndex = notifications.findIndex((n) => n.id === seenLatestNotificationId);
    if (seenIndex === -1) return notifications.length;
    return seenIndex;
  }, [notifications, seenLatestNotificationId]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true, state: { from: { pathname: getDashboardPath(role) } } });
    }
  };

  const profilePath = role === 'guest' ? '/guest/profile' : role === 'staff' ? '/staff?tab=profile' : '/admin';

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onOpenMobileNav ? (
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 hover:bg-slate-50 md:hidden"
              aria-label="Open navigation menu"
            >
              ☰
            </button>
          ) : null}
          <div className="hidden text-xs font-semibold text-slate-700 sm:block">
            {role === 'staff' ? 'Front Desk Portal' : role === 'guest' ? 'Guest Portal' : 'Admin Portal'}
          </div>
          <div className="relative min-w-0 flex-1">
            <input
              placeholder="Quick search for guest names, room IDs, or booking IDs"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-xs text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 sm:inline-flex"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((v) => !v);
              if (notifications[0]?.id) setSeenLatestNotificationId(notifications[0].id);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            aria-label="Notifications"
          >
            🔔
          </button>
          {unreadCount > 0 ? (
            <span className="absolute right-[5.6rem] top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setSettingsOpen((v) => !v);
              setNotificationsOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            aria-label="Settings"
          >
            ⚙
          </button>
          {role === 'staff' ? (
            <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:block">
              <p className="text-[11px] font-semibold text-slate-900">Desk 04</p>
              <p className="text-[10px] text-slate-500">Terminal North</p>
            </div>
          ) : null}

          {notificationsOpen ? (
            <div className="absolute right-0 top-12 z-30 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold text-slate-900">Recent notifications</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Reservation and room activity across all dashboards.
                </p>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-slate-500">No notifications yet.</p>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="border-b border-slate-100 px-4 py-3 last:border-b-0">
                      <p className="text-xs font-semibold text-slate-900">{item.title || 'System update'}</p>
                      <p className="mt-1 text-[11px] text-slate-600">{item.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                        {toRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
          {settingsOpen ? (
            <div className="absolute right-0 top-12 z-30 w-[min(95vw,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="grid grid-cols-[140px,1fr]">
                <div className="border-r border-slate-100 bg-slate-50 p-2">
                  {[
                    { id: 'preference', label: 'Preference' },
                    { id: 'profile', label: 'Profile' },
                    { id: 'security', label: 'Security' },
                    { id: 'payment', label: 'Payment' },
                    { id: 'notification', label: 'Notification' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSettingsSection(item.id)}
                      className={`mb-1 w-full rounded-lg px-2 py-2 text-left text-[11px] font-semibold ${
                        settingsSection === item.id
                          ? 'bg-white text-slate-900 ring-1 ring-slate-200'
                          : 'text-slate-600 hover:bg-white/70'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {settingsSection === 'preference' ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-900">Preferences</p>
                      <SettingsField label="Language">
                        <select
                          value={preferences.language}
                          onChange={(e) =>
                            setPreferences((prev) => ({ ...prev, language: e.target.value }))
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="en">English</option>
                          <option value="fil">Filipino</option>
                          <option value="es">Spanish</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </SettingsField>
                      <SettingsField label="Money exchange">
                        <select
                          value={preferences.currency}
                          onChange={(e) =>
                            setPreferences((prev) => ({ ...prev, currency: e.target.value }))
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="PHP">PHP - Philippine Peso</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                      </SettingsField>
                      <SettingsField label="Theme">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPreferences((prev) => ({ ...prev, theme: 'light' }))}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                              preferences.theme === 'light'
                                ? 'border-orange-200 bg-orange-50 text-primary'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            Light
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreferences((prev) => ({ ...prev, theme: 'dark' }))}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                              preferences.theme === 'dark'
                                ? 'border-slate-400 bg-slate-800 text-white'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            Dark
                          </button>
                        </div>
                      </SettingsField>
                      {settingsSaved ? (
                        <p className="text-[11px] font-medium text-emerald-600">Settings saved.</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          savePreferences(user?.uid, preferences);
                          setSettingsSaved(true);
                          setTimeout(() => setSettingsSaved(false), 1500);
                        }}
                        className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
                      >
                        Save preferences
                      </button>
                    </div>
                  ) : null}
                  {settingsSection === 'profile' ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Profile</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Open your profile details and account information.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsOpen(false);
                          navigate(profilePath);
                        }}
                        className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Open profile
                      </button>
                    </div>
                  ) : null}
                  {settingsSection === 'security' ? (
                    <SettingsPlaceholder text="Security tools (password and sessions) are available in the next update." />
                  ) : null}
                  {settingsSection === 'payment' ? (
                    <SettingsPlaceholder text="Payment preferences will be available here, including preferred billing method." />
                  ) : null}
                  {settingsSection === 'notification' ? (
                    <SettingsPlaceholder text="Notification delivery controls (email / in-app) will be available here." />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      </header>
    </>
  );
}

function SettingsField({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SettingsPlaceholder({ text }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-900">Coming soon</p>
      <p className="mt-1 text-[11px] text-slate-500">{text}</p>
    </div>
  );
}

function toRelativeTime(value) {
  if (!value) return 'just now';
  const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 60 * 1000) return 'just now';
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default DashboardTopbar;

