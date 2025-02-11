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
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchUserRole();
        fetchSesiones();
    }, []);

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
            <View style={styles.overlay}>
                <View style={styles.titleContainer}>
                    <Icon name="calendar" size={34} color="#fff" />
                    <Text style={styles.title}>Sesiones disponibles</Text>
                </View>
                <View style={styles.underline} />

                {/* ✅ SOLO ADMINISTRADORES PUEDEN CREAR SESIONES */}
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
                                style={[styles.createButton, styles.button]}
                            >
                                Crear Sesión
                            </Button>
                        </Card.Actions>
                    </Card>
                )}

                {/* ✅ LISTADO DE SESIONES */}
                {sesiones.map((sesion) => (
                    <Card key={sesion.id_sesion} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            {/* 🔹 Fecha */}
                            <View style={styles.row}>
                                <Icon name="calendar" size={22} color="#333" />
                                <Text style={styles.texto}> Fecha: </Text>
                                <Text style={styles.sesionDetalle}>
                                    {new Date(sesion.fecha).toLocaleDateString()}
                                </Text>
                            </View>

                            {/* 🔹 Hora */}
                            <View style={styles.row}>
                                <Icon name="clock-outline" size={22} color="#333" />
                                <Text style={styles.texto}> Hora: </Text>
                                <Text style={styles.sesionDetalle}>
                                    {sesion.hora_inicio.slice(0, 5)} - {sesion.hora_fin.slice(0, 5)}
                                </Text>
                            </View>

                            {/* 🔹 Usuarios Apuntados */}
                            <View style={styles.row}>
                                <Icon name="account-group" size={22} color="#333" />
                                <Text style={styles.texto}> Apuntados: </Text>
                                <Text style={styles.sesionDetalle}>
                                    {sesion.asistentes_actuales}
                                </Text>
                            </View>

                            {/* 🔹 Capacidad Máxima */}
                            <View style={styles.row}>
                                <Icon name="account-multiple-plus" size={22} color="#333" />
                                <Text style={styles.texto}> Capacidad maxima: </Text>
                                <Text style={styles.sesionDetalle}>
                                    {sesion.capacidad_maxima}
                                </Text>
                            </View>

                            {/* ✅ SOLO ADMINISTRADORES PUEDEN EDITAR/ELIMINAR SESIONES */}
                            {userRole === 'administrador' && (
                                <View style={styles.buttonContainer}>
                                    <Button
                                        mode="contained"
                                        onPress={() => navigation.navigate('ReservasScreen', { id_sesion: sesion.id_sesion })}
                                        style={[styles.reservasButton, styles.button]}
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
                            )}
                        </Card.Content>
                    </Card>
                ))}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', padding: 20 },
    container: { padding: 20, alignItems: 'center' },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
    underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },

    card: { 
        width: '100%', 
        maxWidth: 400, 
        backgroundColor: '#fff', 
        marginBottom: 15, 
        borderRadius: 10, 
        elevation: 4, 
        padding: 15, 
        alignItems: 'center' 
    },
    createCard: { 
        borderColor: '#28a745', 
        borderWidth: 2, 
        backgroundColor: '#eafbea', 
        alignItems: 'center', 
        paddingVertical: 15 
    },

    cardContent: { alignItems: 'center', justifyContent: 'center' },
    sesionNombre: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#333', textAlign: 'center' },

    // 🔹 Ajuste de margen para los datos de la sesión
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginVertical: 4,
        paddingHorizontal: 10,
    },

    texto: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    sesionDetalle: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginLeft: 10,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    icon: { marginVertical: 10, alignSelf: 'center' },

    cardActions: { justifyContent: 'center', width: '100%' },

    buttonContainer: { 
        marginTop: 10, 
        width: '100%', 
        alignItems: 'center', 
        flexDirection: 'column',
        gap: 10 
    },

    button: { 
        width: '80%', 
        height: 60,
        paddingVertical: 12, 
        borderRadius: 8, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 3 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4, 
        elevation: 6 
    },

    deleteButton: { backgroundColor: '#dc3545' },
    editButton: { backgroundColor: '#007bff' },
    
    // ✅ Ajuste del margen izquierdo del botón "Crear Sesión"
    createButton: { 
        backgroundColor: '#28a745', 
        marginLeft: -40,  // 🔹 Ajuste fino del margen izquierdo
        alignSelf: 'center', // 🔹 Centra el botón sin afectar el margen
        paddingHorizontal: 15 // 🔹 Mantiene el botón con buen tamaño
    },

    reservasButton: { backgroundColor: '#28a745' },

    buttonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginLeft: 10 
    }
});
