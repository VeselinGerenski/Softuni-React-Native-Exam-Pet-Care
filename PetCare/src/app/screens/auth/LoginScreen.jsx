import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../../components/layout/Screen";
import AppCard from "../../components/ui/AppCard";
import AppButton from "../../components/ui/AppButton";
import AppField from "../../components/ui/AppField";
import { useAuth } from "../../providers/AuthProvider";
import { colors, spacing, typography } from "../../theme/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      // RootNavigator will switch to AppTabs when authenticated
    } catch (e) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.kav}>
        <View style={styles.centerWrap}>
          <AppCard style={styles.card}>
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Ionicons name="paw" size={34} color={colors.primaryForeground} />
              </View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Login to manage your pets' care</Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <AppField
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<Ionicons name="mail" size={16} color={colors.primary} style={{ marginRight: 8 }} />}
              />

              <AppField
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                left={<Ionicons name="lock-closed" size={16} color={colors.primary} style={{ marginRight: 8 }} />}
              />

              <AppButton
                title={loading ? "Logging in" : "Login"}
                onPress={handleLogin}
                loading={loading}
                disabled={!email.trim() || !password}
                left={<Ionicons name="log-in" size={18} color={colors.primaryForeground} />}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate("Register")}
                >
                  Register here
                </Text>
              </View>
            </View>
          </AppCard>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: spacing.md,
    justifyContent: "center",
  },
  kav: { flex: 1, justifyContent: "center" },
  centerWrap: { flex: 1, justifyContent: "center" },
  card: { padding: spacing.xl, borderWidth: 2, borderColor: colors.border },
  header: { alignItems: "center", marginBottom: spacing.lg },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { ...typography.h2, color: colors.foreground },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    marginTop: 8,
    textAlign: "center",
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(230,57,70,0.08)",
    borderWidth: 1,
    borderColor: "rgba(230,57,70,0.25)",
    marginBottom: spacing.md,
  },
  errorText: { ...typography.small, color: colors.destructive },
  form: { gap: 16 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 6 },
  footerText: { ...typography.small, color: colors.mutedForeground },
  footerLink: { ...typography.smallMedium, color: colors.primary },
});
