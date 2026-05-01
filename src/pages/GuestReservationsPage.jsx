import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { deleteReservation, subscribeReservationsByGuest } from '../services/reservationsService';
import { getAllRooms } from '../services/roomsService';

function GuestReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedId = searchParams.get('id');

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeReservationsByGuest(user.uid, (reservationData) => {
      setReservations(reservationData);
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
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [rooms]);

  const handleCancel = async (reservationId) => {
    setBusyId(reservationId);
    setFeedback('');
    try {
      await deleteReservation(reservationId);
      setFeedback('Reservation cancelled and removed.');
    } catch (error) {
      setFeedback(error?.message || 'Unable to cancel reservation.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My Reservations</h1>
      <p className="mt-1 text-sm text-slate-500">
        View your room reservations and current booking statuses.
      </p>
      {feedback ? (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-100">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <p className="text-sm text-slate-500">No reservations yet. Start by booking a room.</p>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => {
              const room = roomsById.get(reservation.roomId);
              const isLocked = ['confirmed', 'checked-in', 'checked-out'].includes(
                reservation.status || 'pending',
              );
              return (
                <article
                  key={reservation.id}
                  className={`rounded-xl border p-4 shadow-sm ${
                    selectedId === reservation.id ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {room?.name || 'Room'}
                    </h2>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase text-primary ring-1 ring-orange-100">
                      {reservation.status || 'pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {reservation.checkInDate} to {reservation.checkOutDate}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Guests: {reservation.guests || 1} | Arrival: {reservation.arrivalTime || 'N/A'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => navigate(`/booking/${reservation.roomId}`)}
                      className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLocked ? 'Locked by staff confirmation' : 'Manage booking'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === reservation.id || isLocked}
                      onClick={() => handleCancel(reservation.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLocked
                        ? 'Cannot cancel after confirmation'
                        : busyId === reservation.id
                          ? 'Cancelling...'
                          : 'Cancel & delete'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default GuestReservationsPage;
