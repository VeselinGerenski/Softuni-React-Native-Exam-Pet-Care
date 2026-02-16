import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../providers/AuthProvider";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

export default function RootNavigator() {
  const { user, isBooting } = useAuth();

  if (isBooting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return user ? <AppTabs /> : <AuthStack />;
}
