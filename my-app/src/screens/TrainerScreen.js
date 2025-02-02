import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const TrainerScreen = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [token, setToken] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Eliminar el token
      navigation.replace('Login'); // Redirigir a la pantalla de inicio de sesión
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo nuevamente.');
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Eliminar la flecha de navegación
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerTitle: 'Entrenador',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:3000/private/usuarios', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUsuarios(response.data))
        .catch(() => Alert.alert('Error', 'No se pudo cargar la lista de usuarios.'));
    }
  }, [token]);

  const registrarAsistencia = (tipo) => {
    if (token) {
      axios
        .post(
          `http://localhost:3000/private/turnos/${tipo}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => Alert.alert('Éxito', `Asistencia ${tipo} registrada`))
        .catch(() => Alert.alert('Error', `No se pudo registrar la asistencia de ${tipo}`));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Entrenador</Text>

      <Button title="Registrar Entrada" onPress={() => registrarAsistencia('entrada')} />
      <Button title="Registrar Salida" onPress={() => registrarAsistencia('salida')} />

      <Text style={styles.subtitle}>Usuarios:</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>
            {item.nombre} {item.apellido}
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20 },
  logoutButton: {
    backgroundColor: '#dc3545', // Rojo para el botón de logout
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default TrainerScreen;
