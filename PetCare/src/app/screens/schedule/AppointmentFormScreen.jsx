import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import Screen from "../../components/layout/Screen";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppField from "../../components/ui/AppField";
import SelectField from "../../components/ui/SelectField";
import { useData } from "../../providers/DataProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { formatDate, formatTime, getSpeciesEmoji } from "../../utils/format";

const TYPE_OPTIONS = [
  { label: "Vaccine", value: "Vaccine", left: "💉" },
  { label: "Medication", value: "Medication", left: "💊" },
  { label: "Vet Visit", value: "Vet Visit", left: "🏥" },
  { label: "Grooming", value: "Grooming", left: "✂️" },
  { label: "Other", value: "Other", left: "📋" },
];

export default function AppointmentFormScreen({ route, navigation }) {
  const { appointmentId, petId: prefillPetId } = route.params || {};
  const isEditMode = !!appointmentId;
  const { pets, appointments, addAppointment, updateAppointment, deleteAppointment } = useData();

  const existing = useMemo(
    () => (isEditMode ? appointments.find((a) => a.id === String(appointmentId)) : null),
    [appointments, appointmentId, isEditMode]
  );

  const [petId, setPetId] = useState(prefillPetId || "");
  const [type, setType] = useState("Vet Visit");
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setPetId(existing.petId);
      setType(existing.type);
      setDateObj(existing.dateTime ? new Date(existing.dateTime) : new Date());
      setReminderEnabled(!!existing.reminderEnabled);
      setIsCompleted(!!existing.isCompleted);
      setNotes(existing.notes || "");
    } else if (prefillPetId) {
      setPetId(prefillPetId);
    }
  }, [existing, prefillPetId]);

  const selectedPet = useMemo(() => pets.find((p) => p.id === String(petId)), [pets, petId]);
  const petOptions = useMemo(
    () => pets.map((p) => ({ label: p.name, value: p.id, left: getSpeciesEmoji(p.species) })),
    [pets]
  );

  const validate = () => {
    if (!petId) return "Please select a pet.";
    if (!dateObj || Number.isNaN(dateObj.getTime())) return "Please select a valid date & time.";
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert("Check the form", err);

    setSubmitting(true);

    const payload = {
      petId: String(petId),
      type,
      dateTime: dateObj.toISOString(),
      reminderEnabled,
      notes: notes.trim(),
      isCompleted,
    };

    if (isEditMode) {
      await updateAppointment(String(appointmentId), payload);
    } else {
      await addAppointment(payload);
    }

    setSubmitting(false);
    navigation.navigate("ScheduleList");
  };

  const confirmDelete = () => {
    Alert.alert("Delete appointment", "Are you sure you want to delete this appointment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Promise.resolve(deleteAppointment(String(appointmentId)))
            .then(() => navigation.navigate("ScheduleList"))
            .catch((e) => Alert.alert("Error", e?.message || "Could not delete appointment"));
        },
      },
    ]);
  };

  const onPickDate = (event, selected) => {
    setShowDatePicker(false);
    if (!selected) return;
    // Keep the current time, update only date parts
    const next = new Date(dateObj);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    setDateObj(next);
  };

  const onPickTime = (event, selected) => {
    setShowTimePicker(false);
    if (!selected) return;
    const next = new Date(dateObj);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setDateObj(next);
  };

  return (
    <Screen style={styles.screen}>
      <AppButton
        title="Back to Schedule"
        variant="ghost"
        onPress={() => navigation.navigate("ScheduleList")}
        style={styles.backBtn}
        textStyle={{ color: colors.foreground }}
        left={<Ionicons name="arrow-back" size={18} color={colors.foreground} />}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <AppCard style={styles.card}>
            <Text style={styles.title}>{isEditMode ? "Edit Appointment" : "New Appointment"}</Text>

            <View style={{ gap: 16 }}>
              <SelectField
                label="Select Pet *"
                value={petId}
                onValueChange={setPetId}
                options={petOptions}
                placeholder="Choose a pet"
                error={!petId ? "Please select a pet" : undefined}
              />

              {selectedPet ? (
                <View style={styles.petPreview}>
                  <View style={styles.petPreviewImgWrap}>
                    {selectedPet.photoUrl ? (
                      <Image source={{ uri: selectedPet.photoUrl }} style={styles.petPreviewImg} />
                    ) : (
                      <View style={styles.petPreviewFallback}>
                        <Text style={{ fontSize: 22 }}>{getSpeciesEmoji(selectedPet.species)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.petPreviewName}>{selectedPet.name}</Text>
                    <Text style={styles.petPreviewMeta}>
                      {selectedPet.species}
                      {selectedPet.breed ? ` • ${selectedPet.breed}` : ""}
                    </Text>
                  </View>
                </View>
              ) : null}

              <SelectField label="Appointment Type *" value={type} onValueChange={setType} options={TYPE_OPTIONS} />

              <View style={styles.dateCard}>
                <Text style={styles.dateLabel}>Date & Time *</Text>
                <Text style={styles.dateValue}>
                  {formatDate(dateObj)} • {formatTime(dateObj)}
                </Text>

                <View style={styles.dateButtons}>
                  <AppButton
                    title="Pick Date"
                    variant="outline"
                    onPress={() => setShowDatePicker(true)}
                    left={<Ionicons name="calendar" size={18} color={colors.primary} />}
                    style={{ flex: 1, height: 44 }}
                    disabled={submitting}
                  />
                  <AppButton
                    title="Pick Time"
                    variant="outline"
                    onPress={() => setShowTimePicker(true)}
                    left={<Ionicons name="time" size={18} color={colors.primary} />}
                    style={{ flex: 1, height: 44 }}
                    disabled={submitting}
                  />
                </View>

                {showDatePicker ? (
                  <DateTimePicker value={dateObj} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onPickDate} />
                ) : null}

                {showTimePicker ? (
                  <DateTimePicker value={dateObj} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onPickTime} />
                ) : null}
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Enable Reminder</Text>
                  <Text style={styles.switchHint}>Get notified before the appointment</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: colors.switchBackground, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {isEditMode ? (
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>Mark as Completed</Text>
                    <Text style={styles.switchHint}>This appointment has been completed</Text>
                  </View>
                  <Switch
                    value={isCompleted}
                    onValueChange={setIsCompleted}
                    trackColor={{ false: colors.switchBackground, true: colors.success }}
                    thumbColor="#fff"
                  />
                </View>
              ) : null}

              <AppField
                label="Notes"
                placeholder="Additional info (vaccine type, meds needed, etc.)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />

              <View style={styles.buttonsRow}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => navigation.navigate("ScheduleList")}
                  style={{ flex: 1 }}
                  left={<Ionicons name="close" size={18} color={colors.primary} />}
                  disabled={submitting}
                />

                {isEditMode ? (
                  <AppButton
                    title="Delete"
                    variant="destructive"
                    onPress={confirmDelete}
                    left={<Ionicons name="trash" size={18} color={colors.primaryForeground} />}
                    disabled={submitting}
                    style={{ height: 48 }}
                  />
                ) : null}

                <AppButton
                  title={submitting ? "Saving" : isEditMode ? "Save Changes" : "Create Appointment"}
                  onPress={onSubmit}
                  loading={submitting}
                  disabled={!petId}
                  style={{ flex: 1 }}
                  left={<Ionicons name="save" size={18} color={colors.primaryForeground} />}
                />
              </View>

              {/* Native date/time picker enabled */}
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 110 },
  backBtn: { alignSelf: "flex-start", paddingHorizontal: 0, borderWidth: 0, height: 40 },
  card: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.foreground, marginBottom: spacing.md },
  petPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petPreviewImgWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.secondary,
  },
  petPreviewImg: { width: "100%", height: "100%", resizeMode: "cover" },
  petPreviewFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  petPreviewName: { ...typography.bodyMedium, color: colors.foreground },
  petPreviewMeta: { ...typography.small, color: colors.mutedForeground, marginTop: 4 },

  dateCard: {
    padding: spacing.md,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  dateLabel: { ...typography.smallMedium, color: colors.mutedForeground },
  dateValue: { ...typography.bodyMedium, color: colors.foreground },
  dateButtons: { flexDirection: "row", gap: spacing.sm },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  switchTitle: { ...typography.bodyMedium, color: colors.foreground },
  switchHint: { ...typography.small, color: colors.mutedForeground, marginTop: 4 },

  buttonsRow: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.sm, alignItems: "center" },
  helper: { ...typography.small, color: colors.mutedForeground, marginTop: spacing.sm },
});
