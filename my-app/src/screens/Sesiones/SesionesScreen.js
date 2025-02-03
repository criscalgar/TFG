import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importa los iconos
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SesionesScreen({ route, navigation }) {
    const { id_clase } = route.params; // Recibir el id_clase desde la navegación
    const [sesiones, setSesiones] = useState([]);

    useEffect(() => {
        fetchSesiones();
    }, []);

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
                            fetchSesiones(); // Recargar la lista de sesiones
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

                {/* Botón para añadir una nueva sesión */}
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

                {/* Listado de sesiones existentes */}
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
                            <Text style={styles.sesionDetalle}>
                                Capacidad máxima: {sesion.capacidad_maxima}
                            </Text>

                            {/* Botones dentro de la tarjeta, uno debajo del otro */}
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained"
                                    onPress={() => navigation.navigate('ReservasScreen', { id_sesion: sesion.id_sesion })}
                                    style={styles.reservasButton}
                                >
                                    Ver Reservas
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => handleEliminarSesion(sesion.id_sesion)}
                                    style={[styles.button, styles.deleteButton]}
                                    icon="delete"
                                >
                                    Eliminar
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => navigation.navigate('EditarSesionScreen', { sesion })}
                                    style={[styles.button, styles.editButton]}
                                    icon="pencil"
                                >
                                    Editar
                                </Button>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
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
        alignItems: 'center', // Centra los botones dentro del View
    },
    button: {
        marginVertical: 5, // Espacio entre botones
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
        backgroundColor: '#28a745', // Azul
        width: '100%',
    },
});
