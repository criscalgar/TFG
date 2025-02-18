import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    ImageBackground,
    Image,
    TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ReservasScreen({ route }) {
    const { id_sesion } = route.params;
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [tieneReserva, setTieneReserva] = useState(false); // ✅ Estado para ocultar botón

    useEffect(() => {
        fetchUserRole();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchReservas();
        }
    }, [userId]);

    const fetchUserRole = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserRole(user.tipo_usuario);
                setUserId(user.id_usuario);
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

            // ✅ Verificar si el usuario ya tiene una reserva en esta sesión
            const usuarioTieneReserva = response.data.some(reserva => reserva.id_usuario === userId);
            setTieneReserva(usuarioTieneReserva);

        } catch (error) {
            console.error('Error al obtener reservas:', error);
            Alert.alert('Error', 'No se pudieron cargar las reservas');
        } finally {
            setLoading(false);
        }
    };

    const handleReservarSesion = async (id_sesion) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }
    
            const response = await axios.post(
                `${API_URL}/private/reservas`,
                { id_usuario: userId, id_sesion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            if (response.status === 201) {
                Alert.alert('Éxito', 'Reserva realizada correctamente');
            }
        } catch (error) {
            console.error('Error al reservar sesión:', error);
            Alert.alert('Error', 'No se pudo realizar la reserva');
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

    const renderItem = ({ item }) => (
        <View style={styles.reservaCard}>
            <View style={styles.iconContainer}>
                <Image source={require('../../assets/foto.jpg')} style={styles.icon} />
            </View>
            <Text style={styles.name}>{item.nombre} {item.apellido}</Text>
            <View style={styles.infoContainer}>
                <View style={styles.row}>
                    <Icon name="email" size={22} color="#333" />
                    <Text style={styles.reservaField}>{item.email}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="check-circle" size={22} color="#333" />
                    <Text style={styles.reservaField}>Estado: {item.estado}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="calendar" size={22} color="#333" />
                    <Text style={styles.reservaField}>{new Date(item.fecha_reserva).toLocaleDateString()}</Text>
                </View>
            </View>

            {userRole === 'administrador' && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleEliminarReserva(item.id_reserva)}>
                    <Icon name="delete" size={24} color="#fff" />
                    <Text style={styles.deleteText}>Eliminar</Text>
                    
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.titleContainer}>
                    <Icon name="calendar-check" size={34} color="#fff" />
                    <Text style={styles.title}>Reservas de la sesión</Text>
                </View>
                <View style={styles.underline} />

                {loading ? (
                    <Text style={styles.loadingText}>Cargando...</Text>
                ) : (
                    <FlatList
                        data={reservas}
                        keyExtractor={(item) => item.id_reserva.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.flatListContent}
                        ListFooterComponent={
                            userRole === 'cliente' && !tieneReserva ? ( // ✅ Oculta el botón si ya tiene reserva
                                <TouchableOpacity style={styles.reserveButton} onPress={handleReservarSesion}>
                                    <Icon name="plus" size={24} color="#fff" />
                                    <Text style={styles.reserveText}>Reservar para esta clase</Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', padding: 20 },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
    underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },
    reservaCard: { backgroundColor: '#fff', marginBottom: 15, padding: 15, width: 300, borderRadius: 12, alignItems: 'center' },
    iconContainer: { alignItems: 'center', marginBottom: 10 },
    icon: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#fff' },
    name: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    infoContainer: { width: '100%', paddingHorizontal: 10 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    reservaField: { fontSize: 16, color: '#333', marginLeft: 10 },
    reserveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    reserveText: { color: '#fff', marginLeft: 10 },
    deleteButton: {
        backgroundColor: '#dc3545', // Rojo fuerte
        paddingVertical: 12, // Altura uniforme
        paddingHorizontal: 20, // Ancho suficiente
        borderRadius: 8, // Bordes redondeados
        flexDirection: 'row', // Ícono y texto en la misma línea
        alignItems: 'center', // Alinear ícono y texto
        justifyContent: 'center', // Centrar contenido
        width: '90%', // Ajusta al ancho del contenedor
        shadowColor: "#000", // ✅ Sombra para destacar el botón
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6, // ✅ Sombra en Android
    },

    deleteText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginLeft: 10 // Espacio entre ícono y texto
    },
});

