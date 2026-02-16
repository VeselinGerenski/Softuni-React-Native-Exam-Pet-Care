import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScheduleListScreen from "../screens/schedule/ScheduleListScreen.jsx";
import AppointmentFormScreen from "../screens/schedule/AppointmentFormScreen.jsx";

const Stack = createNativeStackNavigator();

export default function ScheduleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ScheduleList" component={ScheduleListScreen} options={{ title: "Schedule" }} />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentFormScreen}
        options={{ title: "Add / Edit Appointment" }}
      />
    </Stack.Navigator>
  );
}
