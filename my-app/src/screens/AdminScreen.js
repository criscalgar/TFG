import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button as PaperButton } from 'react-native-paper'; // Usando Paper para un diseño más bonito
import axios from 'axios';
import { API_URL } from '../config'; // Asegúrate de tener esta IP configurada correctamente
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

export default function AdminScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para obtener los usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken'); // Obtener el token de AsyncStorage
      if (!token) {
        Alert.alert('Error', 'No estás autenticado');
        return;
      }

      const response = await axios.get(`${API_URL}/private/usuarios`, {
        headers: { Authorization: `Bearer ${token}` } // Enviar el token en los headers
      });
      setUsuarios(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Función para gestionar usuarios
  const gestionarUsuarios = () => {
    navigation.navigate('ManageUsers'); // Navegar a la pantalla para gestionar usuarios
  };

  // Función para gestionar clases
  const gestionarClases = () => {
    navigation.navigate('ManageClasses'); // Navegar a la pantalla para gestionar clases
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Administrador</Text>

      {/* Mostrar usuarios con FlatList */}
      {loading ? (
        <Text>Cargando usuarios...</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.email.toString()} // Usamos email como clave
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Text>{item.nombre}</Text>
              <Text>{item.email}</Text>
              <Text>{item.tipo_usuario}</Text>
            </View>
          )}
        />
      )}

      {/* Botones de acción */}
      <PaperButton style={styles.button} mode="contained" onPress={gestionarUsuarios}>
        Gestionar Usuarios
      </PaperButton>
      <PaperButton style={styles.button} mode="contained" onPress={gestionarClases}>
        Gestionar Clases
      </PaperButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    width: '80%',
  },
  userCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 5,
  },
});
