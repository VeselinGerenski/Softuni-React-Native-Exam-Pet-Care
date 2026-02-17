import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

export const petsCol = (uid) => collection(db, "users", uid, "pets");

export function listenPets(uid, callback) {
  const q = query(petsCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const pets = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(pets);
  });
}

export async function ensureCharlieSeed(uid) {
  const petRef = doc(db, "users", uid, "pets", "charlie");
  const snap = await getDoc(petRef);
  if (snap.exists()) return;

  await setDoc(petRef, {
    name: "Charlie",
    species: "Dog",
    breed: "Beagle",
    birthDate: "2021-11-08",
    neutered: false,
    notes: "Very energetic, needs lots of exercise.",
    // store ONLY a storage path (optional). We'll leave it empty for the seed.
    photoPath: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createPet(uid, data, idOverride) {
  const ref = idOverride
    ? doc(db, "users", uid, "pets", idOverride)
    : doc(petsCol(uid));

  await setDoc(ref, {
    name: data.name,
    species: data.species,
    breed: data.breed || "",
    birthDate: data.birthDate,
    neutered: !!data.neutered,
    notes: data.notes || "",
    photoPath: data.photoPath || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function patchPet(uid, petId, patch) {
  const ref = doc(db, "users", uid, "pets", petId);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function removePet(uid, petId) {
  await deleteDoc(doc(db, "users", uid, "pets", petId));
}

export async function removeAppointmentsForPet(uid, petId) {
  // appointments are stored at /users/{uid}/appointments
  const aptsCol = collection(db, "users", uid, "appointments");
  const q = query(aptsCol, where("petId", "==", String(petId)));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
