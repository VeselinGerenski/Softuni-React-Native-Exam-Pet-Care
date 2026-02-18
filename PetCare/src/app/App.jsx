import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./providers/AuthProvider";
import { DataProvider } from "./providers/DataProvider";
import { configureNotifications } from "./utils/notifications";

export default function App() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
