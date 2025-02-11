import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MisReservasScreen() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        fetchUserId();
    }, []);

    const fetchUserId = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserId(user.id_usuario);
                fetchReservas(user.id_usuario);
            }
        } catch (error) {
            console.error('Error obteniendo el ID del usuario:', error);
        }
    };

    const fetchReservas = async (id_usuario) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/mis-reservas/${id_usuario}`, {
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
            '¿Estás seguro de que quieres cancelar esta reserva?',
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

                            Alert.alert('Éxito', 'Reserva cancelada correctamente');
                            fetchReservas(userId);
                        } catch (error) {
                            console.error('Error al cancelar la reserva:', error);
                            Alert.alert('Error', 'No se pudo cancelar la reserva');
                        }
                    },
                },
            ]
        );
    };

    const getIconForClassType = (tipoClase) => {
        switch (tipoClase.toLowerCase()) {
            case 'yoga': return 'yoga';
            case 'crossfit': return 'dumbbell';
            case 'zumba': return 'music-circle';
            case 'pilates': return 'human-handsup';
            case 'boxeo': return 'boxing-glove';
            case 'ciclismo': return 'bike';
            case 'natacion': return 'swim';
            default: return 'dumbbell';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.reservaCard}>
            <View style={styles.iconContainer}>
                <View style={styles.iconShadow}>
                    <Icon name={getIconForClassType(item.tipo_clase)} size={50} color="#000" />
                </View>
            </View>
            <Text style={styles.name}>{item.tipo_clase}</Text>
            <View style={styles.infoContainer}>
                <View style={styles.row}>
                    <Icon name="calendar" size={22} color="#000" />
                    <Text style={styles.reservaField}>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="clock-outline" size={22} color="#000" />
                    <Text style={styles.reservaField}>
                        Hora: {item.hora_inicio.slice(0, 5)} - {item.hora_fin.slice(0, 5)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Icon name="check-circle" size={22} color="#000" />
                    <Text style={styles.reservaField}>Estado: {item.estado}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={() => handleEliminarReserva(item.id_reserva)}>
                <Icon name="delete" size={24} color="#fff" />
                <Text style={styles.deleteText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.titleContainer}>
                    <Icon name="calendar-check" size={34} color="#fff" />
                    <Text style={styles.title}>Mis Reservas</Text>
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
    iconShadow: { elevation: 5, shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
    name: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    infoContainer: { width: '100%', paddingHorizontal: 10 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 4,
    },
    reservaField: { fontSize: 16, color: '#000', marginLeft: 10 },
    deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    deleteText: { color: '#fff', marginLeft: 5 },
});
