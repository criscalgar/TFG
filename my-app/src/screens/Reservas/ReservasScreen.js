import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ImageBackground,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReservasScreen({ route, navigation }) {
    const { id_sesion } = route.params;
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario

    useEffect(() => {
        fetchReservas();
        fetchUserRole();
    }, []);

    // Obtener el tipo de usuario desde AsyncStorage
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

    const fetchReservas = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/reservas/${id_sesion}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReservas(response.data);
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            Alert.alert('Error', 'No se pudieron cargar las reservas');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarReserva = async (id_reserva) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que quieres eliminar esta reserva?',
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

                            await axios.delete(`${API_URL}/private/reservas/${id_reserva}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            Alert.alert('Éxito', 'Reserva eliminada correctamente');
                            fetchReservas();
                        } catch (error) {
                            console.error('Error al eliminar la reserva:', error);
                            Alert.alert('Error', 'No se pudo eliminar la reserva');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Reservas de la sesión</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : reservas.length === 0 ? (
                    <Text style={styles.noDataText}>No hay reservas para esta sesión.</Text>
                ) : (
                    reservas.map((reserva) => (
                        <Card key={reserva.id_reserva} style={styles.card}>
                            <Card.Content>
                                {/* Icono de usuario en el centro */}
                                <View style={styles.iconContainer}>
                                    <Image source={require('../../assets/foto.jpg')} style={styles.userIcon} />
                                </View>

                                {/* Información del usuario alineada a la izquierda */}
                                <View style={styles.infoContainer}>
                                    <View style={styles.row}>
                                        <Icon name="account-circle" size={20} color="#333" style={styles.icon} />
                                        <Text style={styles.reservaInfo}>{reserva.nombre} {reserva.apellido}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Icon name="email" size={20} color="#333" style={styles.icon} />
                                        <Text style={styles.reservaInfo}>{reserva.email}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Icon name="check-circle" size={20} color="#333" style={styles.icon} />
                                        <Text style={styles.reservaInfo}>Estado: {reserva.estado}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Icon name="calendar" size={20} color="#333" style={styles.icon} />
                                        <Text style={styles.reservaInfo}>{new Date(reserva.fecha_reserva).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            </Card.Content>

                            {/* 🔹 Solo mostrar botón de eliminar si el usuario es administrador */}
                            {userRole === 'administrador' && (
                                <Card.Actions style={styles.cardActions}>
                                    <Button
                                        mode="contained"
                                        onPress={() => handleEliminarReserva(reserva.id_reserva)}
                                        style={styles.deleteButton}
                                        icon="delete"
                                    >
                                        Eliminar
                                    </Button>
                                </Card.Actions>
                            )}
                        </Card>
                    ))
                )}

                {/* Botón para volver atrás */}
                <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
                    Volver
                </Button>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    noDataText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 10,
        elevation: 4,
        padding: 15,
        width: '75%',
        alignSelf: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    userIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    infoContainer: {
        alignItems: 'flex-start',
        width: '100%',
        paddingLeft: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 10,
    },
    reservaInfo: {
        fontSize: 16,
        color: '#333',
        textAlign: 'left',
    },
    cardActions: {
        justifyContent: 'center',
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        width: '100%',
    },
    backButton: {
        backgroundColor: '#007bff',
        marginTop: 10,
        width: '100%',
    },
});
