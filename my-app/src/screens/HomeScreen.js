import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ImageBackground, ScrollView, Text, Linking, TouchableOpacity, Alert, ActivityIndicator, Modal
} from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { Button as PaperButton } from 'react-native-paper';

export default function HomeScreen({ navigation }) {

    const [userLocation, setUserLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isInsideGym, setIsInsideGym] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0); // Estado para recargar la pantalla

    // Ubicación del gimnasio
    const GYM_LOCATION = {
        latitude: 37.387743,
        longitude: -6.100419,
    };

    const DISTANCE_THRESHOLD = 100; // 100 metros

    useEffect(() => {
        getUserData();
        startLocationTracking();

        // Verificar cada 2 segundos si la ubicación está habilitada
        const locationCheckInterval = setInterval(async () => {
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (isEnabled !== locationEnabled) {
                setLocationEnabled(isEnabled);
                setRefreshKey((prevKey) => prevKey + 1); // Forzar recarga
            }
        }, 2000); // Intervalo de 2 segundos para detectar cambios en la ubicación

        return () => clearInterval(locationCheckInterval);
    }, [locationEnabled]); // Se ejecuta cuando cambia la disponibilidad de la ubicación

    // Obtener datos del usuario almacenados en AsyncStorage
    const getUserData = async () => {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    };


    // Iniciar seguimiento en tiempo real de la ubicación
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
                    timeInterval: 1000, // Actualizar cada 1 segundo
                    distanceInterval: 1, // Actualizar cada 1 metro
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
                    setErrorMsg(null); // Limpiar error si ya se tiene ubicación

                    // Verificar si está dentro del gimnasio
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


    // Calcular la distancia entre usuario y gimnasio
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

        return R * c;
    };


    // Verificar si se debe mostrar el botón de registrar entrada
    const canShowEntryButton = () => {
        if (!user || !userLocation || !locationEnabled) return false;
        return (user.tipo_usuario === 'entrenador' || user.tipo_usuario === 'administrador') && isInsideGym;
    };

    // Registrar la entrada del usuario
    const handleRegisterEntry = async () => {
        if (!userLocation) {
            Alert.alert('Ubicación no disponible', 'Activa la ubicación y vuelve a intentarlo.');
            return;
        }

        setLoading(true);
        try {
            const now = new Date();
            const horaActual = now.getHours();
            let isLate = false;

            if (horaActual >= 7) {
                setShowWarningModal(true);
                isLate = true;
            }

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No se encontró un token de usuario.');
                return;
            }

            const response = await axios.post(`${API_URL}/private/turnos/entrada`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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

    // 🔹 Nueva función para registrar la salida
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
                return;
            }

            // Enviar la solicitud para registrar la salida
            const response = await axios.put(`${API_URL}/private/turnos/salida`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

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

    // 🔹 Verificar si se debe mostrar el botón de salida (misma lógica de entrada)
    const canShowExitButton = () => {
        if (!user || !userLocation || !locationEnabled) return false;
        return (user.tipo_usuario === 'entrenador' || user.tipo_usuario === 'administrador') && isInsideGym;
    };


    // Abrir Google Maps con la ruta al gimnasio
    const openGoogleMaps = () => {
        if (!userLocation) {
            Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación actual.');
            return;
        }
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${GYM_LOCATION.latitude},${GYM_LOCATION.longitude}`;
        Linking.openURL(url);
    };

    // Horarios del gimnasio
    const gymHours = [
        { day: 'L - V', hours: '06:00 - 22:00', icon: 'clock-outline' },
        { day: 'S - D', hours: '08:00 - 20:00', icon: 'clock-outline' }
    ];

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {/* 🔹 Título Ubicación del gimnasio */}
                    <View style={styles.titleContainer}>
                        <Icon name="map-marker" size={34} color="#fff" />
                        <Text style={styles.title}>Ubicación del gimnasio</Text>
                    </View>
                    <View style={styles.underline} />

                    {/* 🔹 Mapa Interactivo */}
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

                    {/* 🔹 Ubicación y Dirección */}
                    <TouchableOpacity style={styles.locationCard} onPress={openGoogleMaps}>
                        <Icon name="map-marker" size={30} color="#fff" />
                        <Text style={styles.locationText}>Abrir en Google Maps</Text>
                    </TouchableOpacity>

                    {/* 🔹 Título Horario del gimnasio */}
                    <View style={styles.titleContainerGYM}>
                        <Icon name="clock-outline" size={34} color="#fff" />
                        <Text style={styles.title}>Horario del gimnasio</Text>
                    </View>
                    <View style={styles.underline} />

                    {/* 🔹 Horarios del gimnasio */}
                    {gymHours.map((item, index) => (
                        <View key={index} style={styles.hourCard}>
                            <Icon name={item.icon} size={22} color="#fff" style={styles.icon} />
                            <Text style={styles.hourText}>{item.day}: {item.hours}</Text>
                        </View>
                    ))}

                    {/* Modal de Advertencia */}
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
                    {/* 🔹 Contenedor de botones en paralelo */}
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
                                    {loading ? <ActivityIndicator color="#fff" /> : 'salida'}
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
        justifyContent: 'flex-start', // 👈 Asegura que el contenido no solape el navbar
        alignItems: 'center',
        paddingBottom: 60, // 👈 Espacio para la barra de navegación
    },
    scrollContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 80, // 👈 Espacio extra para que el contenido no lo tape el navbar
    },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    titleContainerGYM: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
    underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },
    /* 🔹 Estilo del mapa */
    mapCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden' },
    map: { width: '100%', height: '100%' },

    /* 🔹 Botón de Google Maps */
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
    /* 🔹 Tarjetas de horarios */
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
    buttonContainer: {
        flexDirection: 'row', // Alinea los botones en una fila
        justifyContent: 'space-between', // Espaciado uniforme entre ellos
        alignItems: 'center',
        width: '100%', // Asegura que ocupen el ancho suficiente
        marginTop: 10,
    },
    
    entryButton: {
        flex: 1, // Hace que los botones ocupen el mismo ancho
        backgroundColor: '#007bff',
        padding: 5,
        borderRadius: 8,
        marginRight: 10, // Espacio entre los botones
    },
    
    exitButton: {
        flex: 1, // Hace que los botones ocupen el mismo ancho
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 8,
        marginLeft: 10, // Espacio entre los botones
    },
    
    entryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
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
