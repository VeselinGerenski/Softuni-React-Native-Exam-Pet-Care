import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children, style }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
});
