import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from '../components/bottomTabNavigator';
import CustomHeader from '../components/Header';
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
import NotificacionesScreen from '../screens/Notificaciones/NotificacionesScreen';
import HomeScreen from '../screens/HomeScreen';
import SimulatedPaymentScreen from '../screens/Pagos/SimulatedPaymentScreen';
import PaymentLoginScreen from '../screens/Pagos/PaymentLoginScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const getUserType = async () => {
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      setInitialRoute(user ? 'Login' : 'Login');
    };
    getUserType();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => {
        if (route.name === 'Login' || route.name === 'PaymentLoginScreen') return { headerShown: false };
        return {
          header: () => <CustomHeader />,
        };
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="App" component={BottomTabNavigator} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="ManageClasses" component={ManageClassesScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="UserPayments" component={UserPaymentsScreen} />
      <Stack.Screen name="SimulatedPayment" component={SimulatedPaymentScreen} />
      <Stack.Screen name="PaymentLoginScreen" component={PaymentLoginScreen} />
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
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
  );
}