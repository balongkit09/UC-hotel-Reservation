import {
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { paymentsCollectionRef } from '../firebase/firebase';
import { updateReservationPaymentStatus } from './reservationsService';

export async function createPayment({
  reservationId,
  guestId,
  amount,
  method = 'cash',
  status = 'pending',
  reference = '',
  notes = '',
}) {
  const docRef = await addDoc(paymentsCollectionRef, {
    reservationId,
    guestId,
    amount,
    method,
    status,
    reference,
    notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
}

export async function confirmReservationPayment({
  reservationId,
  guestId,
  amount,
  method,
  reference = '',
  notes = '',
}) {
  if (!reservationId) throw new Error('Reservation is required.');
  if (!guestId) throw new Error('Guest is required.');
  const normalizedMethod = method === 'bank' ? 'bank' : 'cash';
  const normalizedAmount = Number(amount || 0);
  if (normalizedAmount <= 0) throw new Error('Payment amount must be greater than zero.');

  const payment = await createPayment({
    reservationId,
    guestId,
    amount: normalizedAmount,
    method: normalizedMethod,
    status: 'paid',
    reference,
    notes,
  });

  await updateReservationPaymentStatus(reservationId, 'paid');
  return payment;
}

export async function getPaymentsByGuest(guestId) {
  const q = query(paymentsCollectionRef, where('guestId', '==', guestId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribePaymentsByGuest(guestId, onUpdate) {
  const q = query(paymentsCollectionRef, where('guestId', '==', guestId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

