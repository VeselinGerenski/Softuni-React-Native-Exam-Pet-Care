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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

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

  const tabBarHeight = useBottomTabBarHeight();

  const existing = useMemo(
    () => pets.find((p) => p.id === String(petId)),
    [pets, petId]
  );

  // photoUrl is resolved at runtime (from Storage) and comes from the pet doc.
  // localPhotoUri is used for previewing a freshly picked image before upload.
  const [localPhotoUri, setLocalPhotoUri] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [birthDateObj, setBirthDateObj] = useState(new Date());
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [neutered, setNeutered] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setLocalPhotoUri("");
      setPhotoUrl(existing.photoUrl || "");
      setName(existing.name || "");
      setSpecies(existing.species || "Dog");
      setBreed(existing.breed || "");
      // Parse YYYY-MM-DD safely into a local Date.
      const bd = (existing.birthDate || "").trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(bd)) {
        const [y, m, d] = bd.split("-").map((x) => parseInt(x, 10));
        setBirthDateObj(new Date(y, (m || 1) - 1, d || 1));
      } else {
        setBirthDateObj(new Date());
      }
      setNeutered(!!existing.neutered);
      setNotes(existing.notes || "");
    }
  }, [existing]);

  const validate = () => {
    if (!name.trim() || name.trim().length < 2)
      return "Please enter a name (min 2 characters).";
    if (!birthDateObj || Number.isNaN(birthDateObj.getTime()))
      return "Please pick a valid birth date.";
    return null;
  };

  const birthDateString = useMemo(() => {
    const y = birthDateObj.getFullYear();
    const m = String(birthDateObj.getMonth() + 1).padStart(2, "0");
    const d = String(birthDateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [birthDateObj]);

  const onSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert("Check the form", err);

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      species,
      breed: breed.trim(),
      birthDate: birthDateString,
      neutered,
      notes: notes.trim(),
    };

    try {
      if (isEditMode) {
        await updatePet(String(petId), payload, localPhotoUri);
        // Return to the existing details screen in the stack (avoid duplicating routes).
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.replace("PetDetails", { petId: String(petId) });
      } else {
        const newId = await addPet(payload, localPhotoUri);
        // Replace the form with details so back from details returns to the list.
        navigation.replace("PetDetails", { petId: newId });
      }
    } catch (e) {
      Alert.alert(
        "Could not save",
        e?.message ||
          "Something went wrong while saving. If this happened after picking a photo, check Firebase Storage rules."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = async () => {
    try {
      // Ask permission (will no-op / resolve immediately if already granted).
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to select a pet photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // In expo-image-picker v17, mediaTypes expects 'images' | 'videos' | 'livePhotos'
        // (string or array). Using strings avoids enum casing issues.
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        if (uri) setLocalPhotoUri(uri);
      }
    } catch (e) {
      Alert.alert(
        "Could not open photo library",
        e?.message || "Image picker failed to open. Please try again."
      );
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: tabBarHeight + spacing.lg }}
          scrollIndicatorInsets={{ bottom: tabBarHeight }}
          showsVerticalScrollIndicator={false}
        >
          <AppCard style={styles.card}>
            <Text style={styles.title}>{isEditMode ? "Edit Pet" : "Add New Pet"}</Text>

            {/* Photo */}
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionLabel}>Pet Photo</Text>
              <View style={styles.photoRow}>
                <View style={styles.photoPreview}>
                  {localPhotoUri ? (
                    <Image source={{ uri: localPhotoUri }} style={styles.photoImg} />
                  ) : photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.photoImg} />
                  ) : (
                    <View style={styles.photoFallback}>
                      <Text style={{ fontSize: 42 }}>{getSpeciesEmoji(species)}</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, gap: 8 }}>
                  <AppButton
                    title={localPhotoUri || photoUrl ? "Change Photo" : "Choose Photo"}
                    variant="outline"
                    onPress={pickImage}
                    left={<Ionicons name="image" size={18} color={colors.primary} />}
                    style={{ alignSelf: "flex-start", height: 42 }}
                    disabled={submitting}
                  />
                  <Text style={styles.helper}>
                    Photos are uploaded to Firebase Storage. We only store the Storage path in Firestore.
                  </Text>
                </View>
              </View>
            </View>

            {/* Fields */}
            <View style={{ gap: 16, marginTop: spacing.lg }}>
              <AppField
                label="Pet Name *"
                placeholder="e.g., Max, Luna"
                value={name}
                onChangeText={setName}
              />

              <SelectField
                label="Species *"
                value={species}
                onValueChange={setSpecies}
                options={SPECIES_OPTIONS}
              />

              <AppField
                label="Breed"
                placeholder="e.g., Golden Retriever"
                value={breed}
                onChangeText={setBreed}
              />

              <View style={styles.dateCard}>
                <Text style={styles.dateLabel}>Birth Date *</Text>
                <Text style={styles.dateValue}>{birthDateString}</Text>

                <View style={styles.dateButtons}>
                  <AppButton
                    title="Pick Birth Date"
                    variant="outline"
                    onPress={() => setShowBirthDatePicker(true)}
                    left={<Ionicons name="calendar" size={18} color={colors.primary} />}
                    style={{ flex: 1, height: 44 }}
                    disabled={submitting}
                  />
                </View>

                {showBirthDatePicker ? (
                  <DateTimePicker
                    value={birthDateObj}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selected) => {
                      setShowBirthDatePicker(false);
                      if (!selected) return;
                      setBirthDateObj(selected);
                    }}
                  />
                ) : null}
              </View>

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
  screen: {},
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
  dateCard: {
    padding: spacing.md,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  dateLabel: { ...typography.smallMedium, color: colors.foreground },
  dateValue: { ...typography.bodyMedium, color: colors.mutedForeground },
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
  buttonsRow: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.sm },
});
