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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const response = await login(email, password);
            const { token, user } = response;

            await AsyncStorage.setItem('userToken', token);

            if (user && user.id_membresia) {
                await AsyncStorage.setItem('userMembresia', `${user.id_membresia}`);
            }

            const role = user.tipo_usuario;
            if (role === 'administrador') {
                navigation.navigate('Admin');
            } else if (role === 'entrenador') {
                navigation.navigate('Trainer');
            } else {
                navigation.navigate('Client');
            }

            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            Alert.alert('Error', 'No se pudo iniciar sesión. Revisa tus credenciales.');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/fondoLogin.webp')} // Ruta de tu imagen
            style={styles.background}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={80} // Ajusta este valor según el diseño
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
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
        width: '90%', // Reduce el ancho para dejar espacio a los lados
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff', // Fondo blanco para el cuadro del formulario
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center', // Centra los elementos dentro del contenedor
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%', // Asegura que los inputs se ajusten al ancho del contenedor
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007bff', // Botón azul
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%', // Ancho completo del botón
    },
    buttonText: {
        color: '#fff', // Texto blanco
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default LoginScreen;

