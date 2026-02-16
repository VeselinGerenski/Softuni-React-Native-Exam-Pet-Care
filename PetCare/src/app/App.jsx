import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./providers/AuthProvider";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>

          <StatusBar style="auto" />
          <RootNavigator />
          
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
