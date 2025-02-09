import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SesionesScreen({ route, navigation }) {
    const { id_clase } = route.params;
    const [sesiones, setSesiones] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchSesiones();
        fetchUserRole();
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

    const renderItem = ({ item }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
                <View style={styles.row}>
                    <Icon name="calendar" size={22} color="#333" />
                    <Text style={styles.sessionField}>Fecha: {new Date(item.fecha).toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="clock-time-five" size={22} color="#333" />
                    <Text style={styles.sessionField}>
                        Hora: {item.hora_inicio.slice(0, 5)} - {item.hora_fin.slice(0, 5)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Icon name="account-group" size={22} color="#333" />
                    <Text style={styles.sessionField}>
                        Asistentes: {item.asistentes_actuales}/{item.capacidad_maxima}
                    </Text>
                </View>
            </View>

            {/* Botón siempre visible */}
            <TouchableOpacity
                style={styles.reservasButton}
                onPress={() => navigation.navigate('ReservasScreen', { id_sesion: item.id_sesion })}
            >
                <Icon name="eye" size={22} color="#fff" />
                <Text style={styles.reservasText}>Ver Reservas</Text>
            </TouchableOpacity>

            {/* Mostrar botones solo si el usuario es administrador */}
            {userRole === 'administrador' && (
                <View style={styles.adminButtons}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleEliminarSesion(item.id_sesion)}>
                        <Icon name="delete" size={22} color="#fff" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditarSesionScreen', { sesion: item })}
                    >
                        <Icon name="pencil" size={22} color="#fff" />
                        <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.titleContainer}>
                    <Icon name="calendar-clock" size={34} color="#fff" />
                    <Text style={styles.title}>Sesiones disponibles</Text>
                </View>
                <View style={styles.underline} />

                {userRole === 'administrador' && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CrearSesionScreen', { id_clase })}
                    >
                        <Icon name="calendar-plus" size={24} color="#fff" />
                        <Text style={styles.addText}>Añadir Sesión</Text>
                    </TouchableOpacity>
                )}

                <FlatList
                    data={sesiones}
                    keyExtractor={(item) => item.id_sesion.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContent}
                />
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
    sessionCard: { backgroundColor: '#fff', marginBottom: 15, padding: 15, width: 300, borderRadius: 12, alignItems: 'center' },
    sessionInfo: { width: '100%', paddingHorizontal: 10 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',  // ✅ Sombreado gris como en ViewWorkersScreen
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 4,
    },
    sessionField: { fontSize: 16, color: '#333', marginLeft: 10 },
    reservasButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    reservasText: { color: '#fff', marginLeft: 10 },
    adminButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, flexDirection: 'row', alignItems: 'center' },
    deleteText: { color: '#fff', marginLeft: 5 },
    editButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, flexDirection: 'row', alignItems: 'center' },
    editText: { color: '#fff', marginLeft: 5 },
    addButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    addText: { color: '#fff', marginLeft: 10 },
});
