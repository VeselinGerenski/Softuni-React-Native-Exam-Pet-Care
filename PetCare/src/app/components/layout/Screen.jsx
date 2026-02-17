import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children, style }) {
  return (
   <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  // Match the design: keep comfortable side/top padding, but allow content to
  // scroll all the way down under the tab bar (no extra bottom padding here).
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: 0,
  },
});
