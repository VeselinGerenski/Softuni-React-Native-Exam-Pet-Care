
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PetsListScreen from "../screens/pets/PetsListScreen.jsx";
import PetDetailsScreen from "../screens/pets/PetDetailsScreen.jsx";
import PetFormScreen from "../screens/pets/PetFormScreen.jsx";

const Stack = createNativeStackNavigator();

export default function PetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PetsList" component={PetsListScreen} options={{ title: "My Pets" }} />
      <Stack.Screen name="PetDetails" component={PetDetailsScreen} options={{ title: "Pet Details" }} />
      <Stack.Screen name="PetForm" component={PetFormScreen} options={{ title: "Add / Edit Pet" }} />
    </Stack.Navigator>
  );
}
