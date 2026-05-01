import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../hooks/useAuth';
import { deleteReservation, subscribeReservationsByGuest } from '../services/reservationsService';
import { getAllRooms } from '../services/roomsService';
import AppModal from '../components/AppModal';

function GuestDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrReservation, setQrReservation] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeReservationsByGuest(user.uid, (resData) => {
      setReservations(resData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const loadRooms = async () => {
      const roomData = await getAllRooms();
      setRooms(roomData);
    };
    loadRooms();
  }, []);

  const roomsById = useMemo(() => {
    const map = new Map();
    rooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [rooms]);

  const upcoming = useMemo(() => {
    return reservations.find((r) => !['checked-out', 'cancelled'].includes(r.status));
  }, [reservations]);

  const past = useMemo(() => {
    return reservations.filter((r) => ['checked-out'].includes(r.status));
  }, [reservations]);

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest');

  useEffect(() => {
    if (!qrReservation) {
      setQrImage('');
      return;
    }
    const payload = JSON.stringify({
      reservationId: qrReservation.id,
      guestId: qrReservation.guestId,
      roomId: qrReservation.roomId,
      checkInDate: qrReservation.checkInDate,
      checkOutDate: qrReservation.checkOutDate,
    });
    QRCode.toDataURL(payload, { width: 280, margin: 2 })
      .then((dataUrl) => setQrImage(dataUrl))
      .catch(() => setQrImage(''));
  }, [qrReservation]);

  const handleCancel = async (reservation) => {
    if (!window.confirm('Cancel and delete this reservation? This action cannot be undone.')) return;
    setBusyId(reservation.id);
    setFeedback('');
    try {
      await deleteReservation(reservation.id);
      setFeedback('Reservation cancelled and removed.');
    } catch (error) {
      setFeedback(error?.message || 'Unable to cancel reservation.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            You have{' '}
            <span className="font-semibold text-slate-900">
              {upcoming ? '1 upcoming stay' : '0 upcoming stays'}
            </span>{' '}
            and <span className="font-semibold text-primary">2</span> reward points expiring soon.
          </p>
        </div>
      </div>
      {feedback ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-100">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ActionCard
          title="Find a Room"
          text="Explore our premium rooms and suites with exclusive member pricing."
          accent="primary"
        />
        <ActionCard
          title="Customer Support"
          text="Get 24/7 assistance with your current or future booking instantly."
          accent="dark"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Stays</h2>
        <span className="text-xs font-semibold text-primary">View all bookings</span>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex h-28 items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !upcoming ? (
          <p className="text-sm text-slate-500">
            No upcoming stays yet. Browse rooms to book your next trip.
          </p>
        ) : (
          <UpcomingStayCard
            reservation={upcoming}
            room={roomsById.get(upcoming.roomId)}
            busy={busyId === upcoming.id}
            onGetQr={() => setQrReservation(upcoming)}
            onManage={() => navigate(`/guest/reservation?id=${upcoming.id}`)}
            onCancel={() => handleCancel(upcoming)}
          />
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Past Stays</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(past.length ? past : reservations.slice(0, 3)).map((r) => (
            <PastStayCard key={r.id} reservation={r} room={roomsById.get(r.roomId)} />
          ))}
          {reservations.length === 0 && !loading ? (
            <p className="text-sm text-slate-500 md:col-span-3">
              No stays yet. Book a room to start your journey.
            </p>
          ) : null}
        </div>
      </div>
      <AppModal
        open={Boolean(qrReservation)}
        title="Check-in QR code"
        message="Present this QR code at front desk for faster check-in verification."
        onClose={() => setQrReservation(null)}
        actions={
          <div className="w-full">
            <div className="flex justify-center rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              {qrImage ? (
                <img src={qrImage} alt="Check-in QR code" className="h-56 w-56 rounded-xl bg-white p-2" />
              ) : (
                <div className="flex h-56 w-56 items-center justify-center text-xs text-slate-500">Generating QR...</div>
              )}
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Ref: {qrReservation?.id?.slice(0, 8).toUpperCase() || '—'}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setQrReservation(null)}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
              >
                Close
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}

function ActionCard({ title, text, accent }) {
  const iconBg = accent === 'primary' ? 'bg-orange-50' : 'bg-slate-900';
  const iconText = accent === 'primary' ? 'text-primary' : 'text-white';

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} ${iconText}`}>
          {accent === 'primary' ? '🔎' : '💬'}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}

function UpcomingStayCard({ reservation, room, onGetQr, onManage, onCancel, busy }) {
  const img =
    room?.image ||
    'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const roomName = room?.name || 'Suite Room';
  const roomType = room?.type || 'Deluxe Suite';
  const isLocked = ['confirmed', 'checked-in', 'checked-out'].includes(reservation.status || 'pending');

  return (
    <div className="grid gap-4 md:grid-cols-[1fr,1.5fr]">
      <div className="overflow-hidden rounded-2xl bg-slate-900">
        <img src={img} alt={roomName} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-primary ring-1 ring-orange-100">
              {reservation.status?.toUpperCase() || 'CONFIRMED'}
            </span>
            <p className="mt-3 text-lg font-semibold text-slate-900">{roomName}</p>
            <p className="mt-1 text-xs text-slate-500">{roomType}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500">BOOKING ID</p>
            <p className="text-xs font-semibold text-slate-900">
              {reservation.id.slice(0, 2).toUpperCase()}-{reservation.id.slice(2, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <InfoTile label="Check In" value={reservation.checkInDate} />
          <InfoTile label="Check Out" value={reservation.checkOutDate} />
          <InfoTile label="Room Type" value={roomType} />
          <InfoTile label="Guests" value={`${reservation.guests || 1} Guests`} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGetQr}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-500"
          >
            Get Check-in QR
          </button>
          <button
            type="button"
            disabled={isLocked}
            onClick={onManage}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLocked ? 'Booking Locked' : 'Manage Booking'}
          </button>
          <button
            type="button"
            disabled={busy || isLocked}
            onClick={onCancel}
            className="ml-auto rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLocked ? 'Cannot Cancel' : busy ? 'Cancelling...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-900">{value || '—'}</p>
    </div>
  );
}

function PastStayCard({ reservation, room }) {
  const img =
    room?.image ||
    'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const name = room?.name || 'Standard Room';
  const score = room?.rating || 4.8;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="h-32 overflow-hidden bg-slate-900">
        <img src={img} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-100">
            Rebook
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          {reservation.checkInDate} → {reservation.checkOutDate}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">★ {score}</span>
          <span className="text-xs font-semibold text-primary">Rebook</span>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;

