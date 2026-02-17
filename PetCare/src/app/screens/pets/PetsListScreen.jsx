import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Screen from "../../components/layout/Screen";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import { useData } from "../../providers/DataProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { calculateAge, getSpeciesEmoji } from "../../utils/format";

export default function PetsListScreen({ navigation }) {
  const { pets, refreshData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  const tabBarHeight = useBottomTabBarHeight();

  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const cardWidth = columns === 1 ? "100%" : columns === 2 ? "48%" : "31%";

  const data = useMemo(() => pets, [pets]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 650));
    refreshData();
    setIsRefreshing(false);
  };

  return (
    <Screen style={styles.screen}>
      {/* Use ScrollView to avoid nested/inline scrollbars (especially on web) */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + spacing.lg },
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="paw" size={28} color={colors.primaryForeground} />
          </View>
          <Text style={styles.title}>Pet Care</Text>
          <Text style={styles.subtitle}>Manage your furry friends</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            title="Add New Pet"
            onPress={() => navigation.navigate("PetForm")}
            style={{ flex: 1 }}
            left={<Ionicons name="add" size={20} color={colors.primaryForeground} />}
          />
          <AppButton
            title="Refresh"
            variant="outline"
            loading={isRefreshing}
            onPress={onRefresh}
            // Keep the button size stable while the spinner shows
            style={{ width: 130 }}
            left={<Ionicons name="refresh" size={18} color={colors.primary} />}
          />
        </View>

        {data.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>No Pets Yet</Text>
            <Text style={styles.emptyText}>
              Start by adding your first pet to track their care schedule
            </Text>
            <AppButton
              title="Add Your First Pet"
              onPress={() => navigation.navigate("PetForm")}
              left={<Ionicons name="add" size={20} color={colors.primaryForeground} />}
              style={{ alignSelf: "stretch" }}
            />
          </AppCard>
        ) : (
          <View style={[styles.grid, columns > 1 ? { gap: spacing.md } : null]}>
            {data.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate("PetDetails", { petId: item.id })}
                style={[styles.cardWrap, { width: cardWidth }]}
              >
                <View style={styles.petCard}>
                  <View style={styles.photoWrap}>
                    {item.photoUrl ? (
                      <Image source={{ uri: item.photoUrl }} style={styles.photo} />
                    ) : (
                      <View style={styles.photoFallback}>
                        <Text style={styles.photoFallbackText}>
                          {getSpeciesEmoji(item.species)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.speciesPill}>
                      <Text style={styles.speciesPillText}>{item.species}</Text>
                    </View>
                  </View>

                  <View style={styles.petBody}>
                    <Text style={styles.petName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.petMeta}>
                      {item.breed ? (
                        <Text style={styles.petMetaText} numberOfLines={1}>
                          Breed: {item.breed}
                        </Text>
                      ) : null}
                      <Text style={styles.petMetaText}>Age: {calculateAge(item.birthDate)}</Text>
                      <Text style={styles.petMetaText}>
                        {item.neutered ? "✓ Neutered" : "○ Not Neutered"}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {},
  scrollContent: {
    // bottom padding is added dynamically using tabBarHeight
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    ...typography.h1,
    color: colors.foreground,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrap: {
    minWidth: 0,
    marginBottom: spacing.md,
  },
  petCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: "hidden",
  },
  photoWrap: {
    aspectRatio: 1,
    backgroundColor: colors.secondary,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoFallbackText: {
    fontSize: 60,
  },
  speciesPill: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(45,40,35,0.08)",
  },
  speciesPillText: {
    ...typography.smallMedium,
    color: colors.foreground,
  },
  petBody: {
    padding: spacing.md,
  },
  petName: {
    ...typography.h3,
    color: colors.foreground,
    marginBottom: 8,
  },
  petMeta: {
    gap: 4,
  },
  petMetaText: {
    ...typography.small,
    color: colors.mutedForeground,
  },
  emptyCard: {
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(255,140,66,0.3)",
  },
  emptyEmoji: { fontSize: 56, marginBottom: 10 },
  emptyTitle: { ...typography.h3, marginBottom: 8, color: colors.foreground },
  emptyText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});
