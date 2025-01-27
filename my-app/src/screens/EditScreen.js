import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Librería de iconos
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function EditUserScreen({ route, navigation }) {
    const { user } = route.params;
    const [newUser, setNewUser] = useState({
        id_usuario: user?.id_usuario || '',
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || '',
        tipo_usuario: user?.tipo_usuario || '',
        id_membresia: user?.id_membresia || null,
    });

    const [membresia, setMembresia] = useState({ tipo: '', precio: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user.id_membresia) {
            fetchMembresia(user.id_membresia);
        } else {
            Alert.alert('Error', 'El usuario no tiene una membresía asignada');
        }
    }, [user]);

    const fetchMembresia = async (idMembresia) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/membresias/${idMembresia}`, {
                headers: { Authorization: `Bearer ${token}` },
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
            Alert.alert('Error', 'No se pudo cargar la membresía');
        }
    };

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
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Éxito', 'Usuario modificado');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo modificar el usuario');
        }
    };

    const handleDeleteUser = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            return;
        }

        try {
            await axios.delete(`${API_URL}/private/usuarios/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Éxito', 'Usuario eliminado');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/fondoLogin.webp')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <View style={styles.titleCard}>
                    <Text style={styles.title}>Editar Usuario</Text>
                </View>

                <View style={styles.formContainer}>
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

                    <View style={styles.membresiaContainer}>
                        <Text style={styles.membresiaText}>Tipo de Membresía: {membresia.tipo}</Text>
                        <Text style={styles.membresiaText}>
                            Precio: {membresia.precio === 0 ? '0€ (Entrenador/Administrador)' : `${membresia.precio}€`}
                        </Text>
                    </View>

                    <PaperButton
                        mode="contained"
                        icon={() => <Icon name="save" size={20} color="#fff" />}
                        style={styles.saveButton}
                        onPress={handleSaveChanges}
                    >
                        Guardar Cambios
                    </PaperButton>

                    <PaperButton
                        mode="contained"
                        icon={() => <Icon name="delete" size={20} color="#fff" />}
                        style={styles.deleteButton}
                        onPress={handleDeleteUser}
                    >
                        Eliminar Usuario
                    </PaperButton>
                </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    titleCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 5, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        alignItems: 'center',
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 15,
        width: '100%',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    saveButton: {
        backgroundColor: '#28a745',
        marginTop: 20,
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        marginTop: 10,
        width: '100%',
    },
    membresiaContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        width: '100%',
    },
    membresiaText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
