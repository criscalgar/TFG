import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Asegúrate de tener esto instalado
import { login } from '../api/auth'; // Asegurándote de que login está bien configurado
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para guardar el token de usuario

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); // Para poder navegar entre pantallas

    const handleLogin = async () => {
        try {
            // Llama a la función de login y pasa el campo de "contraseña" al backend
            const response = await login(email, password); // El backend debe recibir los parámetros "email" y "contraseña"

            // Extraer el token y los datos del usuario desde la respuesta del backend
            const { token, user } = response;
            const role = user.tipo_usuario;

            // Si el login es exitoso, guarda el token y navega a la pantalla correspondiente
            await AsyncStorage.setItem('userToken', token); // Guardar el token para futuras solicitudes

            Alert.alert('Éxito', 'Inicio de sesión exitoso');
            
            // Redirigir a la pantalla correspondiente según el rol del usuario
            if (role === 'administrador') {
                navigation.navigate('Admin'); // Redirige al AdminScreen
            } else if (role === 'entrenador') {
                navigation.navigate('Trainer'); // Redirige al TrainerScreen
            } else {
                navigation.navigate('Client'); // Redirige al ClientScreen
            }

            // Limpiar los campos de entrada
            setEmail('');
            setPassword('');

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo iniciar sesión. Revisa tus credenciales.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Inicio de Sesión</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="Iniciar Sesión" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default LoginScreen;
