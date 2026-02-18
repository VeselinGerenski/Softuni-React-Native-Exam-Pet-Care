import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const KIND = "appointment-reminder-24h";
const ANDROID_CHANNEL_ID = "appointment-reminders";

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannelAsync() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Appointment reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch {
    // no-op
  }
}

export async function ensureReminderPermissionAsync() {
  try {
    await ensureAndroidChannelAsync();
    const perms = await Notifications.getPermissionsAsync();
    if (perms?.status === "granted") return true;
    const req = await Notifications.requestPermissionsAsync();
    return req?.status === "granted";
  } catch {
    return false;
  }
}

function computeTriggerDate24hBefore(dateTimeIso) {
  const aptDate = new Date(dateTimeIso);
  if (Number.isNaN(aptDate.getTime())) return null;
  const triggerMs = aptDate.getTime() - 24 * 60 * 60 * 1000;
  if (triggerMs <= Date.now()) return null;
  return new Date(triggerMs);
}

async function getAllReminderRequestsAsync() {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return (all || []).filter((r) => r?.content?.data?.kind === KIND);
  } catch {
    return [];
  }
}

async function findReminderRequestByAppointmentIdAsync(appointmentId) {
  const id = String(appointmentId);
  const reminders = await getAllReminderRequestsAsync();
  return reminders.find((r) => String(r?.content?.data?.appointmentId) === id) || null;
}

export async function cancelScheduledReminderAsync(appointmentId) {
  const req = await findReminderRequestByAppointmentIdAsync(appointmentId);
  if (!req?.identifier) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(req.identifier);
  } catch {
    // no-op
  }
}

export async function cancelAllAppointmentRemindersAsync() {
  const reminders = await getAllReminderRequestsAsync();
  await Promise.all(
    reminders
      .filter((r) => r?.identifier)
      .map((r) => Notifications.cancelScheduledNotificationAsync(r.identifier).catch(() => {}))
  );
}

export async function scheduleAppointmentReminder24hAsync({
  appointmentId,
  petName,
  type,
  dateTimeIso,
}) {
  const triggerDate = computeTriggerDate24hBefore(dateTimeIso);

  // If the trigger would be in the past (or invalid), ensure we don't leave stale schedules.
  if (!triggerDate) {
    await cancelScheduledReminderAsync(appointmentId);
    return null;
  }

  const ok = await ensureReminderPermissionAsync();
  if (!ok) return null;

  // Reschedule-safe
  await cancelScheduledReminderAsync(appointmentId);

  const title = "Upcoming appointment";
  const body = petName
    ? `${petName} has a ${type || "pet"} appointment in 24 hours.`
    : "You have an appointment in 24 hours.";

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: {
        kind: KIND,
        appointmentId: String(appointmentId),
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  return identifier;
}

async function getNextTriggerMsSafe(trigger) {
  try {
    const ms = await Notifications.getNextTriggerDateAsync(trigger);
    return typeof ms === "number" ? ms : null;
  } catch {
    return null;
  }
}

export async function syncAppointmentReminders24hAsync({ appointments, pets }) {
  const list = Array.isArray(appointments) ? appointments : [];
  const petList = Array.isArray(pets) ? pets : [];

  const petNameById = new Map(petList.map((p) => [String(p.id), p.name]));
  const shouldExistById = new Map();

  for (const a of list) {
    const aptId = String(a.id);
    const shouldHave = !!a.reminderEnabled && !a.isCompleted;
    const triggerDate = shouldHave ? computeTriggerDate24hBefore(a.dateTime) : null;
    shouldExistById.set(aptId, triggerDate);
  }

  const scheduled = await getAllReminderRequestsAsync();
  const scheduledByAptId = new Map();
  for (const r of scheduled) {
    const aptId = String(r?.content?.data?.appointmentId || "");
    if (aptId) scheduledByAptId.set(aptId, r);
  }

  // Cancel stale reminders (appointment removed or reminder disabled/too-soon)
  await Promise.all(
    scheduled
      .filter((r) => {
        const aptId = String(r?.content?.data?.appointmentId || "");
        const expectedTrigger = shouldExistById.get(aptId);
        return !expectedTrigger; // includes deleted, disabled, completed, invalid/past
      })
      .map((r) =>
        r?.identifier
          ? Notifications.cancelScheduledNotificationAsync(r.identifier).catch(() => {})
          : Promise.resolve()
      )
  );

  // Schedule / reschedule needed reminders
  for (const a of list) {
    const aptId = String(a.id);
    const expectedTriggerDate = shouldExistById.get(aptId);
    if (!expectedTriggerDate) continue;

    const existing = scheduledByAptId.get(aptId);

    // If there is an existing reminder, only reschedule if the trigger doesn't match.
    if (existing?.identifier && existing?.trigger) {
      const nextMs = await getNextTriggerMsSafe(existing.trigger);
      if (nextMs && Math.abs(nextMs - expectedTriggerDate.getTime()) <= 5000) {
        continue;
      }

      try {
        await Notifications.cancelScheduledNotificationAsync(existing.identifier);
      } catch {
        // no-op
      }
    }

    // If we reach here, we need to schedule (or reschedule)
    const petName = petNameById.get(String(a.petId)) || "";
    await scheduleAppointmentReminder24hAsync({
      appointmentId: aptId,
      petName,
      type: a.type,
      dateTimeIso: a.dateTime,
    });
  }
}
