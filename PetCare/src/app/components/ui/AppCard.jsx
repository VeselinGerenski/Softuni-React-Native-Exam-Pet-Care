import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, shadow } from "../../theme/theme";

export default function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    ...shadow.card,
  },
});
