import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ucLogo from '../img/UC logo.jpg';

function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath =
    role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : role === 'guest' ? '/guest' : null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={ucLogo}
            alt="UC Hotel logo"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-slate-900">
              UC Hotel
            </span>
            <span className="text-xs text-slate-500">Reservation</span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-primary ${isActive ? 'text-primary' : ''}`
            }
          >
            Home
          </NavLink>
          <a href="#about" className="hover:text-primary">
            About
          </a>
          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `hover:text-primary ${isActive ? 'text-primary' : ''}`
            }
          >
            Rooms
          </NavLink>
          <a href="#contact" className="hover:text-primary">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-3">
          {dashboardPath && (
            <Link
              to={dashboardPath}
              className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary sm:inline-block"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-500"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

