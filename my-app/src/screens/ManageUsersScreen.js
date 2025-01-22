import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage
import { API_URL } from '../config'; // Usa tu archivo de configuración

export default function ManageUsersScreen() {
    const [usuarios, setUsuarios] = useState([]);
    const [newUser, setNewUser] = useState({ nombre: '', email: '', tipo_usuario: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Obtener la lista de usuarios
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

    // Función para agregar un nuevo usuario
    const handleAddUser = async () => {
        if (!newUser.nombre || !newUser.email || !newUser.tipo_usuario) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }
        try {
            const token = await AsyncStorage.getItem('userToken'); // Obtener el token de AsyncStorage
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.post(`${API_URL}/private/usuarios`, newUser, {
                headers: { Authorization: `Bearer ${token}` }, // Enviar el token en los headers
            });
            Alert.alert('Éxito', 'Usuario agregado');
            fetchUsuarios(); // Actualiza la lista de usuarios
        } catch (error) {
            Alert.alert('Error', 'No se pudo agregar el usuario');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestionar Usuarios</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={newUser.nombre} onChangeText={(text) => setNewUser({ ...newUser, nombre: text })} />
            <TextInput style={styles.input} placeholder="Email" value={newUser.email} onChangeText={(text) => setNewUser({ ...newUser, email: text })} />
            <TextInput style={styles.input} placeholder="Tipo de usuario" value={newUser.tipo_usuario} onChangeText={(text) => setNewUser({ ...newUser, tipo_usuario: text })} />
            <Button title="Agregar Usuario" onPress={handleAddUser} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
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
