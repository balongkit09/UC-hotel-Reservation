const DEFAULT_PREFERENCES = {
  language: 'en',
  currency: 'USD',
  theme: 'light',
};

function storageKey(userId) {
  return `uc.preferences.${userId || 'guest'}`;
}

export function getPreferences(userId) {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(userId, preferences) {
  const next = { ...DEFAULT_PREFERENCES, ...preferences };
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
}

export { DEFAULT_PREFERENCES };
