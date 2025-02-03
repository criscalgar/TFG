import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { API_URL } from '../config'; // Importar la URL de configuración

// 📌 Coordenadas del gimnasio
const GYM_COORDINATES = { latitude: 37.369986, longitude: -6.053663 };
const DISTANCE_THRESHOLD = 100; // Distancia máxima permitida en metros

export default function AdminScreen({ navigation }) {
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  // ✅ Solicitar permiso de ubicación
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Se requiere permiso de ubicación para cerrar sesión.');
    }
  };

  // ✅ Obtener ubicación
  const getUserLocation = async () => {
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return location.coords;
  };

  // ✅ Calcular distancia con menor latencia
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ✅ Cerrar sesión
  const handleLogout = async () => {
    if (loading) return; // Evitar múltiples clics
    setLoading(true);

    try {
      await requestLocationPermission(); // Solicitar permisos
      const { latitude, longitude } = await getUserLocation(); // Obtener ubicación
      const distance = calculateDistance(latitude, longitude, GYM_COORDINATES.latitude, GYM_COORDINATES.longitude);

      if (distance > DISTANCE_THRESHOLD) {
        throw new Error('Debes estar cerca del gimnasio para cerrar sesión.');
      }

      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // ✅ Registrar la hora de salida en el backend
        const response = await fetch(`${API_URL}/private/turnos/salida`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('No se pudo registrar la hora de salida.');
        }
      }

      // ✅ Eliminar token y redirigir al login
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cerrar sesión. Inténtalo nuevamente.');
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  useEffect(() => {
    // Configurar las opciones del encabezado
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="logout" size={24} color="#fff" />}
        </TouchableOpacity>
      ),
      headerTitle: 'Admin',
    });
  }, [navigation, loading]);

  return (
    <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Tarjeta: Gestionar Usuarios */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="account-group" size={50} color="#000" />
            <Title style={styles.cardTitle}>Gestionar Usuarios</Title>
            <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('ManageUsers')}>
              Ir a Usuarios
            </Button>
          </Card.Content>
        </Card>

        {/* Tarjeta: Gestionar Clases */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="dumbbell" size={50} color="#000" />
            <Title style={styles.cardTitle}>Gestionar Clases</Title>
            <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('ManageClasses')}>
              Ir a Clases
            </Button>
          </Card.Content>
        </Card>

        {/* Tarjeta: Registrar Usuario */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="account-plus" size={50} color="#000" />
            <Title style={styles.cardTitle}>Registrar Usuario</Title>
            <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('RegisterUser')}>
              Nuevo Usuario
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  card: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  cardContent: { alignItems: 'center', justifyContent: 'center', padding: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 10 },
  button: { marginTop: 10, backgroundColor: '#007bff' },
});
