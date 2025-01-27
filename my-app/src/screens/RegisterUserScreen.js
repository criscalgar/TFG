import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterUserScreen({ navigation }) {
    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        contraseña: '',
        tipo_usuario: '',
        id_membresia: null,
    });
    const [membresias, setMembresias] = useState([]);
    const [selectedMembresia, setSelectedMembresia] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMembresias();
    }, []);

    // Obtener las posibles membresías
    const fetchMembresias = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/membresias`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMembresias(response.data);
        } catch (error) {
            console.error('Error al obtener membresías:', error);
            Alert.alert('Error', 'No se pudieron cargar las membresías');
        }
    };

    // Registrar un nuevo usuario
    const handleRegister = async () => {
        if (
            !userData.nombre ||
            !userData.apellido ||
            !userData.email ||
            !userData.contraseña ||
            !userData.tipo_usuario ||
            !userData.id_membresia
        ) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.post(
                `${API_URL}/auth/register`,
                {
                    ...userData,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Éxito', 'Usuario registrado con éxito');
            navigation.goBack();
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            Alert.alert('Error', 'No se pudo registrar el usuario');
        }
    };

    // Actualizar id_membresia cuando se selecciona una membresía
    const handleSelectMembresia = (membresia) => {
        console.log('Membresía seleccionada:', membresia); // Log completo de la membresía seleccionada
        console.log('ID de Membresía seleccionado:', membresia.id_membresia); // Log del ID de membresía
        setSelectedMembresia(membresia);
        setUserData({ ...userData, id_membresia: membresia.id_membresia });
        setModalVisible(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>Registrar Nuevo Usuario</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={userData.nombre}
                        onChangeText={(text) => setUserData({ ...userData, nombre: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Apellido"
                        value={userData.apellido}
                        onChangeText={(text) => setUserData({ ...userData, apellido: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={userData.email}
                        onChangeText={(text) => setUserData({ ...userData, email: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        secureTextEntry
                        value={userData.contraseña}
                        onChangeText={(text) => setUserData({ ...userData, contraseña: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Tipo de usuario (e.g., cliente, entrenador)"
                        value={userData.tipo_usuario}
                        onChangeText={(text) => setUserData({ ...userData, tipo_usuario: text })}
                    />
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.selectorText}>
                            {selectedMembresia
                                ? `${selectedMembresia.tipo_membresia} (${selectedMembresia.precio}€)`
                                : 'Seleccionar Membresía'}
                        </Text>
                    </TouchableOpacity>

                    {/* Campo de solo lectura para el id_membresia */}
                    <TextInput
                        style={styles.inputReadonly}
                        placeholder="ID de Membresía"
                        value={userData.id_membresia ? userData.id_membresia.toString() : ''}
                        editable={false}
                    />

                    <Modal
                        visible={modalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <ScrollView>
                                {membresias.map((membresia) => (
                                    <TouchableOpacity
                                        key={membresia.id_membresia}
                                        style={styles.modalOption}
                                        onPress={() => handleSelectMembresia(membresia)}
                                    >
                                        <Text style={styles.modalOptionText}>
                                            {membresia.tipo_membresia} ({membresia.precio}€)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </Modal>
                    <Button mode="contained" onPress={handleRegister} style={styles.registerButton} loading={loading}>
                        Registrar Usuario
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        width: '100%',
    },
    inputReadonly: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        width: '100%',
        backgroundColor: '#f0f0f0',
        color: '#666',
    },
    selector: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    selectorText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalOption: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
    },
    modalOptionText: {
        fontSize: 16,
    },
    registerButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
    },
});
