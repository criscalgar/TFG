import React, { useState } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { API_URL } from '../config';

// Coordenadas del gimnasio
const GYM_COORDINATES = { latitude: 37.369986, longitude: -6.053663 };
const DISTANCE_THRESHOLD = 100;

export default function LogoutButton({ navigation }) {
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

    return (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="logout" size={24} color="#fff" />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        backgroundColor: '#dc3545',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
});
