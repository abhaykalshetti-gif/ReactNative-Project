import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AppointmentForm from "./AppoinmentForm";
import AdminDashboard from "./AdminDashboard";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true, // ✅ Show header
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === "Book Appointment") {
                iconName = focused ? "calendar" : "calendar-outline";
              } else if (route.name === "Admin Dashboard") {
                iconName = focused ? "list" : "list-outline";
              } else {
                iconName = "apps";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#1d4ed8",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen
            name="Book Appointment"
            component={AppointmentForm}
            options={{ headerTitle: "📅 Book Appointment" }}
          />
          <Tab.Screen
            name="Admin Dashboard"
            component={AdminDashboard}
            options={{ headerTitle: "📋 Admin Dashboard" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
