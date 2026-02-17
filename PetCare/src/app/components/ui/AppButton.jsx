import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing, typography } from "../../theme/theme";

export default function AppButton({
  title,
  onPress,
  variant = "primary", // primary | outline | ghost | destructive
  disabled,
  loading,
  style,
  textStyle,
  left,
}) {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isDestructive = variant === "destructive";

  const bg = isOutline || isGhost ? "transparent" : isDestructive ? colors.destructive : colors.primary;
  const borderColor = isOutline ? colors.primary : "transparent";
  const txt = isOutline || isGhost ? colors.primary : colors.primaryForeground;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor },
        !isOutline && !isGhost && !disabled ? shadow.button : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <>
        {/* Keep layout stable while loading by only hiding content visually */}
        <View style={[styles.inline, loading ? styles.hidden : null]} pointerEvents={loading ? "none" : "auto"}>
          {left}
          <Text style={[styles.text, { color: txt }, textStyle]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {loading ? (
          <View style={styles.spinnerOverlay} pointerEvents="none">
            <ActivityIndicator color={txt} />
          </View>
        ) : null}
      </>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    position: "relative",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  hidden: {
    opacity: 0,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...typography.bodyMedium,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
