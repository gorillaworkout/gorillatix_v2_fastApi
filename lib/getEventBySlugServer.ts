import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  runTransaction,
} from "firebase/firestore"
import { db, auth } from "./firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

import { EventItem, FirestoreEvent, Order, OrderInput, TicketProps } from "@/types/event"

export async function getEventBySlug(slug: string) {
  try {
    const snapshot = await db
      .collection('events')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as EventItem;
  } catch (err) {
    console.error('Error fetching event server-side:', err);
    return null;
  }
}
