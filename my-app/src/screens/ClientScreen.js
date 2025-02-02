import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Para el ícono del botón de logout

export default function ClientScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Eliminar el token
      navigation.replace('Login'); // Redirigir a la pantalla de inicio de sesión
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo nuevamente.');
    }
  };

  useEffect(() => {
    // Configurar las opciones del encabezado
    navigation.setOptions({
      headerLeft: () => null, // Eliminar la flecha de navegación
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerTitle: 'Cliente', // Título de la barra
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, Cliente</Text>
      <Text>Información sobre tus reservas y clases.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
});
