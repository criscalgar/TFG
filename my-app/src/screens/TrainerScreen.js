import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import * as Location from 'expo-location';
import { API_URL } from '../config';

// Coordenadas del gimnasio
const GYM_COORDINATES = { latitude: 37.369986, longitude: -6.053663 }; // Cambiar según la ubicación real
const DISTANCE_THRESHOLD = 100; // Distancia máxima permitida en metros

const TrainerScreen = ({ navigation }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [token, setToken] = useState(null);

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Se requiere permiso de ubicación para cerrar sesión.');
        }
    };

    const getUserLocation = async () => {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        return location.coords;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Radio de la Tierra en metros
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distancia en metros
    };

    const handleLogout = async () => {
        try {
            await requestLocationPermission(); // Solicitar permisos de ubicación
            const { latitude, longitude } = await getUserLocation(); // Obtener ubicación del usuario
            const distance = calculateDistance(
                latitude,
                longitude,
                GYM_COORDINATES.latitude,
                GYM_COORDINATES.longitude
            );

            if (distance > DISTANCE_THRESHOLD) {
                Alert.alert('Error', 'Debes estar cerca del gimnasio para cerrar sesión.');
                return;
            }

            if (token) {
                // Registrar hora de salida en el backend
                const response = await axios.put(
                    `${API_URL}/private/turnos/salida`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    Alert.alert('Éxito', 'Sesión cerrada y hora de salida registrada.');
                }
            }

            // Eliminar token y redirigir al inicio de sesión
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo cerrar sesión. Inténtalo nuevamente.');
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => null, // Eliminar la flecha de navegación
            headerRight: () => (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={24} color="#fff" />
                </TouchableOpacity>
            ),
            headerTitle: 'Entrenador',
        });
    }, [navigation]);

    useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await AsyncStorage.getItem('userToken');
            setToken(storedToken);
        };

        fetchToken();
    }, []);

    useEffect(() => {
        if (token) {
            axios
                .get(`${API_URL}/private/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => setUsuarios(response.data))
                .catch(() => Alert.alert('Error', 'No se pudo cargar la lista de usuarios.'));
        }
    }, [token]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel del Entrenador</Text>

            <Text style={styles.subtitle}>Usuarios:</Text>
            <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id_usuario.toString()}
                renderItem={({ item }) => (
                    <Text>
                        {item.nombre} {item.apellido}
                    </Text>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 18, marginTop: 20 },
    logoutButton: {
        backgroundColor: '#dc3545', // Rojo para el botón de logout
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
});

export default TrainerScreen;
