import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

// Pantallas principales
import AdminScreen from '../screens/AdminScreen';
import TrainerScreen from '../screens/TrainerScreen';
import ClientScreen from '../screens/ClientScreen';

// Pantallas adicionales
import ManageUsersScreen from '../screens/Usuarios/ManageUsersScreen';
import ManageClassesScreen from '../screens/Clases/ManageClassesScreen';
import MisReservasScreen from '../screens/Reservas/ReservasIndividuales';
import ViewWorkers from '../screens/Trabajadores/ViewWorkers';
import RegisterUserScreen from '../screens/Usuarios/RegisterUserScreen';
import RegisterScreen from '../screens/Registros/RegisterScreen';
import RecordsScreen from '../screens/Registros/RecordsScreen';
import MonthSelectionScreen from '../screens/Registros/MonthSelectionScreen';
import EditUserScreen from '../screens/Usuarios/EditUserScreen';
import UserPaymentsScreen from '../screens/Usuarios/UserPaymentsScreen';
import SesionesScreen from '../screens/Sesiones/SesionesScreen';
import ReservasScreen from '../screens/Reservas/ReservasScreen';
import NotificacionesScreen from '../screens/Notificaciones/NotificacionesScreen';
import { API_URL } from '../config';  // Asegúrate de que la ruta es correcta


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 🔹 **Función para crear Stacks dentro de cada Tab** (mantiene la barra de navegación)
const createStack = (MainScreen, additionalScreens = {}) => {
    return () => (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainScreen} />
            {Object.entries(additionalScreens).map(([name, component]) => (
                <Stack.Screen key={name} name={name} component={component} />
                
            ))}
        </Stack.Navigator>
    );
};

const BottomTabNavigator = () => {
    const [userType, setUserType] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const getUserType = async () => {
            const userData = await AsyncStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            setUserType(user ? user.tipo_usuario : 'cliente');
        };
        getUserType();
        fetchUnreadNotifications();
    }, []);

    const fetchUnreadNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/private/notificaciones`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
        }
    };

    if (userType === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: 'gray',
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: 80,
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    elevation: 5,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                headerShown: false,
            }}
        >

            {userType === 'administrador' && (
                <>
                    <Tab.Screen
                        name="Inicio"
                        component={createStack(AdminScreen, {
                            ManageUsers: ManageUsersScreen,
                            Records: RecordsScreen,
                            UserPayments: UserPaymentsScreen,
                            Sesiones: SesionesScreen,
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Usuarios"
                        component={createStack(ManageUsersScreen, {
                            EditUser: EditUserScreen,
                            RegisterUser: RegisterUserScreen,
                            UserPayments: UserPaymentsScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Trabajadores"
                        component={createStack(ViewWorkers)}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="briefcase-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Nuevo Usuario"
                        component={RegisterUserScreen}  // 🔹 Nueva opción en la barra de navegación
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-add-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Clases"
                        component={createStack(ManageClassesScreen, {
                            Sesiones: SesionesScreen,
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={30} color={color} /> }}
                    />

                    <Tab.Screen
                        name="Registros"
                        component={createStack(RegisterScreen, {
                            MonthSelection: MonthSelectionScreen,
                            RecordsScreen: RecordsScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={30} color={color} /> }}
                    />
                </>
            )}

            {userType === 'entrenador' && (
                <>
                    <Tab.Screen
                        name="Inicio"
                        component={createStack(TrainerScreen, {
                            Sesiones: SesionesScreen,
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Usuarios"
                        component={createStack(ManageUsersScreen, {
                            EditUser: EditUserScreen,
                            RegisterUser: RegisterUserScreen,
                            UserPayments: UserPaymentsScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Clases"
                        component={createStack(ManageClassesScreen, {
                            Sesiones: SesionesScreen,
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={30} color={color} /> }}
                    />
                </>
            )}

            {userType === 'cliente' && (
                <>
                    <Tab.Screen
                        name="Inicio"
                        component={createStack(ClientScreen, {
                            Sesiones: SesionesScreen,
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Reservas"
                        component={createStack(MisReservasScreen, {
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Clases"
                        component={createStack(ManageClassesScreen, {
                            Sesiones: SesionesScreen,
                            Reservas: ReservasScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Trabajadores"
                        component={createStack(ViewWorkers)}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="briefcase-outline" size={30} color={color} /> }}
                    />
                </>
            )}
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
