import React, { useState } from 'react'; 
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { login } from '../api/auth'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation(); 

    const handleLogin = async () => {
        try {
            // Llama a la función de login y pasa el campo de "contraseña" al backend
            const response = await login(email, password); // El backend debe recibir los parámetros "email" y "contraseña"

            console.log('Respuesta del backend:', response);  // Verificar toda la respuesta
            if (user && user.id_membresia) {
                console.log('ID de Membresía recibido:', user.id_membresia);
            } else {
                console.log('No se recibió el ID de Membresía');
            }
            
            // Extraer el token y los datos del usuario desde la respuesta del backend
            const { token, user } = response;
            const role = user.tipo_usuario;
            const membresia = user.id_membresia;  // Guardas el id_membresia en la variable membresia
            await AsyncStorage.setItem('userMembresia', `${membresia}`); // Almacenarlo directamente como string

            
            // Si el login es exitoso, guarda el token y el userId para futuras solicitudes
            await AsyncStorage.setItem('userToken', token); // Guardar el token

            Alert.alert('Éxito', 'Inicio de sesión exitoso');
            
            // Redirigir a la pantalla correspondiente según el rol del usuario
            if (role === 'administrador') {
                navigation.navigate('Admin'); 
            } else if (role === 'entrenador') {
                navigation.navigate('Trainer');
            } else {
                navigation.navigate('Client');
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
