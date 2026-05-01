export const ROLE_GUEST = 'guest';
export const ROLE_STAFF = 'staff';
export const ROLE_ADMIN = 'admin';

export function getDashboardPath(role) {
  if (role === ROLE_ADMIN) return '/admin';
  if (role === ROLE_STAFF) return '/staff';
  if (role === ROLE_GUEST) return '/guest/dashboard';
  return '/';
}

