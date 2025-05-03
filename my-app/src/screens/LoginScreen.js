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

import { useNavigation } from '@react-navigation/native';
import { login } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button as PaperButton } from 'react-native-paper';
import axios from 'axios';  // Asegúrate de que axios esté importado correctamente.
import { API_URL } from '../config';
//Low gym: 37.3715531 -6.0447699,17.5
//Casa: 37.369986 -6.053663
//Facultad: 37.358195, -5.986797
const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); // Definir el estado para el usuario
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor, ingresa tu email y contraseña.');
            return;
        }

        setLoading(true);  // Mostrar indicador de carga
        try {
            const response = await login(email, password);
            const { token, user } = response;

            setUser(user); // Guardar el usuario en el estado

            const saveToken = await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            await saveToken; // Esperar que se almacene el token

            navigation.replace('App');  // Redirigir al home después del login exitoso

            setEmail('');
            setPassword('');
        } catch (error) {
            setErrorMessage(error.message);
            if (error.message === "No tienes la cuota al día. Por favor, realiza tu pago en recepción.") {
                // Solo proceder si la cuota no está al día, y hacer la solicitud del usuario
                try {
                    const response = await axios.get(`${API_URL}/private/usuario/${email}`);
                    const user = response.data;  // Obtención de datos del usuario
                    

                    // Mostrar el mensaje de alerta con la opción de proceder al pago
                    Alert.alert(
                        'Cuota no pagada',
                        'Tu cuota no está al día. ¿Deseas proceder al pago?',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Proceder al pago',
                                onPress: () => {
                                    if (user) {
                                        navigation.navigate('PaymentLoginScreen', {
                                            user: user,  // Pasamos los datos del usuario a PaymentLoginScreen
                                            onPaymentSuccess: async () => {
                                                await handleLogin();  // Vuelve a verificar después del pago
                                            },
                                        });
                                    } else {
                                        console.log('No se puede proceder con el pago, usuario no válido');
                                    }
                                },
                            },
                        ]
                    );
                } catch (err) {
                    console.log("Error al obtener el usuario:", err);
                    setShowErrorModal(true);
                }
            } else {
                setShowErrorModal(true); // Mostrar modal de error si el login tiene otro tipo de error
            }
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
                        <PaperButton
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            labelStyle={styles.buttonText}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : 'Iniciar sesión'}
                        </PaperButton>
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
    loginButton: { backgroundColor: 'blue' }
});

export default LoginScreen;
