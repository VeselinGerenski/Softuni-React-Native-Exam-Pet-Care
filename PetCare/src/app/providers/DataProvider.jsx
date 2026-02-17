import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  createPet,
  ensureCharlieSeed,
  listenPets,
  patchPet,
  removeAppointmentsForPet,
  removePet,
} from "../../services/firestore/pets";
import {
  createAppointment,
  listenAppointments,
  patchAppointment,
  removeAppointment,
} from "../../services/firestore/appointments";
import {
  deleteStorageObjectIfExists,
  getDownloadUrlForPath,
  uploadImageFromUriAsync,
} from "../../services/storage";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isBootingData, setIsBootingData] = useState(true);

  // Cache resolved Storage URLs in-memory so we don't re-fetch on every snapshot.
  const photoUrlCacheRef = useRef(new Map());

  const resolvePetPhotoUrls = (petDocs) => {
    petDocs.forEach((p) => {
      const path = p.photoPath;
      if (!path) return;
      if (photoUrlCacheRef.current.has(path)) return;

      // Mark as "pending" to avoid duplicate requests
      photoUrlCacheRef.current.set(path, null);
      getDownloadUrlForPath(path)
        .then((url) => {
          photoUrlCacheRef.current.set(path, url);
          setPets((prev) => prev.map((x) => (x.id === p.id ? { ...x, photoUrl: url } : x)));
        })
        .catch(() => {
          // keep fallback
          photoUrlCacheRef.current.delete(path);
        });
    });
  };

  useEffect(() => {
    let unsubPets = null;
    let unsubApts = null;

    if (!user) {
      setPets([]);
      setAppointments([]);
      setIsBootingData(false);
      return undefined;
    }

    setIsBootingData(true);

    // Ensure we have at least one starter pet in DB (Charlie)
    ensureCharlieSeed(user.uid).catch(() => {});

    unsubPets = listenPets(user.uid, (petDocs) => {
      // Merge cached photoUrl if we already have it
      setPets(
        petDocs.map((p) => {
          const cached = p.photoPath ? photoUrlCacheRef.current.get(p.photoPath) : "";
          return {
            ...p,
            photoUrl: cached || p.photoUrl || "",
          };
        })
      );
      resolvePetPhotoUrls(petDocs);
    });

    unsubApts = listenAppointments(user.uid, (aptDocs) => {
      setAppointments(aptDocs);
    });

    setIsBootingData(false);

    return () => {
      unsubPets?.();
      unsubApts?.();
    };
  }, [user?.uid]);

  const refreshData = async () => {
    // With realtime listeners, this is mostly a no-op.
    // Kept for UI parity ("Refresh" button).
    return true;
  };

  const addPet = async (pet, localPhotoUri) => {
    if (!user) throw new Error("Not authenticated");

    const newId = await createPet(user.uid, {
      ...pet,
      photoPath: "",
    });

    if (localPhotoUri) {
      const ext = (localPhotoUri.split(".").pop() || "jpg").split("?")[0];
      const path = `users/${user.uid}/pets/${newId}.${ext}`;
      await uploadImageFromUriAsync(localPhotoUri, path);
      await patchPet(user.uid, newId, { photoPath: path });
    }

    return newId;
  };

  const updatePet = async (petId, patch, localPhotoUri) => {
    if (!user) throw new Error("Not authenticated");

    if (localPhotoUri) {
      const ext = (localPhotoUri.split(".").pop() || "jpg").split("?")[0];
      const path = `users/${user.uid}/pets/${petId}.${ext}`;
      await uploadImageFromUriAsync(localPhotoUri, path);
      await patchPet(user.uid, petId, { ...patch, photoPath: path });
      return;
    }

    await patchPet(user.uid, petId, patch);
  };

  const deletePet = async (petId) => {
    if (!user) throw new Error("Not authenticated");

    const pet = pets.find((p) => p.id === String(petId));
    if (pet?.photoPath) {
      await deleteStorageObjectIfExists(pet.photoPath);
      photoUrlCacheRef.current.delete(pet.photoPath);
    }

    await removeAppointmentsForPet(user.uid, String(petId));
    await removePet(user.uid, String(petId));
  };

  const addAppointment = async (appointment) => {
    if (!user) throw new Error("Not authenticated");
    return createAppointment(user.uid, appointment);
  };

  const updateAppointment = async (appointmentId, patch) => {
    if (!user) throw new Error("Not authenticated");
    await patchAppointment(user.uid, String(appointmentId), patch);
  };

  const deleteAppointment = async (appointmentId) => {
    if (!user) throw new Error("Not authenticated");
    await removeAppointment(user.uid, String(appointmentId));
  };

  const value = useMemo(
    () => ({
      pets,
      appointments,
      isBootingData,
      refreshData,
      addPet,
      updatePet,
      deletePet,
      addAppointment,
      updateAppointment,
      deleteAppointment,
    }),
    [pets, appointments, isBootingData, user]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
