import React from 'react';

function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-100 bg-slate-900 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">
            UC Hotel Reservation
          </h3>
          <p className="mt-3 text-xs text-slate-400">
            Experience luxury, comfort, and personalized service in the heart of paradise.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Our Solutions
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-400">
            <li>Online Reservations</li>
            <li>Front Desk Management</li>
            <li>Room Inventory</li>
            <li>Guest Analytics</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Get in Touch
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-400">
            <li>Email: hello@uchotel.com</li>
            <li>Phone: +1 (555) 987-6543</li>
            <li>Address: 123 Paradise Avenue, Grand City</li>
          </ul>

          <div className="mt-4 flex gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs">
              f
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs">
              in
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs">
              ig
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-[11px] text-slate-500">
        &copy; {new Date().getFullYear()} UC Hotel Reservation. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

