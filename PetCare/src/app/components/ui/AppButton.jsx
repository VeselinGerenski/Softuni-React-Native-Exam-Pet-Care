import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
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
        (!isOutline && !isGhost && !disabled) ? shadow.button : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {left}
          {loading ? (
            <ActivityIndicator color={txt} />
          ) : (
            <Text style={[styles.text, { color: txt }, textStyle]}>{title}</Text>
          )}
        </>
      )}
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
