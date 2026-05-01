import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const USERS_COLLECTION = 'users';

export async function getAllUsers() {
  const ref = collection(db, USERS_COLLECTION);
  const q = query(ref, orderBy('email', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeAllUsers(onUpdate, onError) {
  const ref = collection(db, USERS_COLLECTION);
  const q = query(ref, orderBy('email', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error('Failed to subscribe users', error);
      if (onError) onError(error);
      onUpdate([]);
    },
  );
}

export async function updateUserRole(userId, role) {
  const ref = doc(db, USERS_COLLECTION, userId);
  await updateDoc(ref, { role });
}

