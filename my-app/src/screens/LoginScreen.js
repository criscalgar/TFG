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
    Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showLateModal, setShowLateModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const response = await login(email, password);
            const { token, user, tardanza } = response;

            await AsyncStorage.setItem('userToken', token);

            // Si el usuario es administrador o entrenador y llegó tarde, mostrar modal de advertencia
            if (tardanza) {
                setShowLateModal(true);
            }

            // Navegación según el rol
            if (user.tipo_usuario === 'administrador') {
                navigation.navigate('Admin');
            } else if (user.tipo_usuario === 'entrenador') {
                navigation.navigate('Trainer');
            } else {
                navigation.navigate('Client');
            }

            setEmail('');
            setPassword('');
        } catch (error) {
            setErrorMessage(error.message);
            setShowErrorModal(true);
        }
    };

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Inicio de Sesión</Text>
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
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de advertencia (entrada tardía) */}
            <Modal visible={showLateModal} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={[styles.modalContainer, styles.warningModal]}>
                        <Text style={[styles.modalTitle, styles.warningTitle]}>⚠️ Advertencia</Text>
                        <Text style={styles.modalMessage}>Has ingresado tarde al trabajo.</Text>
                        <TouchableOpacity style={[styles.modalButton, styles.warningButton]} onPress={() => setShowLateModal(false)}>
                            <Text style={styles.modalButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de error (credenciales incorrectas o pago no realizado) */}
            <Modal visible={showErrorModal} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={[styles.modalContainer, styles.errorModal]}>
                        <Text style={[styles.modalTitle, styles.errorTitle]}>❌ Error</Text>
                        <Text style={styles.modalMessage}>{errorMessage}</Text>
                        <TouchableOpacity style={[styles.modalButton, styles.errorButton]} onPress={() => setShowErrorModal(false)}>
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    /* MODALES */
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
    /* Estilos específicos de cada modal */
    errorModal: {
        borderColor: '#dc3545',
        borderWidth: 2,
    },
    errorTitle: {
        color: '#dc3545',
    },
    errorButton: {
        backgroundColor: '#dc3545', // Botón rojo para errores
    },
    warningModal: {
        borderColor: '#FFA500',
        borderWidth: 2,
    },
    warningTitle: {
        color: '#FFA500',
    },
    warningButton: {
        backgroundColor: '#FFA500', // Botón naranja para advertencia
    },
});

export default LoginScreen;
