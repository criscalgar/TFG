import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';  // Asegúrate de que las rutas de las pantallas estén bien
import AdminScreen from '../screens/AdminScreen';
import ClientScreen from '../screens/ClientScreen';
import TrainerScreen from '../screens/TrainerScreen';
import ManageUsersScreen from '../screens/ManageUsersScreen';
import ManageClassesScreen from '../screens/ManageClassesScreen';
import EditUserScreen from '../screens/EditScreen';
import UserPaymentsScreen from '../screens/UserPaymentsScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="Client" component={ClientScreen} />
      <Stack.Screen name="Trainer" component={TrainerScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="ManageClasses" component={ManageClassesScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="UserPayments" component={UserPaymentsScreen} />
    </Stack.Navigator>
  );
}