import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PetsStack from "./PetsStack";
import ScheduleStack from "./ScheduleStack";
import ProfileStack from "./ProfileStack";
import { colors } from "../theme/theme";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 18 : 10);
  const barHeight = 56 + bottomPad;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        // Overlay the content like the design (content should hide *under* the bar),
        // while still respecting safe-area so it never clashes with system buttons.
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomPad,
            height: barHeight,
          },
        ],
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, size, focused }) => {
          const icon =
            route.name === "PetsTab"
              ? focused
                ? "paw"
                : "paw-outline"
              : route.name === "ScheduleTab"
                ? focused
                  ? "calendar"
                  : "calendar-outline"
                : focused
                  ? "person"
                  : "person-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="PetsTab" component={PetsStack} options={{ title: "Pets" }} />
      <Tab.Screen name="ScheduleTab" component={ScheduleStack} options={{ title: "Schedule" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    // Use an opaque separator so scroll content never shows through as a "thin line"
    borderTopColor: colors.muted,
    borderTopWidth: 1,
    borderBottomColor: colors.muted,
    borderBottomWidth: 1,
    paddingTop: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // No rounding on the bar (top border only)
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: "hidden",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
