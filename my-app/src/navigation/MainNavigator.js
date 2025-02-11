import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/AdminScreen';
import ClientScreen from '../screens/ClientScreen';
import TrainerScreen from '../screens/TrainerScreen';
import ManageUsersScreen from '../screens/Usuarios/ManageUsersScreen';
import ManageClassesScreen from '../screens/Clases/ManageClassesScreen';
import EditUserScreen from '../screens/Usuarios/EditUserScreen';
import UserPaymentsScreen from '../screens/Usuarios/UserPaymentsScreen';
import RegisterUserScreen from '../screens/Usuarios/RegisterUserScreen';
import CrearClaseScreen from '../screens/Clases/CrearClaseScreen';
import SesionesScreen from '../screens/Sesiones/SesionesScreen';
import EditarSesionScreen from '../screens/Sesiones/EditarSesionScreen';
import ReservasScreen from '../screens/Reservas/ReservasScreen';
import CrearSesionScreen from '../screens/Sesiones/CrearSesionScreen';
import RegisterScreen from '../screens/Registros/RegisterScreen';
import MonthSelectionScreen from '../screens/Registros/MonthSelectionScreen';
import ViewWorkers from '../screens/Trabajadores/ViewWorkers';
import RecordsScreen from '../screens/Registros/RecordsScreen';
import MisReservasScreen from '../screens/Reservas/ReservasIndividuales';
import CustomHeader from '../components/Header';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={({ route }) => {
        // 🔹 Si estamos en LoginScreen, ocultamos el header completamente
        if (route.name === 'Login') return { headerShown: false };

        return {
          header: () => <CustomHeader />, // 🔹 No pasamos `showBackButton`, ya que la eliminamos
        };
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="Client" component={ClientScreen} />
      <Stack.Screen name="Trainer" component={TrainerScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="ManageClasses" component={ManageClassesScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="UserPayments" component={UserPaymentsScreen} />
      <Stack.Screen name="RegisterUser" component={RegisterUserScreen} />
      <Stack.Screen name="CrearClaseScreen" component={CrearClaseScreen} />
      <Stack.Screen name="SesionesScreen" component={SesionesScreen} />
      <Stack.Screen name="EditarSesionScreen" component={EditarSesionScreen} />
      <Stack.Screen name="ReservasScreen" component={ReservasScreen} />
      <Stack.Screen name="CrearSesionScreen" component={CrearSesionScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="MonthSelection" component={MonthSelectionScreen} />
      <Stack.Screen name="RecordsScreen" component={RecordsScreen} />
      <Stack.Screen name="ViewWorkers" component={ViewWorkers} />
      <Stack.Screen name="misReservas" component={MisReservasScreen} />
    </Stack.Navigator>
  );
}
