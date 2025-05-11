import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LogoutButton({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
        };
        fetchUser();
    }, []);

    const confirmLogout = () => {
        // Solo mostrar la alerta si el usuario es entrenador o administrador
        if (user?.tipo_usuario === 'administrador' || user?.tipo_usuario === 'entrenador') {
            Alert.alert(
                "¿Has registrado la salida?",
                "Si no lo has hecho, cancela y regístrala antes de cerrar sesión.",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Continuar", onPress: handleLogout }
                ]
            );
        } else {
            handleLogout(); // cerrar sesión directamente para otros roles
        }
    };

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
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