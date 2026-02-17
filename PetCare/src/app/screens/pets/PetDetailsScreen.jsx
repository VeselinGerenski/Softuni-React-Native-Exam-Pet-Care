import React, { useMemo } from "react";
import {
  Alert,
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
import { useData } from "../../providers/DataProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { calculateAge, formatDate, formatTime, getSpeciesEmoji } from "../../utils/format";

export default function PetDetailsScreen({ route, navigation }) {
  const { petId } = route.params || {};
  const { pets, appointments, deletePet } = useData();

  const pet = useMemo(() => pets.find((p) => p.id === String(petId)), [pets, petId]);
  const petAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.petId === String(petId))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [appointments, petId]);

  if (!pet) {
    return (
     
      <Screen style={styles.center}>
        <AppCard style={{ alignItems: "center" }}>
          <Text style={styles.notFoundTitle}>Pet Not Found</Text>
          <AppButton
            title="Back to Pets"
            onPress={() => navigation.navigate("PetsList")}
            left={<Ionicons name="arrow-back" size={18} color={colors.primaryForeground} />}
          />
        </AppCard>
      </Screen>
    );
  }

  const confirmDelete = () => {
    Alert.alert(
      "Delete pet",
      `Delete ${pet.name}? This will also delete all associated appointments.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Firestore/Storage delete
            Promise.resolve(deletePet(pet.id))
              .then(() => navigation.navigate("PetsList"))
              .catch((e) => Alert.alert("Error", e?.message || "Could not delete pet"));
          },
        },
      ]
    );
  };

  const goToNewAppointment = () => navigation.navigate("ScheduleTab", {
    screen: "ScheduleList",
    params: { preFilterPetId: pet.id },
  });

  return (
     <ScrollView>
    <Screen style={styles.screen}>
      <AppButton
        title="Back to Pets"
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        textStyle={{ color: colors.foreground }}
        left={<Ionicons name="arrow-back" size={18} color={colors.foreground} />}
      />

      {/* Profile Card */}
      <AppCard style={styles.profileCard}>
        <View style={styles.profileGrid}>
          <View style={styles.photoSide}>
            {pet.photoUrl ? (
              <Image source={{ uri: pet.photoUrl }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoFallback}>
                <Text style={styles.profilePhotoFallbackText}>{getSpeciesEmoji(pet.species)}</Text>
              </View>
            )}
          </View>
          <View style={styles.infoSide}>
            <Text style={styles.petName}>{pet.name}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Species:</Text>
              <View style={{ marginLeft: 10 }}>
                <Badge variant="outline">{pet.species}</Badge>
              </View>
            </View>

            {pet.breed ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Breed:</Text>
                <Text style={styles.infoValue}>{pet.breed}</Text>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{calculateAge(pet.birthDate)} old</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{pet.neutered ? "✓ Neutered" : "○ Not Neutered"}</Text>
            </View>

            {pet.notes ? (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{pet.notes}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.profileActions}>
              <AppButton
                title="Edit"
                onPress={() => navigation.navigate("PetForm", { petId: pet.id })}
                style={{ flex: 1 }}
                left={<Ionicons name="create" size={18} color={colors.primaryForeground} />}
              />
              <AppButton
                title="Delete"
                variant="destructive"
                onPress={confirmDelete}
                style={{ flex: 1 }}
                left={<Ionicons name="trash" size={18} color={colors.primaryForeground} />}
              />
            </View>
          </View>
        </View>
      </AppCard>

      {/* Appointments */}
      <AppCard style={styles.aptsCard}>
        <View style={styles.aptsHeader}>
          <View style={styles.aptsTitleRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.aptsTitle}>Appointments</Text>
          </View>
          <AppButton
            title="Add"
            onPress={() => navigation.navigate("ScheduleTab", { screen: "AppointmentForm", params: { petId: pet.id } })}
            style={styles.addSmall}
            left={<Ionicons name="add" size={18} color={colors.primaryForeground} />}
          />
        </View>

        {petAppointments.length === 0 ? (
          <View style={styles.aptsEmpty}>
            <Ionicons name="calendar" size={48} color="rgba(122,114,105,0.35)" />
            <Text style={styles.aptsEmptyText}>No appointments scheduled</Text>
            <AppButton
              title="Schedule First Appointment"
              variant="outline"
              onPress={() => navigation.navigate("ScheduleTab", { screen: "AppointmentForm", params: { petId: pet.id } })}
              left={<Ionicons name="add" size={18} color={colors.primary} />}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {petAppointments.map((apt) => (
              <Pressable
                key={apt.id}
                onPress={() => navigation.navigate("ScheduleTab", { screen: "AppointmentForm", params: { appointmentId: apt.id } })}
                style={({ pressed }) => [styles.aptRow, pressed ? { opacity: 0.85 } : null]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.aptBadges}>
                    <Badge type={apt.type}>{apt.type}</Badge>
                    {apt.isCompleted ? <Badge variant="outline">✓ Completed</Badge> : null}
                    {apt.reminderEnabled ? <Badge variant="outline">🔔 Reminder</Badge> : null}
                  </View>
                  <Text style={styles.aptDate}>
                    {formatDate(apt.dateTime)} • {formatTime(apt.dateTime)}
                  </Text>
                  {apt.notes ? <Text style={styles.aptNotes} numberOfLines={2}>{apt.notes}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        )}
      </AppCard>
    </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 110,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    color: colors.foreground,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    borderWidth: 0,
    height: 40,
  },
  profileCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photoSide: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.secondary,
  },
  profilePhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  profilePhotoFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  profilePhotoFallbackText: { fontSize: 88 },
  infoSide: {
    width: "100%",
    padding: spacing.lg,
  },
  petName: {
    ...typography.h1,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  infoLabel: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  infoValue: {
    ...typography.body,
    color: colors.foreground,
    marginLeft: 10,
    flexShrink: 1,
  },
  notesLabel: {
    ...typography.smallMedium,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  notesBox: {
    backgroundColor: colors.muted,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesText: {
    ...typography.body,
    color: colors.foreground,
  },
  profileActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  aptsCard: {
    padding: spacing.lg,
  },
  aptsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  aptsTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  aptsTitle: { ...typography.h3, color: colors.foreground },
  addSmall: {
    height: 40,
    paddingHorizontal: 14,
  },
  aptsEmpty: {
    alignItems: "center",
    paddingVertical: 18,
  },
  aptsEmptyText: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: 10,
  },
  aptRow: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  aptBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  aptDate: { ...typography.smallMedium, color: colors.foreground },
  aptNotes: { ...typography.small, color: colors.mutedForeground, marginTop: 4 },
});
