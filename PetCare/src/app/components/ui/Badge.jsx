import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/theme";

const TYPE_STYLES = {
  Vaccine: { bg: "#E3F2FD", fg: "#1565C0", border: "#BBDEFB" },
  Medication: { bg: "#E8F5E9", fg: "#2E7D32", border: "#C8E6C9" },
  "Vet Visit": { bg: "#F3E5F5", fg: "#6A1B9A", border: "#E1BEE7" },
  Grooming: { bg: "#FCE4EC", fg: "#AD1457", border: "#F8BBD0" },
  Other: { bg: "#F5F5F5", fg: "#424242", border: "#E0E0E0" },
};

export default function Badge({ children, variant = "type", type = "Other", style }) {
  const t = variant === "type" ? (TYPE_STYLES[type] || TYPE_STYLES.Other) : null;
  const bg = variant === "outline" ? "transparent" : t?.bg || colors.muted;
  const fg = variant === "outline" ? colors.mutedForeground : t?.fg || colors.mutedForeground;
  const border = variant === "outline" ? "rgba(45,40,35,0.15)" : t?.border || colors.border;

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: {
    ...typography.smallMedium,
  },
});
