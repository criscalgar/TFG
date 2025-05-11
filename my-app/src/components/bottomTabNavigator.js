import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';


// Pantallas adicionales
import ManageUsersScreen from '../screens/Usuarios/ManageUsersScreen';
import ManageClassesScreen from '../screens/Clases/ManageClassesScreen';
import CrearClaseScreen from '../screens/Clases/CrearClaseScreen';
import MisReservasScreen from '../screens/Reservas/ReservasIndividuales';
import ViewWorkers from '../screens/Trabajadores/ViewWorkers';
import RegisterUserScreen from '../screens/Usuarios/RegisterUserScreen';
import RegisterScreen from '../screens/Registros/RegisterScreen';
import RecordsScreen from '../screens/Registros/RecordsScreen';
import MonthSelectionScreen from '../screens/Registros/MonthSelectionScreen';
import EditUserScreen from '../screens/Usuarios/EditUserScreen';
import UserPaymentsScreen from '../screens/Usuarios/UserPaymentsScreen';
import SesionesScreen from '../screens/Sesiones/SesionesScreen';
import CrearSesionScreen from '../screens/Sesiones/CrearSesionScreen';
import EditarSesionScreen from '../screens/Sesiones/EditarSesionScreen';
import ReservasScreen from '../screens/Reservas/ReservasScreen';
import HorariosLaboralesScreen from '../screens/Horarios/HorarioLaboral';
import nuevoHorarioScreen from '../screens/Horarios/nuevoHorarioScreen';
import ChatGrupalScreen from '../screens/ChatGrupalScreen';
import HomeScreen from '../screens/HomeScreen';
import PerfilScreen from '../screens/PerfilScreen';
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
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserType = async () => {
            const userData = await AsyncStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            setUserType(user ? user.tipo_usuario : 'cliente');
            setUserId(user.id_usuario);
            fetchUnreadMessages(user.id_usuario);
        };

        getUserType();
        fetchUnreadNotifications();

        // 🔹 Iniciar la actualización de mensajes no leídos si NO estás en el chat
        const interval = setInterval(() => {
            if (!isChatOpen) {
                fetchUnreadMessages(userId);
            }
        }, 1000);

        return () => clearInterval(interval); // 🔹 Limpia el intervalo al desmontar el componente
    }, [userId, isChatOpen]);


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

    const fetchUnreadMessages = async (id_usuario) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await axios.get(`${API_URL}/private/mensajes-no-leidos/${id_usuario}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUnreadMessages(response.data.unreadCount);
        } catch (error) {
            console.error('Error obteniendo mensajes no leídos:', error);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token || !userId) return;

            await axios.post(`${API_URL}/private/marcar-mensajes-leidos`, // 🔹 Verifica la ruta aquí
                { id_usuario: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUnreadMessages(0); // 🔹 Elimina el contador de mensajes no leídos
        } catch (error) {
            console.error('Error al marcar los mensajes como leídos:', error);
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
                        name="HomeScreen"
                        component={HomeScreen}
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
                            CrearClase: CrearClaseScreen,
                            Sesiones: SesionesScreen,
                            CrearSesion: CrearSesionScreen,
                            EditSesion: EditarSesionScreen,
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
                    <Tab.Screen
                        name="HorarioLaboral"
                        component={createStack(HorariosLaboralesScreen, {
                            nuevoHorario: nuevoHorarioScreen
                        })}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={ChatGrupalScreen}
                        listeners={({ navigation }) => ({
                            tabPress: async (e) => {
                                e.preventDefault(); // 🔹 Evita la navegación automática por defecto
                                setIsChatOpen(true); // 🔹 Indica que el usuario está en el chat
                                navigation.navigate("Chat"); // 🔹 Navega inmediatamente al chat

                                if (unreadMessages > 0) { // 🔹 Si hay mensajes sin leer, los marca en segundo plano
                                    markMessagesAsRead();
                                }
                            }
                        })}
                        options={{
                            tabBarIcon: ({ color }) => (
                                <View>
                                    <Ionicons name="chatbubble-ellipses-outline" size={30} color={color} />
                                    {unreadMessages > 0 && (
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{unreadMessages}</Text>
                                        </View>
                                    )}
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="PerfilScreen"
                        component={PerfilScreen}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={30} color={color} /> }}
                    />
                </>
            )}

            {userType === 'entrenador' && (
                <>
                    <Tab.Screen
                        name="HomeScreen"
                        component={HomeScreen}
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
                            Reservas: ReservasScreen,
                        })}
                        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={ChatGrupalScreen}
                        listeners={({ navigation }) => ({
                            tabPress: async (e) => {
                                e.preventDefault(); // 🔹 Evita la navegación automática por defecto
                                setIsChatOpen(true); // 🔹 Indica que el usuario está en el chat
                                navigation.navigate("Chat"); // 🔹 Navega inmediatamente al chat

                                if (unreadMessages > 0) { // 🔹 Si hay mensajes sin leer, los marca en segundo plano
                                    markMessagesAsRead();
                                }
                            }
                        })}
                        options={{
                            tabBarIcon: ({ color }) => (
                                <View>
                                    <Ionicons name="chatbubble-ellipses-outline" size={30} color={color} />
                                    {unreadMessages > 0 && (
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{unreadMessages}</Text>
                                        </View>
                                    )}
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="PerfilScreen"
                        component={PerfilScreen}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={30} color={color} /> }}
                    />
                </>
            )}

            {userType === 'cliente' && (
                <>
                    <Tab.Screen
                        name="HomeScreen"
                        component={HomeScreen}
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
                            Reservas: ReservasScreen,
                        })}
                        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Trabajadores"
                        component={createStack(ViewWorkers)}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="briefcase-outline" size={30} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={ChatGrupalScreen}
                        listeners={({ navigation }) => ({
                            tabPress: async (e) => {
                                e.preventDefault(); // 🔹 Evita la navegación automática por defecto
                                setIsChatOpen(true); // 🔹 Indica que el usuario está en el chat
                                navigation.navigate("Chat"); // 🔹 Navega inmediatamente al chat

                                if (unreadMessages > 0) { // 🔹 Si hay mensajes sin leer, los marca en segundo plano
                                    markMessagesAsRead();
                                }
                            }
                        })}
                        options={{
                            tabBarIcon: ({ color }) => (
                                <View>
                                    <Ionicons name="chatbubble-ellipses-outline" size={30} color={color} />
                                    {unreadMessages > 0 && (
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{unreadMessages}</Text>
                                        </View>
                                    )}
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="PerfilScreen"
                        component={PerfilScreen}
                        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={30} color={color} /> }}
                    />
                </>
            )}
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    badgeContainer: {
        position: 'absolute',
        right: -6,  // Ajusta la posición del globito
        top: -3,    // Ajusta la posición del globito
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});


export default BottomTabNavigator;
