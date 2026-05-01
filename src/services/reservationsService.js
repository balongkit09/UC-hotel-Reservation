import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { createSystemNotification } from './notificationsService';

const RESERVATIONS_COLLECTION = 'reservations';

function sortByCheckInDateDesc(items) {
  return [...items].sort((a, b) => {
    const dateA = a?.checkInDate ? new Date(a.checkInDate).getTime() : 0;
    const dateB = b?.checkInDate ? new Date(b.checkInDate).getTime() : 0;
    return dateB - dateA;
  });
}

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'checked-in'];
const LOCKED_GUEST_ACTION_STATUSES = ['confirmed', 'checked-in', 'checked-out'];

function dateRangesOverlap(startA, endA, startB, endB) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export async function createReservation({
  guestId,
  guestEmail,
  guestName,
  roomId,
  checkInDate,
  checkOutDate,
  guests,
  status = 'pending',
  arrivalTime,
  notes,
  paymentStatus = 'unpaid',
}) {
  if (!checkInDate || !checkOutDate) {
    throw new Error('Check-in and check-out dates are required.');
  }

  if (new Date(checkOutDate).getTime() <= new Date(checkInDate).getTime()) {
    throw new Error('Check-out date must be later than check-in date.');
  }

  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error('Selected room was not found.');
  }

  const room = roomSnap.data();
  if (room?.status && room.status !== 'available') {
    throw new Error('Selected room is currently not available.');
  }

  const existingRef = collection(db, RESERVATIONS_COLLECTION);
  const existingQuery = query(existingRef, where('roomId', '==', roomId));
  const existingSnapshot = await getDocs(existingQuery);
  const hasConflict = existingSnapshot.docs
    .map((d) => d.data())
    .some(
      (reservation) =>
        ACTIVE_BOOKING_STATUSES.includes(reservation.status || 'pending') &&
        dateRangesOverlap(
          reservation.checkInDate,
          reservation.checkOutDate,
          checkInDate,
          checkOutDate,
        ),
    );

  if (hasConflict) {
    throw new Error('Room is no longer available for the selected dates. Please pick another date.');
  }

  const ref = collection(db, RESERVATIONS_COLLECTION);
  const docRef = await addDoc(ref, {
    guestId,
    guestEmail: guestEmail || '',
    guestName: guestName || '',
    roomId,
    checkInDate,
    checkOutDate,
    guests,
    status,
    notes: notes || '',
    paymentStatus,
    createdAt: serverTimestamp(),
    arrivalTime: arrivalTime || null,
  });
  const snap = await getDoc(docRef);
  await createSystemNotification({
    type: 'reservation_created',
    title: 'New reservation request',
    message: `${guestName || guestEmail || 'A guest'} requested ${room?.name || 'a room'} from ${checkInDate} to ${checkOutDate}.`,
    audience: 'all',
    meta: { reservationId: docRef.id, roomId, guestId, status },
  });
  return { id: docRef.id, ...snap.data() };
}

export async function getReservationsByGuest(guestId) {
  const ref = collection(db, RESERVATIONS_COLLECTION);
  const q = query(ref, where('guestId', '==', guestId));
  const snapshot = await getDocs(q);
  return sortByCheckInDateDesc(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export function subscribeReservationsByGuest(guestId, onUpdate) {
  const ref = collection(db, RESERVATIONS_COLLECTION);
  const q = query(ref, where('guestId', '==', guestId));
  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(sortByCheckInDateDesc(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))));
    },
    (error) => {
      console.error('Failed to subscribe guest reservations', error);
      onUpdate([]);
    },
  );
}

