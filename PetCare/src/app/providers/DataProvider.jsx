import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  createPet,
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

import {
  cancelAllAppointmentRemindersAsync,
  cancelScheduledReminderAsync,
  scheduleAppointmentReminderAsync,
  syncAppointmentRemindersAsync,
} from "../utils/notifications.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isBootingData, setIsBootingData] = useState(true);
  const [petsError, setPetsError] = useState(null);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const remindersSyncTimeoutRef = useRef(null);

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

    // Track whether we've received the first snapshot from each listener.
    let petsLoaded = false;
    let aptsLoaded = false;

    const finishBootIfReady = () => {
      if (petsLoaded && aptsLoaded) setIsBootingData(false);
    };

    if (!user) {
      // Prevent reminders from a previous session/user from firing.
      cancelAllAppointmentRemindersAsync();
      setPets([]);
      setAppointments([]);
      setPetsError(null);
      setAppointmentsError(null);
      setIsBootingData(false);
      return undefined;
    }

    setIsBootingData(true);
    setPetsError(null);
    setAppointmentsError(null);

    unsubPets = listenPets(
      user.uid,
      (petDocs) => {
        // Hide the legacy seeded pet document (id: "charlie") so it never appears in the UI.
        const visiblePetDocs = petDocs.filter((p) => p.id !== "charlie");

        // Merge cached photoUrl if we already have it
        setPets(
          visiblePetDocs.map((p) => {
            const cached = p.photoPath ? photoUrlCacheRef.current.get(p.photoPath) : "";
            return {
              ...p,
              photoUrl: cached || p.photoUrl || "",
            };
          })
        );
        resolvePetPhotoUrls(visiblePetDocs);
        petsLoaded = true;
        finishBootIfReady();
      },
      (err) => {
        setPetsError(err);
        petsLoaded = true;
        finishBootIfReady();
      }
    );

    unsubApts = listenAppointments(
      user.uid,
      (aptDocs) => {
        setAppointments(aptDocs);
        aptsLoaded = true;
        finishBootIfReady();
      },
      (err) => {
        setAppointmentsError(err);
        aptsLoaded = true;
        finishBootIfReady();
      }
    );

    return () => {
      unsubPets?.();
      unsubApts?.();
    };
  }, [user?.uid]);

  // Keep local scheduled reminders in sync with Firestore appointments.
  useEffect(() => {
    if (!user) return;

    if (remindersSyncTimeoutRef.current) {
      clearTimeout(remindersSyncTimeoutRef.current);
    }

    // Debounce slightly to avoid re-scheduling multiple times during rapid snapshots.
    remindersSyncTimeoutRef.current = setTimeout(() => {
      syncAppointmentRemindersAsync({ appointments, pets });
    }, 300);

    return () => {
      if (remindersSyncTimeoutRef.current) {
        clearTimeout(remindersSyncTimeoutRef.current);
        remindersSyncTimeoutRef.current = null;
      }
    };
  }, [user?.uid, appointments, pets]);

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
      const path = `users/${user.uid}/pets/${newId}_${Date.now()}.${ext}`;
      await uploadImageFromUriAsync(localPhotoUri, path);
      await patchPet(user.uid, newId, { photoPath: path });
    }

    return newId;
  };

  const updatePet = async (petId, patch, localPhotoUri) => {
    if (!user) throw new Error("Not authenticated");

    const id = String(petId);

    // If a new photo was picked, write it to a NEW Storage path (versioned),
    // so the download URL changes and React Native doesn't keep showing the cached image.
    if (localPhotoUri) {
      const existingPet = pets.find((p) => p.id === id);
      const previousPath = existingPet?.photoPath || "";

      const ext = (localPhotoUri.split(".").pop() || "jpg").split("?")[0];
      const path = `users/${user.uid}/pets/${id}_${Date.now()}.${ext}`;

      await uploadImageFromUriAsync(localPhotoUri, path);
      await patchPet(user.uid, id, { ...patch, photoPath: path });

      // Clean up the previous photo and cached URL to prevent leaks and stale images.
      if (previousPath && previousPath !== path) {
        await deleteStorageObjectIfExists(previousPath);
        photoUrlCacheRef.current.delete(previousPath);
      }

      // Optimistically resolve the new download URL so the UI updates immediately
      // when navigating back (don't wait for the Firestore snapshot).
      try {
        const url = await getDownloadUrlForPath(path);
        photoUrlCacheRef.current.set(path, url);
        setPets((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...patch, photoPath: path, photoUrl: url } : p))
        );
      } catch {
        // If the URL resolve fails, fall back to snapshot-based resolution.
        photoUrlCacheRef.current.delete(path);
        setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, photoPath: path } : p)));
      }

      return;
    }

    await patchPet(user.uid, id, patch);

    // Optimistic local patch for snappier UI when navigating back.
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deletePet = async (petId) => {
    if (!user) throw new Error("Not authenticated");

    const pet = pets.find((p) => p.id === String(petId));
    if (pet?.photoPath) {
      await deleteStorageObjectIfExists(pet.photoPath);
      photoUrlCacheRef.current.delete(pet.photoPath);
    }

    // Cancel any scheduled reminders for appointments associated with this pet
    const aptsForPet = appointments.filter((a) => a.petId === String(petId));
    for (const a of aptsForPet) {
      await cancelScheduledReminderAsync(a.id);
    }

    await removeAppointmentsForPet(user.uid, String(petId));
    await removePet(user.uid, String(petId));
  };

  const addAppointment = async (appointment) => {
    if (!user) throw new Error("Not authenticated");
    const id = await createAppointment(user.uid, appointment);

    if (appointment?.reminderEnabled) {
      const petName = pets.find((p) => p.id === String(appointment.petId))?.name || "";
      const leadMinutesRaw = Number(appointment.reminderLeadMinutes);
      const leadMinutes = Number.isFinite(leadMinutesRaw) && leadMinutesRaw > 0 ? leadMinutesRaw : 24 * 60;

      await scheduleAppointmentReminderAsync({
        appointmentId: id,
        petName,
        type: appointment.type,
        dateTimeIso: appointment.dateTime,
        leadMinutes,
      });
    }

    return id;
  };

  const updateAppointment = async (appointmentId, patch) => {
    if (!user) throw new Error("Not authenticated");
    await patchAppointment(user.uid, String(appointmentId), patch);

    const existing = appointments.find((a) => a.id === String(appointmentId));
    const next = { ...(existing || {}), ...(patch || {}) };

    if (next.reminderEnabled && !next.isCompleted) {
      const petName = pets.find((p) => p.id === String(next.petId))?.name || "";
      const leadMinutesRaw = Number(next.reminderLeadMinutes);
      const leadMinutes = Number.isFinite(leadMinutesRaw) && leadMinutesRaw > 0 ? leadMinutesRaw : 24 * 60;

      await scheduleAppointmentReminderAsync({
        appointmentId,
        petName,
        type: next.type,
        dateTimeIso: next.dateTime,
        leadMinutes,
      });
    } else {
      await cancelScheduledReminderAsync(appointmentId);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (!user) throw new Error("Not authenticated");
    await cancelScheduledReminderAsync(appointmentId);
    await removeAppointment(user.uid, String(appointmentId));
  };

  const value = useMemo(
    () => ({
      pets,
      appointments,
      isBootingData,
      petsError,
      appointmentsError,
      refreshData,
      addPet,
      updatePet,
      deletePet,
      addAppointment,
      updateAppointment,
      deleteAppointment,
    }),
    [pets, appointments, isBootingData, petsError, appointmentsError, user]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
