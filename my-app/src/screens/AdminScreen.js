import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { API_URL } from '../config';

const GYM_COORDINATES = { latitude: 37.369986, longitude: -6.053663 };
const DISTANCE_THRESHOLD = 100;

export default function AdminScreen({ navigation }) {
    const [loading, setLoading] = useState(false);

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Se requiere permiso de ubicación para cerrar sesión.');
        }
    };

    const getUserLocation = async () => {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        return location.coords;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await requestLocationPermission();
            const { latitude, longitude } = await getUserLocation();
            const distance = calculateDistance(latitude, longitude, GYM_COORDINATES.latitude, GYM_COORDINATES.longitude);

            if (distance > DISTANCE_THRESHOLD) {
                throw new Error('Debes estar cerca del gimnasio para cerrar sesión.');
            }

            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const response = await fetch(`${API_URL}/private/turnos/salida`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error('No se pudo registrar la hora de salida.');
                }
            }

            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo cerrar sesión. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ No agregamos el CustomHeader aquí, ya que se maneja en `MainNavigator.js`

    const gestionarUsuarios = () => navigation.navigate('ManageUsers');
    const gestionarClases = () => navigation.navigate('ManageClasses');
    const registrarUsuario = () => navigation.navigate('RegisterUser');
    const gestionarRegistros = () => navigation.navigate('RegisterScreen');

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer} 
                    showsVerticalScrollIndicator={false} 
                    style={{ paddingTop: 70 }} 
                >
                    <View style={styles.cardWrapper}>
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <Icon name="account-group" size={50} color="#000" />
                                <Title style={styles.cardTitle}>Gestionar Usuarios</Title>
                                <Button mode="contained" style={styles.button} onPress={gestionarUsuarios}>
                                    Ir a Usuarios
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.cardWrapper}>
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <Icon name="dumbbell" size={50} color="#000" />
                                <Title style={styles.cardTitle}>Gestionar Clases</Title>
                                <Button mode="contained" style={styles.button} onPress={gestionarClases}>
                                    Ir a Clases
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.cardWrapper}>
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <Icon name="account-plus" size={50} color="#000" />
                                <Title style={styles.cardTitle}>Registrar Usuario</Title>
                                <Button mode="contained" style={styles.button} onPress={registrarUsuario}>
                                    Nuevo Usuario
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.cardWrapper}>
                        <Card style={styles.card}>
                            <Card.Content style={styles.cardContent}>
                                <Icon name="file-document" size={50} color="#000" />
                                <Title style={styles.cardTitle}>Gestionar Registros</Title>
                                <Button mode="contained" style={styles.button} onPress={gestionarRegistros}>
                                    Ver Registros
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>

                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    cardWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    card: {
        width: 270,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        height: 210,
    },
    cardContent: { alignItems: 'center', justifyContent: 'center', padding: 15 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 10, marginTop: 30 },
    button: { marginTop: 10, backgroundColor: '#007bff' },
});

