import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload an image from an Expo local URI to Firebase Storage.
 * We store ONLY the storage path in Firestore (no URLs), and resolve URLs at runtime.
 */
export async function uploadImageFromUriAsync(localUri, storagePath, contentType = "image/jpeg") {
  if (!localUri) throw new Error("Missing localUri");
  if (!storagePath) throw new Error("Missing storagePath");

  const res = await fetch(localUri);
  const blob = await res.blob();

  const r = ref(storage, storagePath);
  await uploadBytes(r, blob, { contentType });
  return storagePath;
}

export async function getDownloadUrlForPath(storagePath) {
  if (!storagePath) return "";
  return getDownloadURL(ref(storage, storagePath));
}

export async function deleteStorageObjectIfExists(storagePath) {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (e) {
    // Ignore "object-not-found" and similar errors
  }
}
