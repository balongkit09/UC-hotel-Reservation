import React from 'react';
import { useNavigate } from 'react-router-dom';

function ReservationSuccessModal({ open, onClose, reservationId }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close success modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />
      <div className="relative mx-auto mt-28 w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl ring-1 ring-emerald-100">
          ✓
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold text-slate-900">
          Reservation Submitted
        </h3>
        <p className="mt-2 text-center text-sm text-slate-500">
          Your reservation has been saved successfully.
        </p>
        {reservationId ? (
          <p className="mt-2 text-center text-xs font-semibold text-slate-700">
            Booking ID: #{String(reservationId).slice(0, 8).toUpperCase()}
          </p>
        ) : null}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/guest/reservation')}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-500"
          >
            View Reservation
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationSuccessModal;
