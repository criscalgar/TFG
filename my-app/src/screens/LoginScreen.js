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
import { Button as PaperButton, Card } from 'react-native-paper';

//Low gym: 37.3715531 -6.0447699,17.5
//Casa: 37.369986 -6.053663
//Facultad: 37.358195, -5.986797

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [loading, setLoading] = useState(false); // Nuevo estado para indicador de carga
    const navigation = useNavigation();


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



            await saveToken; // Esperar que se almacene el token

            navigation.replace('HomeScreen')


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
                        {/* Botón de Iniciar Sesión con el mismo estilo que "Añadir usuario" */}
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
    loginButton:{backgroundColor: 'blue'}
});

export default LoginScreen;
