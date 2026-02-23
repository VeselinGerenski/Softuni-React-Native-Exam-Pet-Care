import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// NOTE: We keep a stable prefix so we can support legacy scheduled notifications
// from older versions of the app (e.g. the previous fixed 24h reminders).
const KIND_PREFIX = "appointment-reminder";
const LEGACY_KIND_24H = "appointment-reminder-24h";
const KIND = KIND_PREFIX;
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

function computeTriggerDateBefore(dateTimeIso, leadMinutes) {
  const aptDate = new Date(dateTimeIso);
  if (Number.isNaN(aptDate.getTime())) return null;

  const mins = Number(leadMinutes);
  if (!Number.isFinite(mins) || mins <= 0) return null;

  const triggerMs = aptDate.getTime() - mins * 60 * 1000;
  if (triggerMs <= Date.now()) return null;
  return new Date(triggerMs);
}

async function getAllReminderRequestsAsync() {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return (all || []).filter((r) => {
      const k = String(r?.content?.data?.kind || "");
      return k === KIND || k === LEGACY_KIND_24H || k.startsWith(`${KIND_PREFIX}:`);
    });
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
  return scheduleAppointmentReminderAsync({
    appointmentId,
    petName,
    type,
    dateTimeIso,
    leadMinutes: 24 * 60,
  });
}

function formatLeadTime(leadMinutes) {
  const mins = Number(leadMinutes);
  if (!Number.isFinite(mins) || mins <= 0) return "soon";
  if (mins === 60) return "1 hour";
  if (mins % 60 === 0) return `${mins / 60} hours`;
  if (mins === 1) return "1 minute";
  return `${mins} minutes`;
}

export async function scheduleAppointmentReminderAsync({
  appointmentId,
  petName,
  type,
  dateTimeIso,
  leadMinutes,
}) {
  const triggerDate = computeTriggerDateBefore(dateTimeIso, leadMinutes);

  // If the trigger would be in the past (or invalid), ensure we don't leave stale schedules.
  if (!triggerDate) {
    await cancelScheduledReminderAsync(appointmentId);
    return null;
  }

  const ok = await ensureReminderPermissionAsync();
  if (!ok) return null;

  // Reschedule-safe
  await cancelScheduledReminderAsync(appointmentId);

  const leadLabel = formatLeadTime(leadMinutes);

  const title = "Upcoming appointment";
  const body = petName
    ? `${petName} has a ${type || "pet"} appointment in ${leadLabel}.`
    : `You have an appointment in ${leadLabel}.`;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: {
        kind: KIND,
        appointmentId: String(appointmentId),
        leadMinutes: Number(leadMinutes) || 0,
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
  // Backwards-compatible wrapper for older imports.
  return syncAppointmentRemindersAsync({ appointments, pets });
}

export async function syncAppointmentRemindersAsync({ appointments, pets }) {
  const list = Array.isArray(appointments) ? appointments : [];
  const petList = Array.isArray(pets) ? pets : [];

  const petNameById = new Map(petList.map((p) => [String(p.id), p.name]));
  const shouldExistById = new Map();

  for (const a of list) {
    const aptId = String(a.id);
    const shouldHave = !!a.reminderEnabled && !a.isCompleted;
    const leadMinutes = Number(a.reminderLeadMinutes);
    const resolvedLead = Number.isFinite(leadMinutes) && leadMinutes > 0 ? leadMinutes : 24 * 60;
    const triggerDate = shouldHave ? computeTriggerDateBefore(a.dateTime, resolvedLead) : null;
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
    const leadMinutes = Number(a.reminderLeadMinutes);
    const resolvedLead = Number.isFinite(leadMinutes) && leadMinutes > 0 ? leadMinutes : 24 * 60;
    await scheduleAppointmentReminderAsync({
      appointmentId: aptId,
      petName,
      type: a.type,
      dateTimeIso: a.dateTime,
      leadMinutes: resolvedLead,
    });
  }
}
