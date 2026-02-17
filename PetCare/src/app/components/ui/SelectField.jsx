import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme/theme";

export default function SelectField({
  label,
  value,
  onValueChange,
  placeholder = "Select",
  options = [], // {label,value,left}
  error,
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable onPress={() => setOpen(true)} style={[styles.field, error ? styles.fieldError : null]}>
        <Text style={[styles.value, !value ? styles.placeholder : null]}>
          {selected?.label || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => null}>
            <Text style={styles.sheetTitle}>{label || "Choose"}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onValueChange?.(item.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed ? { opacity: 0.7 } : null]}
                >
                  <View style={styles.optionRow}>
                    {item.left ? <Text style={styles.optionLeft}>{item.left}</Text> : null}
                    <Text style={styles.optionLabel}>{item.label}</Text>
                  </View>
                  {value === item.value ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { ...typography.smallMedium, color: colors.foreground },
  field: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: "rgba(255,140,66,0.2)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldError: { borderColor: "rgba(230,57,70,0.45)" },
  value: { ...typography.body, color: colors.foreground },
  placeholder: { color: "rgba(45,40,35,0.45)" },
  chevron: { ...typography.bodyMedium, color: colors.mutedForeground },
  error: { ...typography.small, color: colors.destructive },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: { ...typography.h3, marginBottom: spacing.md, color: colors.foreground },
  option: {
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  optionLeft: { fontSize: 18 },
  optionLabel: { ...typography.body, color: colors.foreground },
  check: { ...typography.bodyMedium, color: colors.primary },
  sep: { height: 1, backgroundColor: "rgba(45,40,35,0.08)" },
});
