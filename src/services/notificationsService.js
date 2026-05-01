import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const NOTIFICATIONS_COLLECTION = 'notifications';

export async function createSystemNotification({
  type = 'system',
  title,
  message,
  level = 'info',
  audience = 'all',
  meta = {},
}) {
  if (!title || !message) return;
  try {
    const ref = collection(db, NOTIFICATIONS_COLLECTION);
    await addDoc(ref, {
      type,
      title,
      message,
      level,
      audience,
      meta,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Keep core flows (booking, room updates) working even when notification writes are blocked by rules.
    console.warn('Notification write skipped:', error?.message || error);
  }
}

export function subscribeRecentNotifications(onUpdate, count = 10) {
  const ref = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'), limit(count));
  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error('Failed to subscribe notifications', error);
      onUpdate([]);
    },
  );
}
