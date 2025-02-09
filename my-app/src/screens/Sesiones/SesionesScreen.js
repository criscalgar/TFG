import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SesionesScreen({ route, navigation }) {
    const { id_clase } = route.params;
    const [sesiones, setSesiones] = useState([]);
    const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario

    useEffect(() => {
        fetchSesiones();
        fetchUserRole();
    }, []);

    // Obtener el tipo de usuario almacenado en AsyncStorage
    const fetchUserRole = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserRole(user.tipo_usuario);
            }
        } catch (error) {
            console.error('Error obteniendo el rol del usuario:', error);
        }
    };

    const fetchSesiones = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/sesiones/${id_clase}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSesiones(response.data);
        } catch (error) {
            console.error('Error al obtener sesiones:', error);
            Alert.alert('Error', 'No se pudieron cargar las sesiones');
        }
    };

    const handleEliminarSesion = async (id_sesion) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que quieres eliminar esta sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            if (!token) {
                                Alert.alert('Error', 'No estás autenticado');
                                return;
                            }

                            await axios.delete(`${API_URL}/private/sesiones/${id_sesion}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            Alert.alert('Éxito', 'Sesión eliminada correctamente');
                            fetchSesiones();
                        } catch (error) {
                            console.error('Error al eliminar la sesión:', error);
                            Alert.alert('Error', 'No se pudo eliminar la sesión');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.container}>

                {/* 🔹 Mostrar "Añadir Sesión" solo si el usuario es Administrador */}
                {userRole === 'administrador' && (
                    <Card style={[styles.card, styles.createCard]}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.sesionNombre}>Añadir Nueva Sesión</Text>
                            <Icon name="calendar-plus" size={50} color="#28a745" style={styles.icon} />
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate('CrearSesionScreen', { id_clase })}
                                style={styles.createButton}
                            >
                                Crear Sesión
                            </Button>
                        </Card.Actions>
                    </Card>
                )}

                {/* 🔹 Listado de sesiones existentes */}
                {sesiones.map((sesion) => (
                    <Card key={sesion.id_sesion} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.sesionNombre}>
                                Fecha: {new Date(sesion.fecha).toLocaleDateString()}
                            </Text>
                            <Text style={styles.sesionDetalle}>
                                Hora: {sesion.hora_inicio.slice(0, 5)} - {sesion.hora_fin.slice(0, 5)}
                            </Text>
                            <Text style={styles.sesionDetalle}>
                                Usuarios apuntados: {sesion.asistentes_actuales}/{sesion.capacidad_maxima}
                            </Text>

                            {/* 🔹 Botón siempre visible */}
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained"
                                    onPress={() => navigation.navigate('ReservasScreen', { id_sesion: sesion.id_sesion })}
                                    style={styles.reservasButton}
                                >
                                    Ver Reservas
                                </Button>

                                {/* 🔹 Mostrar "Eliminar" solo si el usuario es Administrador */}
                                {userRole === 'administrador' && (
                                    <Button
                                        mode="contained"
                                        onPress={() => handleEliminarSesion(sesion.id_sesion)}
                                        style={[styles.button, styles.deleteButton]}
                                        icon="delete"
                                    >
                                        Eliminar
                                    </Button>
                                )}

                                {/* 🔹 Mostrar "Editar" solo si el usuario es Administrador */}
                                {userRole === 'administrador' && (
                                    <Button
                                        mode="contained"
                                        onPress={() => navigation.navigate('EditarSesionScreen', { sesion })}
                                        style={[styles.button, styles.editButton]}
                                        icon="pencil"
                                    >
                                        Editar
                                    </Button>
                                )}
                            </View>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 10,
        elevation: 4,
        padding: 10,
    },
    createCard: {
        borderColor: '#28a745',
        borderWidth: 2,
        backgroundColor: '#eafbea',
    },
    cardContent: {
        alignItems: 'center',
    },
    sesionNombre: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
        textAlign: 'center',
    },
    sesionDetalle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    icon: {
        marginVertical: 10,
    },
    cardActions: {
        justifyContent: 'center',
        width: '100%',
    },
    buttonContainer: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    button: {
        marginVertical: 5,
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    editButton: {
        backgroundColor: '#007bff',
    },
    createButton: {
        backgroundColor: '#28a745',
        width: '80%',
    },
    reservasButton: {
        backgroundColor: '#28a745',
        width: '100%',
    },
});
