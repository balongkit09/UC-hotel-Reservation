import React, { useMemo } from 'react';

function formatTimestamp(ts) {
  if (!ts) return null;
  if (typeof ts === 'string') return ts;
  if (typeof ts?.toDate === 'function') return ts.toDate().toLocaleString();
  return null;
}

function ReservationDetailsModal({ open, onClose, reservation, guest, room }) {
  const title = useMemo(() => {
    if (!reservation) return 'Reservation details';
    const id = reservation.id ? `#${String(reservation.id).slice(0, 8).toUpperCase()}` : '';
    return `Reservation ${id}`;
  }, [reservation]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />

      <div className="relative mx-auto mt-24 w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {reservation?.status ? String(reservation.status).replace('-', ' ') : 'Reservation'}
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoTile
              label="Guest"
              value={guest?.name || guest?.email || reservation?.guestId || '—'}
              subValue={guest?.email || null}
            />
            <InfoTile label="Room" value={room?.name || reservation?.roomId || '—'} subValue={room?.type || null} />
            <InfoTile label="Check-in date" value={reservation?.checkInDate || '—'} />
            <InfoTile label="Check-out date" value={reservation?.checkOutDate || '—'} />
            <InfoTile label="Guests" value={reservation?.guests != null ? String(reservation.guests) : '—'} />
            <InfoTile label="Planned arrival time" value={reservation?.arrivalTime || '—'} />
            <InfoTile label="Checked-in at" value={formatTimestamp(reservation?.checkedInAt) || '—'} />
            <InfoTile label="Checked-out at" value={formatTimestamp(reservation?.checkedOutAt) || '—'} />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, subValue }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      {subValue ? <p className="mt-0.5 text-[11px] text-slate-500">{subValue}</p> : null}
    </div>
  );
}

export default ReservationDetailsModal;

