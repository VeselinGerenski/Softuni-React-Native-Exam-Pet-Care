import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/layout/Screen";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import { useAuth } from "../../providers/AuthProvider";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { getInitials } from "../../utils/format";
import { mockUserProfile } from "../../data/mockData";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const displayName = useMemo(() => {
    if (!user) return "User";
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  const email = user?.email || "No email";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.navigate("Login");
        },
      },
    ]);
  };

  return (
    <ScrollView >
    <Screen style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="person" size={28} color={colors.primaryForeground} />
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your account information</Text>
      </View>

      {/* Profile Card */}
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoHead}>
            <Ionicons name="mail" size={18} color={colors.primary} />
            <Text style={styles.infoLabel}>Email Address</Text>
          </View>
          <Text style={styles.infoValue}>{email}</Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoHead}>
            <Ionicons name="paw" size={18} color={colors.primary} />
            <Text style={styles.infoLabel}>Member Since</Text>
          </View>
          <Text style={styles.infoValue}>{mockUserProfile.memberSinceLabel}</Text>
        </View>
      </AppCard>

      {/* About */}
      <AppCard style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>About PetCare</Text>
        <Text style={styles.aboutText}>
          PetCare helps you manage your pets' health and wellness by keeping track of:
        </Text>
        <View style={styles.bullets}>
          {[
            "Pet profiles and information",
            "Vaccination schedules",
            "Vet appointments",
            "Medication reminders",
            "Grooming sessions",
          ].map((t) => (
            <Text key={t} style={styles.bullet}>• {t}</Text>
          ))}
        </View>
        <Text style={styles.version}>Version 1.0.0 • Built with ❤️ for pet lovers</Text>
      </AppCard>

      <AppButton
        title="Logout"
        variant="destructive"
        onPress={handleLogout}
        left={<Ionicons name="log-out" size={20} color={colors.primaryForeground} />}
        style={styles.logoutBtn}
      />
    </Screen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 110 },
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
  subtitle: { ...typography.body, color: colors.mutedForeground, marginTop: 6 },

  profileCard: {
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: "rgba(255,140,66,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { ...typography.h2, color: colors.primaryForeground },
  name: { ...typography.h3, color: colors.foreground, marginBottom: spacing.md },
  infoBox: {
    alignSelf: "stretch",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  infoHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  infoLabel: { ...typography.small, color: colors.mutedForeground },
  infoValue: { ...typography.bodyMedium, color: colors.foreground, marginLeft: 28 },

  aboutCard: { padding: spacing.lg, marginBottom: spacing.lg },
  aboutTitle: { ...typography.h3, color: colors.foreground, marginBottom: 10 },
  aboutText: { ...typography.body, color: colors.mutedForeground, marginBottom: 10 },
  bullets: { gap: 6, marginLeft: 6, marginBottom: 10 },
  bullet: { ...typography.body, color: colors.mutedForeground },
  version: {
    ...typography.small,
    color: colors.mutedForeground,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(45,40,35,0.08)",
  },

  logoutBtn: { height: 56 },
});
