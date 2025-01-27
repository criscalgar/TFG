import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Picker } from 'react-native';
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

            const response = await axios.post(
                `${API_URL}/private/usuarios`,
                {
                    ...userData,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Registro exitoso: Realizar el pago inicial
            await axios.post(
                `${API_URL}/private/pagos/${response.data.id_usuario}`,
                {
                    monto: membresias.find((m) => m.id_membresia === userData.id_membresia).precio,
                    fechaPago: new Date().toISOString().split('T')[0],
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Éxito', 'Usuario registrado con éxito y pago realizado');
            navigation.goBack();
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            Alert.alert('Error', 'No se pudo registrar el usuario');
        }
    };

    return (
        <View style={styles.container}>
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
                    <Text style={styles.label}>Seleccionar Membresía</Text>
                    <Picker
                        selectedValue={selectedMembresia}
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                            setSelectedMembresia(itemValue);
                            setUserData({ ...userData, id_membresia: itemValue });
                        }}
                    >
                        <Picker.Item label="Seleccione una membresía" value={null} />
                        {membresias.map((membresia) => (
                            <Picker.Item
                                key={membresia.id_membresia}
                                label={`${membresia.tipo_membresia} (${membresia.precio}€)`}
                                value={membresia.id_membresia}
                            />
                        ))}
                    </Picker>
                    <Button mode="contained" onPress={handleRegister} style={styles.registerButton} loading={loading}>
                        Registrar Usuario
                    </Button>
                </Card.Content>
            </Card>
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
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    registerButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
    },
});
