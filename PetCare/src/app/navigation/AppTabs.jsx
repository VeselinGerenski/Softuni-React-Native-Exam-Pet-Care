import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PetsStack from "./PetsStack";
import ScheduleStack from "./ScheduleStack";
import ProfileStack from "./ProfileStack";
import { colors, radius } from "../theme/theme";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: styles.tabBar,
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.select({ ios: 88, android: 64 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 28, android: 10 }),
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    position: "absolute",
    // Keep the tabs anchored to the bottom edge (no floating/lifted nav)
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
