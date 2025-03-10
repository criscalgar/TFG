import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LogoutButton({ navigation }) {
    const [loading, setLoading] = useState(false);

    const confirmLogout = () => {
        Alert.alert(
            "¿Has registrado la salida?",
            "Si no lo has hecho, cancela y regístrala antes de cerrar sesión.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Continuar",
                    onPress: handleLogout
                }
            ]
        );
    };

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // Eliminar el token de autenticación
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login'); // Redirigir a la pantalla de inicio de sesión
        } catch (error) {
            Alert.alert("Error", "No se pudo cerrar sesión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="logout" size={24} color="#fff" />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        backgroundColor: '#dc3545',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
});