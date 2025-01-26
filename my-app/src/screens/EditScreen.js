import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function EditUserScreen({ route, navigation }) {
    const { user } = route.params; // Recibimos el usuario a editar
    const [newUser, setNewUser] = useState({
        id_usuario: user?.id_usuario || '',
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || '',
        tipo_usuario: user?.tipo_usuario || '',
        id_membresia: user?.id_membresia || null, // Asegúrate de que se incluya id_membresia
    });
    
    const [membresia, setMembresia] = useState({ tipo: '', precio: 0 }); // Estado para la membresía
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('Usuario recibido:', user); // Verifica que incluya el id_membresia
        if (user.id_membresia) {
            fetchMembresia(user.id_membresia);
        } else {
            Alert.alert('Error', 'El usuario no tiene una membresía asignada');
        }
    }, [user]);
    

    // Obtener la membresía desde el backend
    const fetchMembresia = async (idMembresia) => {
        try {
            const token = await AsyncStorage.getItem('userToken'); // Obtén el token almacenado
    
            if (!token) {
                console.error('Token no encontrado');
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/membresias/${idMembresia}`, {
                headers: { Authorization: `Bearer ${token}` }, // Incluye el token en los encabezados
            });
    
            
    
            if (response.data) {
                setMembresia({
                    tipo: response.data.tipo_membresia || 'Sin asignar',
                    precio: response.data.precio || 0,
                });
            } else {
                setMembresia({ tipo: 'Sin asignar', precio: 0 });
            }
        } catch (error) {
            console.error('Error al obtener membresía:', error);
            Alert.alert('Error', 'No se pudo cargar la membresía');
        }
    };
    
    
    

    // Función para guardar cambios en el usuario
    const handleSaveChanges = async () => {
        if (!newUser.nombre || !newUser.apellido || !newUser.email || !newUser.tipo_usuario) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            return;
        }

        try {
            await axios.put(`${API_URL}/private/usuarios/${user.email}`, newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Éxito', 'Usuario modificado');
            navigation.goBack(); // Volver a la pantalla anterior
        } catch (error) {
            Alert.alert('Error', 'No se pudo modificar el usuario');
        }
    };

    // Función para eliminar un usuario
    const handleDeleteUser = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            return;
        }

        try {
            await axios.delete(`${API_URL}/private/usuarios/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Éxito', 'Usuario eliminado');
            navigation.goBack(); // Volver a la pantalla anterior
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Usuario</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={newUser.nombre}
                onChangeText={(text) => setNewUser({ ...newUser, nombre: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={newUser.apellido}
                onChangeText={(text) => setNewUser({ ...newUser, apellido: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Tipo de usuario"
                value={newUser.tipo_usuario}
                onChangeText={(text) => setNewUser({ ...newUser, tipo_usuario: text })}
            />

            {/* Mostrar la membresía y su precio */}
            <View style={styles.membresiaContainer}>
                <Text style={styles.membresiaText}>Tipo de Membresía: {membresia.tipo}</Text>
                <Text style={styles.membresiaText}>
                    Precio: {membresia.precio === 0 ? '0€ (Entrenador/Administrador)' : `${membresia.precio}€`}
                </Text>
            </View>

            <PaperButton mode="contained" style={styles.saveButton} onPress={handleSaveChanges}>
                Guardar Cambios
            </PaperButton>

            <PaperButton mode="contained" style={styles.deleteButton} onPress={handleDeleteUser}>
                Eliminar Usuario
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
    saveButton: {
        backgroundColor: '#28a745',
        marginTop: 20,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        marginTop: 10,
    },
    membresiaContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
    },
    membresiaText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
