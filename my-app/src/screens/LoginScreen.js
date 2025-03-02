import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ImageBackground,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Modal,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Low gym: 37.3715531 -6.0447699,17.5
//Casa: 37.369986 -6.053663
//Facultad: 37.358195, -5.986797

// Coordenadas del gimnasio
const GYM_COORDINATES = { latitude: 37.369986, longitude: -6.053663 };
const DISTANCE_THRESHOLD = 100;

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [loading, setLoading] = useState(false); // Nuevo estado para indicador de carga
    const navigation = useNavigation();

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Se requiere permiso de ubicación para iniciar sesión.');
        }
    };

    const getUserLocation = async () => {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 5000,
            timeout: 10000,
        });
        return location.coords;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
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

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor, ingresa tu email y contraseña.');
            return;
        }

        setLoading(true); // Mostrar indicador de carga
        try {
            const response = await login(email, password);
            const { token, user } = response;

            const saveToken = await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            if (user.tipo_usuario === 'entrenador' || user.tipo_usuario === 'administrador') {
                await requestLocationPermission();
                const { latitude, longitude } = await getUserLocation();
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    GYM_COORDINATES.latitude,
                    GYM_COORDINATES.longitude
                );

                if (distance > DISTANCE_THRESHOLD) {
                    throw new Error('No puedes iniciar sesión fuera del gimnasio.');
                }

                const now = new Date();
                if (now.getHours() > 7) {
                    setShowWarningModal(true);
                }
            }

            await saveToken; // Esperar que se almacene el token

            if (user.tipo_usuario === 'administrador') {
                navigation.replace('App');
            } else if (user.tipo_usuario === 'App') {
                navigation.replace('Trainer');
            } else {
                navigation.replace('App');
            }

            setEmail('');
            setPassword('');
        } catch (error) {
            setErrorMessage(error.message);
            setShowErrorModal(true);
        } finally {
            setLoading(false); // Ocultar indicador de carga
        }
    };

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>¡Bienvenido a GYM ETSII!</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        {loading ? (
                            <ActivityIndicator size="large" color="#007bff" />
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                <Text style={styles.buttonText}>Iniciar sesión</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* Modal de Error */}
                <Modal visible={showErrorModal} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>❌ Error</Text>
                            <Text style={styles.modalMessage}>{errorMessage}</Text>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: 'red' }]}
                                onPress={() => setShowErrorModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
        marginBottom: 50
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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

export default LoginScreen;
