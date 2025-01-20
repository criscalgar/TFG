import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Asegúrate de tener esto instalado
import { login } from '../api/auth'; // Asumiendo que login está en auth.js

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Aquí seguimos usando "password", pero lo mapeamos a "contraseña"
    const navigation = useNavigation(); // Para poder navegar entre pantallas

    const handleLogin = async () => {
        try {
            // Llama a la función de login y pasa el campo de "contraseña" al backend
            const response = await login(email, password); // "password" será mapeado a "contraseña" en la función login

            // Si el login es exitoso, navega a la pantalla de inicio
            Alert.alert('Éxito', 'Inicio de sesión exitoso');
            navigation.navigate('Home'); // Redirige al HomeScreen (ajusta según tu flujo)

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
