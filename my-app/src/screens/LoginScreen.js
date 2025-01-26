import React, { useState } from 'react'; 
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { login } from '../api/auth'; // Importa la función de autenticación desde tu API
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); 

    const handleLogin = async () => {
        try {
            // Llama a la API de login y obtiene la respuesta
            const response = await login(email, password);

            console.log('Respuesta completa del backend:', response);

            // Extrae token y usuario de la respuesta
            const { token, user } = response;

            if (user && user.id_membresia) {
                console.log('ID de Membresía recibido:', user.id_membresia);

                // Guarda el ID de membresía en AsyncStorage
                await AsyncStorage.setItem('userMembresia', `${user.id_membresia}`);
                console.log('ID de Membresía guardado en AsyncStorage');
            } else {
                console.error('No se recibió el ID de Membresía');
            }

            // Guarda el token en AsyncStorage
            await AsyncStorage.setItem('userToken', token);
            console.log('Token guardado en AsyncStorage');

            // Muestra una alerta de éxito
            Alert.alert('Éxito', 'Inicio de sesión exitoso');

            // Redirige a la pantalla correspondiente según el rol del usuario
            const role = user.tipo_usuario;
            if (role === 'administrador') {
                navigation.navigate('Admin'); 
            } else if (role === 'entrenador') {
                navigation.navigate('Trainer');
            } else {
                navigation.navigate('Client');
            }

            // Limpia los campos de entrada
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
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
                keyboardType="email-address"
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
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: 'center' 
    },
    title: { 
        fontSize: 24, 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        padding: 10, 
        marginBottom: 10 
    },
});

export default LoginScreen;
