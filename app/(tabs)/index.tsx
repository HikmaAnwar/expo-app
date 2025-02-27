import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ColorGuessingGame from "@/components/ColorGuessingGame";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={ColorGuessingGame} />
    </Stack.Navigator>
  );
}
