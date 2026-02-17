import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/layout/Screen";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppField from "../../components/ui/AppField";
import SelectField from "../../components/ui/SelectField";
import { useData } from "../../providers/DataProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { getSpeciesEmoji } from "../../utils/format";

const SPECIES_OPTIONS = [
  { label: "Dog", value: "Dog", left: "🐕" },
  { label: "Cat", value: "Cat", left: "🐈" },
  { label: "Bird", value: "Bird", left: "🐦" },
  { label: "Rabbit", value: "Rabbit", left: "🐰" },
  { label: "Other", value: "Other", left: "🐾" },
];

export default function PetFormScreen({ route, navigation }) {
  const { petId } = route.params || {};
  const isEditMode = !!petId;
  const { pets, addPet, updatePet } = useData();

  const existing = useMemo(() => pets.find((p) => p.id === String(petId)), [pets, petId]);

  const [photoUrl, setPhotoUrl] = useState("");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [neutered, setNeutered] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setPhotoUrl(existing.photoUrl || "");
      setName(existing.name || "");
      setSpecies(existing.species || "Dog");
      setBreed(existing.breed || "");
      setBirthDate(existing.birthDate || "");
      setNeutered(!!existing.neutered);
      setNotes(existing.notes || "");
    }
  }, [existing]);

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) return "Please enter a name (min 2 characters).";
    if (!birthDate.trim()) return "Please enter a birth date (YYYY-MM-DD).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) return "Birth date must be in YYYY-MM-DD format.";
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert("Check the form", err);

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));

    const payload = {
      name: name.trim(),
      species,
      breed: breed.trim(),
      birthDate: birthDate.trim(),
      neutered,
      notes: notes.trim(),
      photoUrl: photoUrl.trim(),
    };

    if (isEditMode) {
      updatePet(String(petId), payload);
      setSubmitting(false);
      navigation.navigate("PetDetails", { petId: String(petId) });
    } else {
      const newId = addPet(payload);
      setSubmitting(false);
      navigation.navigate("PetDetails", { petId: newId });
    }
  };

  const goBack = () => {
    if (isEditMode) navigation.navigate("PetDetails", { petId: String(petId) });
    else navigation.navigate("PetsList");
  };

  return (
    <Screen style={styles.screen}>
      <AppButton
        title="Back"
        variant="ghost"
        onPress={goBack}
        style={styles.backBtn}
        textStyle={{ color: colors.foreground }}
        left={<Ionicons name="arrow-back" size={18} color={colors.foreground} />}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <AppCard style={styles.card}>
            <Text style={styles.title}>{isEditMode ? "Edit Pet" : "Add New Pet"}</Text>

            {/* Photo */}
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionLabel}>Pet Photo</Text>
              <View style={styles.photoRow}>
                <View style={styles.photoPreview}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.photoImg} />
                  ) : (
                    <View style={styles.photoFallback}>
                      <Text style={{ fontSize: 42 }}>{getSpeciesEmoji(species)}</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, gap: 8 }}>
                  <AppField
                    label="Photo URL"
                    placeholder="https://..."
                    value={photoUrl}
                    onChangeText={setPhotoUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <AppButton
                    title="Use Sample Photo"
                    variant="outline"
                    onPress={() => setPhotoUrl(`https://picsum.photos/seed/pet-${Date.now()}/800`)}
                    left={<Ionicons name="image" size={18} color={colors.primary} />}
                    style={{ alignSelf: "flex-start", height: 42 }}
                  />
                  <Text style={styles.helper}>Tip: replace later with Image Picker</Text>
                </View>
              </View>
            </View>

            {/* Fields */}
            <View style={{ gap: 16, marginTop: spacing.lg }}>
              <AppField label="Pet Name *" placeholder="e.g., Max, Luna" value={name} onChangeText={setName} />

              <SelectField
                label="Species *"
                value={species}
                onValueChange={setSpecies}
                options={SPECIES_OPTIONS}
              />

              <AppField label="Breed" placeholder="e.g., Golden Retriever" value={breed} onChangeText={setBreed} />

              <AppField
                label="Birth Date *"
                placeholder="YYYY-MM-DD"
                value={birthDate}
                onChangeText={setBirthDate}
                keyboardType="numbers-and-punctuation"
              />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Neutered/Spayed</Text>
                  <Text style={styles.switchHint}>Has this pet been neutered or spayed?</Text>
                </View>
                <Switch
                  value={neutered}
                  onValueChange={setNeutered}
                  trackColor={{ false: colors.switchBackground, true: colors.primary }}
                  thumbColor={"#fff"}
                />
              </View>

              <AppField
                label="Notes"
                placeholder="Allergies, behavior, preferences, etc."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />

              <View style={styles.buttonsRow}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={goBack}
                  style={{ flex: 1 }}
                  left={<Ionicons name="close" size={18} color={colors.primary} />}
                  disabled={submitting}
                />
                <AppButton
                  title={submitting ? "Saving" : isEditMode ? "Save Changes" : "Add Pet"}
                  onPress={onSubmit}
                  style={{ flex: 1 }}
                  loading={submitting}
                  left={<Ionicons name="save" size={18} color={colors.primaryForeground} />}
                />
              </View>
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 110 },
  backBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    borderWidth: 0,
    height: 40,
  },
  card: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.foreground, marginBottom: spacing.md },
  sectionLabel: { ...typography.smallMedium, color: colors.mutedForeground },
  photoRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: "rgba(255,140,66,0.2)",
  },
  photoImg: { width: "100%", height: "100%", resizeMode: "cover" },
  photoFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  helper: { ...typography.small, color: colors.mutedForeground },
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
  buttonsRow: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.sm },
});
