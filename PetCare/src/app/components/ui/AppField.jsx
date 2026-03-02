import React, { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/theme";

/**
 * A styled TextInput wrapper.
 *
 * Keyboard/typing best-practices:
 * - The component forwards refs so screens can focus the next field.
 * - Extra TextInput props can be passed through via ...inputProps.
 */
const AppField = forwardRef(function AppField(
  {
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
    style,
    inputStyle,
    ...inputProps
  },
  ref
) {
  // Avoid aggressive autocorrect for most single-line inputs.
  const autoCorrect =
    typeof inputProps.autoCorrect === "boolean"
      ? inputProps.autoCorrect
      : !!multiline; // allow autocorrect for notes/textareas by default

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.labelRow}>
          {left ? left : null}
          <Text style={styles.labelText}>{label}</Text>
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor="rgba(45,40,35,0.45)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          multiline ? styles.textarea : null,
          error ? styles.inputError : null,
          inputStyle,
        ]}
        {...inputProps}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default AppField;

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
