import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';  // Asegúrate de que las rutas de las pantallas estén bien
import AdminScreen from '../screens/AdminScreen';
import ClientScreen from '../screens/ClientScreen';
import TrainerScreen from '../screens/TrainerScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="Client" component={ClientScreen} />
      <Stack.Screen name="Trainer" component={TrainerScreen} />
    </Stack.Navigator>
  );
}