import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/theme";

export default function AppField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  multiline,
  numberOfLines,
  error,
  left,
}) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.labelRow}>
          {left ? left : null}
          <Text style={styles.labelText}>{label}</Text>
        </Text>
      ) : null}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(45,40,35,0.45)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[styles.input, multiline ? styles.textarea : null, error ? styles.inputError : null]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    ...typography.smallMedium,
    color: colors.foreground,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: "rgba(255,140,66,0.2)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.foreground,
    ...typography.body,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "rgba(230,57,70,0.45)",
  },
  error: {
    ...typography.small,
    color: colors.destructive,
  },
});