export async function getAllReservations() {
  const ref = collection(db, RESERVATIONS_COLLECTION);
  const q = query(ref, orderBy('checkInDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeAllReservations(onUpdate, onError) {
  const ref = collection(db, RESERVATIONS_COLLECTION);
  const q = query(ref, orderBy('checkInDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error('Failed to subscribe reservations', error);
      if (onError) onError(error);
      onUpdate([]);
    },
  );
}

export async function updateReservationStatus(id, status) {
  const ref = doc(db, RESERVATIONS_COLLECTION, id);
  const currentSnap = await getDoc(ref);
  const current = currentSnap.exists() ? currentSnap.data() : null;
  const patch = { status, updatedAt: serverTimestamp() };
  if (status === 'checked-in') patch.checkedInAt = serverTimestamp();
  if (status === 'checked-out') patch.checkedOutAt = serverTimestamp();
  if (status === 'cancelled') patch.cancelledAt = serverTimestamp();
  await updateDoc(ref, patch);
  await createSystemNotification({
    type: 'reservation_status_changed',
    title: 'Reservation updated',
    message: `Reservation ${id.slice(0, 8).toUpperCase()} is now ${String(status).replace('-', ' ')}.`,
    audience: 'all',
    meta: {
      reservationId: id,
      roomId: current?.roomId || null,
      guestId: current?.guestId || null,
      fromStatus: current?.status || null,
      toStatus: status,
    },
  });
}

export async function updateReservation(id, patch) {
  const ref = doc(db, RESERVATIONS_COLLECTION, id);
  const currentSnap = await getDoc(ref);
  if (!currentSnap.exists()) {
    throw new Error('Reservation not found.');
  }

  const current = currentSnap.data();
  if (LOCKED_GUEST_ACTION_STATUSES.includes(current.status || 'pending')) {
    throw new Error('This reservation is already confirmed by staff and can no longer be edited.');
  }
  const candidate = { ...current, ...patch };
  const candidateStatus = candidate.status || 'pending';
  const shouldValidateConflict = ACTIVE_BOOKING_STATUSES.includes(candidateStatus);
  if (shouldValidateConflict && candidate.roomId && candidate.checkInDate && candidate.checkOutDate) {
    const existingRef = collection(db, RESERVATIONS_COLLECTION);
    const existingQuery = query(existingRef, where('roomId', '==', candidate.roomId));
    const existingSnapshot = await getDocs(existingQuery);
    const hasConflict = existingSnapshot.docs.some((snapshotDoc) => {
      if (snapshotDoc.id === id) return false;
      const reservation = snapshotDoc.data();
      return (
        ACTIVE_BOOKING_STATUSES.includes(reservation.status || 'pending') &&
        dateRangesOverlap(
          reservation.checkInDate,
          reservation.checkOutDate,
          candidate.checkInDate,
          candidate.checkOutDate,
        )
      );
    });

    if (hasConflict) {
      throw new Error('Selected room already has an active booking for these dates.');
    }
  }

  await updateDoc(ref, patch);
}

export async function updateReservationPaymentStatus(id, paymentStatus) {
  const ref = doc(db, RESERVATIONS_COLLECTION, id);
  const currentSnap = await getDoc(ref);
  if (!currentSnap.exists()) {
    throw new Error('Reservation not found.');
  }
  await updateDoc(ref, {
    paymentStatus,
    updatedAt: serverTimestamp(),
    ...(paymentStatus === 'paid' ? { paidAt: serverTimestamp() } : {}),
  });
}

export async function deleteReservation(id) {
  const ref = doc(db, RESERVATIONS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Reservation not found.');
  }
  const current = snap.data();
  if (LOCKED_GUEST_ACTION_STATUSES.includes(current.status || 'pending')) {
    throw new Error('This reservation is already confirmed by staff and can no longer be cancelled.');
  }
  await deleteDoc(ref);
  await createSystemNotification({
    type: 'reservation_deleted',
    title: 'Reservation cancelled',
    message: `Reservation ${id.slice(0, 8).toUpperCase()} was cancelled by guest.`,
    audience: 'all',
    meta: {
      reservationId: id,
      roomId: current.roomId || null,
      guestId: current.guestId || null,
      status: current.status || null,
    },
  });
}

