import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PetsListScreen from "../screens/pets/PetsListScreen.jsx";
import PetDetailsScreen from "../screens/pets/PetDetailsScreen.jsx";
import PetFormScreen from "../screens/pets/PetFormScreen.jsx";

const Stack = createNativeStackNavigator();

export default function PetsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PetsList" component={PetsListScreen} />
      <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
      <Stack.Screen name="PetForm" component={PetFormScreen} />
    </Stack.Navigator>
  );
}
