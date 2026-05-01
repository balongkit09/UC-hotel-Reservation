import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/roles';
import AppModal from '../components/AppModal';

function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authError = location.state?.authError;

  useEffect(() => {
    if (authError) {
      setErrorModalMessage(authError);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [authError, location.pathname, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModalMessage('');
    setLoading(true);
    try {
      const { role } = await login(form.email, form.password);
      const redirect = location.state?.from?.pathname || getDashboardPath(role);
      navigate(redirect, { replace: true });
    } catch (err) {
      setErrorModalMessage(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 px-4 py-10">
      <div className="grid w-full max-w-4xl gap-10 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 md:grid-cols-[1.3fr,1fr] md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Welcome back
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to UC Hotel Reservation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Access your personalized dashboard to manage reservations, guests, and room inventory.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create a guest account
            </Link>
          </p>
        </div>

        <div className="hidden flex-col justify-between rounded-2xl bg-slate-900 p-6 text-slate-100 md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
              UC Hotel
            </p>
            <h2 className="mt-3 text-lg font-semibold">
              A seamless experience for guests, staff, and administrators.
            </h2>
            <p className="mt-3 text-xs text-slate-300">
              Guests can browse rooms and track their stays. Front desk staff manage arrivals,
              departures, and confirmations. Administrators oversee rooms, staff accounts, and
              reservation analytics in one intuitive dashboard.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Tip: Use Firestore to assign roles (`guest`, `staff`, `admin`) in the `users`
            collection to control which dashboard each user can access.
          </div>
        </div>
      </div>
      </div>
      <AppModal
        open={Boolean(errorModalMessage)}
        title="Login Error"
        message={errorModalMessage}
        onClose={() => setErrorModalMessage('')}
      />
    </>
  );
}

export default LoginPage;

