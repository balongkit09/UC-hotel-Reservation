import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeReservationsByGuest } from '../services/reservationsService';
import { subscribePaymentsByGuest } from '../services/paymentsService';
import { getAllRooms } from '../services/roomsService';

function GuestPaymentsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!user?.uid) return undefined;
    const unsubscribe = subscribePaymentsByGuest(user.uid, (paymentData) => {
      setPayments(paymentData);
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

  const totalAmount = reservations.reduce((sum, reservation) => {
    const room = roomsById.get(reservation.roomId);
    return sum + Number(room?.price || 0);
  }, 0);

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Payments</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track reservation payment status and estimated charges.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-xs text-slate-500">Estimated total charges</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">${totalAmount}</p>
            </div>
            {reservations.length === 0 ? (
              <p className="text-sm text-slate-500">No payment records yet.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((reservation) => {
                  const room = roomsById.get(reservation.roomId);
                  const amount = Number(room?.price || 0);
                  const paymentStatus = reservation.paymentStatus || 'unpaid';
                  const latestPayment = payments.find((p) => p.reservationId === reservation.id);

                  return (
                    <article
                      key={reservation.id}
                      className="rounded-xl border border-slate-100 p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {room?.name || 'Room'} - ${amount}
                        </p>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase text-slate-700 ring-1 ring-slate-200">
                          {paymentStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Stay period: {reservation.checkInDate} to {reservation.checkOutDate}
                      </p>
                      {latestPayment ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Method: {latestPayment.method === 'bank' ? 'Bank Payment' : 'Cash'}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default GuestPaymentsPage;
