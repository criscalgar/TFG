import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ImageBackground, ScrollView, Text, Linking, TouchableOpacity, Alert, ActivityIndicator, Modal
} from 'react-native';
import { Card, Button as PaperButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import moment from 'moment-timezone';

export default function HomeScreen({ navigation }) {

    const [userLocation, setUserLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isInsideGym, setIsInsideGym] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Ubicacion etsii: 37.358254, -5.987093
    const GYM_LOCATION = {
        latitude: 37.358414,
        longitude: -5.987533,
    };

    const DISTANCE_THRESHOLD = 100; // metros

    useEffect(() => {
        getUserData();
        startLocationTracking();

        const locationCheckInterval = setInterval(async () => {
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (isEnabled !== locationEnabled) {
                setLocationEnabled(isEnabled);
                setRefreshKey(prev => prev + 1);
            }
        }, 2000);

        return () => clearInterval(locationCheckInterval);
    }, [locationEnabled]);

    const getUserData = async () => {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    };

    const startLocationTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('⚠️ Activa la ubicación para ver tu posición respecto al gimnasio.');
                setLocationEnabled(false);
                return;
            }

            setLocationEnabled(await Location.hasServicesEnabledAsync());

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                async (location) => {
                    const isEnabled = await Location.hasServicesEnabledAsync();
                    setLocationEnabled(isEnabled);

                    if (!isEnabled) {
                        setUserLocation(null);
                        setIsInsideGym(false);
                        return;
                    }

                    const newLocation = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    setUserLocation(newLocation);
                    setErrorMsg(null);

                    const distance = calculateDistance(
                        newLocation.latitude, newLocation.longitude,
                        GYM_LOCATION.latitude, GYM_LOCATION.longitude
                    );

                    setIsInsideGym(distance <= DISTANCE_THRESHOLD);
                }
            );
        } catch (error) {
            setErrorMsg('No se pudo obtener la ubicación.');
            setLocationEnabled(false);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const canShowEntryButton = () => {
        if (!user || !userLocation || !locationEnabled) return false;
        return (user.tipo_usuario === 'entrenador' || user.tipo_usuario === 'administrador') && isInsideGym;
    };

    const canShowExitButton = () => {
        if (!user || !userLocation || !locationEnabled) return false;
        return (user.tipo_usuario === 'entrenador' || user.tipo_usuario === 'administrador') && isInsideGym;
    };

    const handleRegisterEntry = async () => {
        if (!userLocation) {
            Alert.alert('Ubicación no disponible', 'Activa la ubicación y vuelve a intentarlo.');
            return;
        }

        setLoading(true);
        try {
            const now = new Date();
            const horaActual = now.getHours();
            if (horaActual >= 7) {
                setShowWarningModal(true);
            }

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No se encontró un token de usuario.');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `${API_URL}/private/turnos/entrada`,
                {
                    lat: userLocation.latitude,
                    lon: userLocation.longitude,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                Alert.alert('Registro exitoso', 'Tu entrada ha sido registrada correctamente.');
            } else {
                Alert.alert('Error', 'No se pudo registrar tu entrada.');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al registrar la entrada';
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterExit = async () => {
        if (!userLocation) {
            Alert.alert('Ubicación no disponible', 'Activa la ubicación y vuelve a intentarlo.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No se encontró un token de usuario.');
                setLoading(false);
                return;
            }

            const response = await axios.put(
                `${API_URL}/private/turnos/salida`,
                {
                    lat: userLocation.latitude,
                    lon: userLocation.longitude,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                Alert.alert('Registro exitoso', 'Tu salida ha sido registrada correctamente.');
            } else {
                Alert.alert('Error', 'No se pudo registrar tu salida.');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al registrar la salida';
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const openGoogleMaps = () => {
        if (!userLocation) {
            Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación actual.');
            return;
        }
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${GYM_LOCATION.latitude},${GYM_LOCATION.longitude}`;
        Linking.openURL(url);
    };

    const gymHours = [
        { day: 'L - V', hours: '06:00 - 22:00', icon: 'clock-outline' },
        { day: 'S - D', hours: '08:00 - 20:00', icon: 'clock-outline' }
    ];

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    <View style={styles.titleContainer}>
                        <Icon name="map-marker" size={34} color="#fff" />
                        <Text style={styles.title}>Ubicación del gimnasio</Text>
                    </View>
                    <View style={styles.underline} />

                    <Card style={styles.mapCard}>
                        <Card.Content style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: GYM_LOCATION.latitude,
                                    longitude: GYM_LOCATION.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                showsUserLocation={true}>
                                <Marker coordinate={GYM_LOCATION} title="Gimnasio" pinColor='red' />
                            </MapView>
                        </Card.Content>
                    </Card>

                    <TouchableOpacity style={styles.locationCard} onPress={openGoogleMaps}>
                        <Icon name="map-marker" size={30} color="#fff" />
                        <Text style={styles.locationText}>Abrir en Google Maps</Text>
                    </TouchableOpacity>

                    <View style={styles.titleContainerGYM}>
                        <Icon name="clock-outline" size={34} color="#fff" />
                        <Text style={styles.title}>Horario del gimnasio</Text>
                    </View>
                    <View style={styles.underline} />

                    {gymHours.map((item, index) => (
                        <View key={index} style={styles.hourCard}>
                            <Icon name={item.icon} size={22} color="#fff" style={styles.icon} />
                            <Text style={styles.hourText}>{item.day}: {item.hours}</Text>
                        </View>
                    ))}

                    <Modal visible={showWarningModal} transparent animationType="fade">
                        <View style={styles.modalBackground}>
                            <View style={[styles.modalContainer, { borderColor: 'orange', borderWidth: 2 }]}>
                                <Text style={[styles.modalTitle, { color: 'orange' }]}>⚠ Advertencia</Text>
                                <Text style={styles.modalMessage}>Has entrado tarde al turno.</Text>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: 'orange' }]}
                                    onPress={() => setShowWarningModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>Aceptar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {(canShowEntryButton() || canShowExitButton()) && (
                        <View style={styles.buttonContainer}>
                            {canShowEntryButton() && (
                                <PaperButton
                                    mode="contained"
                                    onPress={handleRegisterEntry}
                                    style={styles.entryButton}
                                    labelStyle={styles.buttonText}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : 'Entrada'}
                                </PaperButton>
                            )}
                            {canShowExitButton() && (
                                <PaperButton
                                    mode="contained"
                                    onPress={handleRegisterExit}
                                    style={styles.exitButton}
                                    labelStyle={styles.buttonText}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : 'Salida'}
                                </PaperButton>
                            )}
                        </View>
                    )}

                    <View style={styles.spacing} />
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 60,
    },
    scrollContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 80,
    },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    titleContainerGYM: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
    underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },
    mapCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden' },
    map: { width: '100%', height: '100%' },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    locationText: { color: '#fff', fontSize: 16, marginLeft: 10 },
    spacing: { height: 50 },
    hourCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        width: '90%',
    },
    icon: { marginRight: 10 },
    hourText: { color: '#fff', fontSize: 16 },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    entryButton: {
        flex: 1,
        backgroundColor: '#007bff',
        padding: 5,
        borderRadius: 8,
        marginRight: 10,
    },
    exitButton: {
        flex: 1,
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 8,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 10,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
