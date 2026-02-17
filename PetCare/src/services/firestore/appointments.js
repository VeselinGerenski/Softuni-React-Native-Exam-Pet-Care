import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export const appointmentsCol = (uid) => collection(db, "users", uid, "appointments");

export function listenAppointments(uid, callback) {
  // Store dateTime as ISO string; lexicographic order matches chronological order.
  const q = query(appointmentsCol(uid), orderBy("dateTime", "asc"));
  return onSnapshot(q, (snap) => {
    const appointments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(appointments);
  });
}

export async function createAppointment(uid, data, idOverride) {
  const ref = idOverride ? doc(db, "users", uid, "appointments", idOverride) : doc(appointmentsCol(uid));
  await setDoc(ref, {
    petId: String(data.petId),
    type: data.type,
    dateTime: data.dateTime, // ISO string
    reminderEnabled: !!data.reminderEnabled,
    notes: data.notes || "",
    isCompleted: !!data.isCompleted,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function patchAppointment(uid, appointmentId, patch) {
  const ref = doc(db, "users", uid, "appointments", appointmentId);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function removeAppointment(uid, appointmentId) {
  await deleteDoc(doc(db, "users", uid, "appointments", appointmentId));
}
