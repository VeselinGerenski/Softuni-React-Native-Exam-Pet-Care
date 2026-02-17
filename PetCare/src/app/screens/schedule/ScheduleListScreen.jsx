import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/layout/Screen";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import Badge from "../../components/ui/Badge";
import SelectField from "../../components/ui/SelectField";
import { useData } from "../../providers/DataProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { formatDate, formatTime, getSpeciesEmoji } from "../../utils/format";

const TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Vaccine", value: "Vaccine" },
  { label: "Medication", value: "Medication" },
  { label: "Vet Visit", value: "Vet Visit" },
  { label: "Grooming", value: "Grooming" },
  { label: "Other", value: "Other" },
];

export default function ScheduleListScreen({ route, navigation }) {
  const { pets, appointments } = useData();
  const preFilterPetId = route?.params?.preFilterPetId;

  const [filterPet, setFilterPet] = useState(preFilterPetId || "all");
  const [filterType, setFilterType] = useState("all");

  const petOptions = useMemo(
    () => [{ label: "All Pets", value: "all" }, ...pets.map((p) => ({ label: p.name, value: p.id }))],
    [pets]
  );

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (filterPet !== "all" && a.petId !== filterPet) return false;
        if (filterType !== "all" && a.type !== filterType) return false;
        return true;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [appointments, filterPet, filterType]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return filteredAppointments.filter((a) => !a.isCompleted && new Date(a.dateTime) >= now);
  }, [filteredAppointments]);

  const past = useMemo(() => {
    const now = new Date();
    return filteredAppointments.filter((a) => a.isCompleted || new Date(a.dateTime) < now);
  }, [filteredAppointments]);

  const getPet = (petId) => pets.find((p) => p.id === petId);
  const getPetName = (petId) => getPet(petId)?.name || "Unknown";

  const renderCard = (apt, dimmed = false) => {
    const pet = getPet(apt.petId);
    return (
      <Pressable
        key={apt.id}
        onPress={() => navigation.navigate("AppointmentForm", { appointmentId: apt.id })}
        style={({ pressed }) => [styles.aptCard, dimmed ? { opacity: 0.6 } : null, pressed ? { opacity: 0.85 } : null]}
      >
        <View style={styles.aptRow}>
          <View style={styles.petThumb}>
            {pet?.photoUrl ? (
              <Image source={{ uri: pet.photoUrl }} style={styles.petThumbImg} />
            ) : (
              <View style={styles.petThumbFallback}>
                <Text style={styles.petThumbEmoji}>{getSpeciesEmoji(pet?.species)}</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.badgeRow}>
              <Text style={styles.petName}>{getPetName(apt.petId)}</Text>
              <Badge type={apt.type}>{apt.type}</Badge>
              {apt.isCompleted ? <Badge variant="outline">✓ Completed</Badge> : null}
              {apt.reminderEnabled ? <Badge variant="outline">🔔 Reminder</Badge> : null}
            </View>

            <Text style={styles.dateText}>{formatDate(apt.dateTime)}</Text>
            <Text style={styles.timeText}>{formatTime(apt.dateTime)}</Text>
            {apt.notes ? <Text style={styles.notesText} numberOfLines={2}>{apt.notes}</Text> : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen style={styles.screen}>
      {/* Use ScrollView to avoid nested/inline scrollbars */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={28} color={colors.primaryForeground} />
          </View>
          <Text style={styles.title}>Care Schedule</Text>
          <Text style={styles.subtitle}>Manage appointments for all pets</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            title="Add Appointment"
            onPress={() => navigation.navigate("AppointmentForm")}
            left={<Ionicons name="add" size={20} color={colors.primaryForeground} />}
          />
        </View>

        {/* Filters */}
        <AppCard style={styles.filtersCard}>
          <View style={styles.filtersHeader}>
            <Ionicons name="filter" size={18} color={colors.primary} />
            <Text style={styles.filtersTitle}>Filters</Text>
          </View>

          <View style={styles.filtersGrid}>
            <SelectField label="Filter by Pet" value={filterPet} onValueChange={setFilterPet} options={petOptions} />
            <SelectField label="Filter by Type" value={filterType} onValueChange={setFilterType} options={TYPE_OPTIONS} />
          </View>
        </AppCard>

        {/* Upcoming */}
        <View style={{ marginBottom: spacing.lg }}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionBar, { backgroundColor: colors.primary }]} />
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          </View>

          {upcoming.length === 0 ? (
            <AppCard style={styles.sectionEmpty}>
              <Ionicons name="calendar" size={42} color="rgba(122,114,105,0.35)" />
              <Text style={styles.sectionEmptyText}>No upcoming appointments</Text>
            </AppCard>
          ) : (
            <View style={{ gap: 12 }}>
              {upcoming.map((a) => renderCard(a, false))}
            </View>
          )}
        </View>

        {/* Past */}
        {past.length ? (
          <View>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionBar, { backgroundColor: colors.mutedForeground }]} />
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Past Appointments</Text>
            </View>
            <View style={{ gap: 12 }}>
              {past.map((a) => renderCard(a, true))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 110 },
  scrollContent: { paddingBottom: 120 },
  header: { alignItems: "center", marginBottom: spacing.lg },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { ...typography.h1, color: colors.foreground },
  subtitle: { ...typography.body, color: colors.mutedForeground, marginTop: 6, textAlign: "center" },
  actions: { marginBottom: spacing.lg },
  filtersCard: { padding: spacing.md, marginBottom: spacing.lg },
  filtersHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.sm },
  filtersTitle: { ...typography.bodyMedium, color: colors.foreground },
  filtersGrid: { gap: spacing.md },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.md },
  sectionBar: { width: 8, height: 28, borderRadius: radius.pill },
  sectionTitle: { ...typography.h3, color: colors.foreground },
  sectionEmpty: {
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(255,140,66,0.3)",
    padding: spacing.lg,
  },
  sectionEmptyText: { ...typography.body, color: colors.mutedForeground, marginTop: 10 },

  aptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  aptRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  petThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.secondary,
  },
  petThumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
  petThumbFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  petThumbEmoji: { fontSize: 26 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 6 },
  petName: { ...typography.bodyMedium, color: colors.foreground },
  dateText: { ...typography.smallMedium, color: colors.foreground },
  timeText: { ...typography.small, color: colors.mutedForeground, marginTop: 2 },
  notesText: { ...typography.small, color: colors.mutedForeground, marginTop: 8 },
});
