import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Asegúrate de tener esto instalado
import { login } from '../api/auth'; // Asumiendo que login está en auth.js
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para guardar el token de usuario

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); // Para poder navegar entre pantallas

    const handleLogin = async () => {
        try {
            // Llama a la función de login y recibe los datos de usuario
            const response = await login(email, password);
            const { token, role } = response; // Asume que la respuesta contiene un token y un rol

            // Guarda el token de usuario si es necesario (puedes usarlo en otras pantallas)
            await AsyncStorage.setItem('userToken', token);

            // Redirige según el rol del usuario
            if (role === 'admin') {
                navigation.navigate('Admin'); // Redirige al AdminScreen
            } else if (role === 'trainer') {
                navigation.navigate('Trainer'); // Redirige al TrainerScreen
            } else {
                navigation.navigate('Client'); // Redirige al ClientScreen
            }
            Alert.alert('Éxito', 'Inicio de sesión exitoso');
        } catch (error) {
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
