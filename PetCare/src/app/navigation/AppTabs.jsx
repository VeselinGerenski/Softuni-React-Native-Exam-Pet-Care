import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PetsStack from "./PetsStack";
import ScheduleStack from "./ScheduleStack";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="PetsTab" component={PetsStack} options={{ headerShown: false, title: "Pets" }} />
      <Tab.Screen name="ScheduleTab" component={ScheduleStack} options={{ headerShown: false, title: "Schedule" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ headerShown: false, title: "Profile" }} />
    </Tab.Navigator>
  );
}
