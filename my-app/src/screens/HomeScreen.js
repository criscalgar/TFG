import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para manejar el token

const HomeScreen = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            // Eliminar el token de AsyncStorage al cerrar sesión
            await AsyncStorage.removeItem('userToken');
            Alert.alert('Éxito', 'Has cerrado sesión correctamente');
            navigation.navigate('Login'); // Redirige al LoginScreen después de cerrar sesión
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido a la aplicación</Text>
            <Text style={styles.text}>¡Has iniciado sesión correctamente!</Text>
            <Button title="Cerrar sesión" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    text: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
});

export default HomeScreen;
