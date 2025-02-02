import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { API_URL } from '../config'; // Importar la URL de configuración

// Coordenadas del gimnasio
const GYM_COORDINATES = { latitude: 37.369986, longitude: -6.053663 }; // Cambia esto según la ubicación real
const DISTANCE_THRESHOLD = 100; // Distancia máxima permitida en metros

export default function AdminScreen({ navigation }) {
  // Función para solicitar permiso de ubicación
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Se requiere permiso de ubicación para cerrar sesión.');
    }
  };

  // Función para obtener la ubicación del usuario
  const getUserLocation = async () => {
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return location.coords;
  };

  // Función para calcular la distancia entre dos coordenadas
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await requestLocationPermission(); // Solicitar permiso de ubicación
      const { latitude, longitude } = await getUserLocation(); // Obtener ubicación del usuario
      const distance = calculateDistance(
        latitude,
        longitude,
        GYM_COORDINATES.latitude,
        GYM_COORDINATES.longitude
      );

      if (distance > DISTANCE_THRESHOLD) {
        Alert.alert('Error', 'Debes estar cerca del gimnasio para cerrar sesión.');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Registrar la hora de salida en el backend
        const response = await fetch(`${API_URL}/private/turnos/salida`, {
          method: 'PUT', // Método PUT para modificar la entrada
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo registrar la hora de salida.');
        }
      }

      // Eliminar el token almacenado y redirigir al inicio de sesión
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cerrar sesión. Inténtalo nuevamente.');
    }
  };

  useEffect(() => {
    // Configurar las opciones del encabezado
    navigation.setOptions({
      headerLeft: () => null, // Eliminar la flecha de navegación predeterminada
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerTitle: 'Admin', // Título de la barra
    });
  }, [navigation]);

  // Funciones de navegación
  const gestionarUsuarios = () => {
    navigation.navigate('ManageUsers');
  };

  const gestionarClases = () => {
    navigation.navigate('ManageClasses');
  };

  const registrarUsuario = () => {
    navigation.navigate('RegisterUser');
  };

  return (
    <ImageBackground
      source={require('../assets/fondoLogin.webp')} // Ruta de tu imagen
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Tarjeta: Gestionar Usuarios */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="account-group" size={50} color="#000" />
            <Title style={styles.cardTitle}>Gestionar Usuarios</Title>
            <Button
              mode="contained"
              style={styles.button}
              onPress={gestionarUsuarios}
            >
              Ir a Usuarios
            </Button>
          </Card.Content>
        </Card>

        {/* Tarjeta: Gestionar Clases */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="dumbbell" size={50} color="#000" />
            <Title style={styles.cardTitle}>Gestionar Clases</Title>
            <Button
              mode="contained"
              style={styles.button}
              onPress={gestionarClases}
            >
              Ir a Clases
            </Button>
          </Card.Content>
        </Card>

        {/* Tarjeta: Registrar Usuario */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="account-plus" size={50} color="#000" />
            <Title style={styles.cardTitle}>Registrar Usuario</Title>
            <Button
              mode="contained"
              style={styles.button}
              onPress={registrarUsuario}
            >
              Nuevo Usuario
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545', // Rojo para el botón de logout
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Separación del margen derecho
  },
  card: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center', // Centrar contenido de la tarjeta
    justifyContent: 'center',
    padding: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff', // Fondo azul para el botón
  },
});
