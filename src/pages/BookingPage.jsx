import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import ReservationSuccessModal from '../components/ReservationSuccessModal';
import { getRoomById } from '../services/roomsService';
import { createReservation } from '../services/reservationsService';
import { useAuth } from '../hooks/useAuth';

function BookingPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getRoomById(roomId);
      setRoom(data);
      setLoading(false);
    };
    load();
  }, [roomId]);

  const handleSubmit = async (values) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const reservation = await createReservation({
        guestId: user.uid,
        guestEmail: user.email || '',
        guestName: user.displayName || '',
        roomId,
        checkInDate: values.checkInDate,
        checkOutDate: values.checkOutDate,
        guests: Number(values.guests),
        arrivalTime: values.arrivalTime,
        notes: values.notes || '',
        paymentStatus: 'unpaid',
      });
      setReservationId(reservation?.id || '');
      setShowSuccessModal(true);
      setSuccess('Reservation submitted successfully! Our team will confirm shortly.');
    } catch (err) {
      console.error('createReservation failed:', err);
      setError(err?.message || 'Unable to create reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">Room not found.</p>
      </div>
    );
  }

  const roomUnavailable = room.status && room.status !== 'available';

  return (
    <div className="bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Booking
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Reserve {room.name}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Complete the form below to request your stay. You&apos;ll receive an update once your
              booking is confirmed.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
            {roomUnavailable ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                This room is currently marked as unavailable. Please select a different room.
              </div>
            ) : (
              <BookingForm room={room} onSubmit={handleSubmit} />
            )}
            <div className="space-y-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-900">Reservation summary</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{room.name}</p>
                <p className="text-xs text-slate-500">
                  {room.type} · Up to {room.capacity} guests · Free WiFi · No smoking
                </p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-inner ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Nightly rate</span>
                  <span className="text-sm font-semibold text-primary">${room.price}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Taxes and fees will be calculated at check-out.
                </p>
              </div>
              {error && <p className="text-xs font-medium text-red-500">{error}</p>}
              {success && <p className="text-xs font-medium text-emerald-600">{success}</p>}
              {roomUnavailable && (
                <p className="text-[11px] font-medium text-amber-700">Booking is disabled for this room.</p>
              )}
              {submitting && (
                <p className="text-[11px] text-slate-500">Submitting your reservation...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReservationSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        reservationId={reservationId}
      />
    </div>
  );
}

export default BookingPage;

