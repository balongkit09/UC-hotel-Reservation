import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { createSystemNotification } from './notificationsService';

const ROOMS_COLLECTION = 'rooms';

export async function getAllRooms() {
  const ref = collection(db, ROOMS_COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeAllRooms(onUpdate, onError) {
  const ref = collection(db, ROOMS_COLLECTION);
  return onSnapshot(
    ref,
    (snapshot) => {
      onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error('Failed to subscribe rooms', error);
      if (onError) onError(error);
      onUpdate([]);
    },
  );
}

export async function getAvailableRooms({ checkInDate, checkOutDate, guests, roomType }) {
  const ref = collection(db, ROOMS_COLLECTION);
  const q = roomType && roomType !== 'any'
    ? query(ref, where('type', '==', roomType))
    : ref;

  const snapshot = await getDocs(q);
  const rooms = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  return rooms.filter((room) => {
    if (room.capacity < guests) return false;
    return room.status === 'available';
  });
}

export async function getRoomById(id) {
  const ref = doc(db, ROOMS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createRoom(room) {
  const ref = collection(db, ROOMS_COLLECTION);
  const docRef = await addDoc(ref, {
    name: room.name,
    type: room.type,
    price: Number(room.price),
    capacity: Number(room.capacity),
    amenities: room.amenities || [],
    image: room.image || '',
    status: room.status || 'available',
    createdAt: new Date().toISOString(),
  });
  const snap = await getDoc(docRef);
  await createSystemNotification({
    type: 'room_created',
    title: 'Room added',
    message: `${room.name} was added to room inventory.`,
    audience: 'all',
    meta: { roomId: docRef.id, status: room.status || 'available' },
  });
  return { id: docRef.id, ...snap.data() };
}

export async function updateRoom(id, patch) {
  const ref = doc(db, ROOMS_COLLECTION, id);
  const existingSnap = await getDoc(ref);
  const existing = existingSnap.exists() ? existingSnap.data() : null;
  const next = { ...patch };
  if (next.price != null) next.price = Number(next.price);
  if (next.capacity != null) next.capacity = Number(next.capacity);
  await updateDoc(ref, next);
  if (next.status && next.status !== existing?.status) {
    await createSystemNotification({
      type: 'room_status_changed',
      title: 'Room status changed',
      message: `${existing?.name || 'Room'} is now ${next.status}.`,
      audience: 'all',
      meta: { roomId: id, fromStatus: existing?.status || null, toStatus: next.status },
    });
  }
}

export async function deleteRoom(id) {
  const ref = doc(db, ROOMS_COLLECTION, id);
  const snap = await getDoc(ref);
  const room = snap.exists() ? snap.data() : null;
  await deleteDoc(ref);
  await createSystemNotification({
    type: 'room_deleted',
    title: 'Room removed',
    message: `${room?.name || `Room ${id.slice(0, 6)}`} was removed from room inventory.`,
    audience: 'all',
    meta: { roomId: id },
  });
}

