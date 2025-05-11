import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Alert,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { Card, Button as PaperButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

export default function SesionesScreen({ route, navigation }) {
    const { id_clase } = route.params;
    const [sesiones, setSesiones] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [reservasUsuario, setReservasUsuario] = useState([]);

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
                setUserId(user.id_usuario);
                fetchReservasUsuario(user.id_usuario);
            }
        } catch (error) {
            console.error('Error obteniendo el rol del usuario:', error);
        }
    };

    const fetchReservasUsuario = async (id_usuario) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            const res = await axios.get(`${API_URL}/private/mis-reservas/${id_usuario}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReservasUsuario(res.data.map(r => r.id_sesion));
        } catch (err) {
            console.error('Error obteniendo reservas:', err);
        }
    };

    const fetchSesiones = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            const res = await axios.get(`${API_URL}/private/sesiones/${id_clase}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSesiones(res.data);
        } catch (err) {
            Alert.alert('Error', 'No se pudieron cargar las sesiones');
        }
    };

    const handleEliminarSesion = async (id_sesion) => {
        Alert.alert('Confirmación', '¿Eliminar esta sesión?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        if (!token) return;
                        await axios.delete(`${API_URL}/private/sesiones/${id_sesion}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        fetchSesiones();
                    } catch (err) {
                        Alert.alert('Error', 'No se pudo eliminar la sesión');
                    }
                },
            },
        ]);
    };

    const handleReservarSesion = async (id_sesion) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            const res = await axios.post(
                `${API_URL}/private/reservas`,
                { id_usuario: userId, id_sesion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.status === 201) {
                Alert.alert('Reserva realizada', '', [
                    { text: 'OK', onPress: () => navigation.navigate('misReservas') },
                ]);
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo realizar la reserva');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
                <Icon name="calendar" size={40} color="#000" />
                <Text style={styles.sessionTitle}>{new Date(item.fecha).toLocaleDateString()}</Text>
                <View style={styles.infoRow}>
                    <Icon name="clock-outline" size={20} color="#333" style={styles.infoIcon} />
                    <Text style={styles.sessionText}>
                        <Text style={styles.sessionKey}>Hora: </Text>
                        <Text style={styles.sessionValue}>{item.hora_inicio.slice(0, 5)} - {item.hora_fin.slice(0, 5)}</Text>
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="account-group" size={20} color="#333" style={styles.infoIcon} />
                    <Text style={styles.sessionText}>
                        <Text style={styles.sessionKey}>Apuntados: </Text>
                        <Text style={styles.sessionValue}>{item.asistentes_actuales}</Text>
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="account-multiple-plus" size={20} color="#333" style={styles.infoIcon} />
                    <Text style={styles.sessionText}>
                        <Text style={styles.sessionKey}>Capacidad: </Text>
                        <Text style={styles.sessionValue}>{item.capacidad_maxima}</Text>
                    </Text>
                </View>


            </View>

            {(userRole === 'administrador' || userRole === 'entrenador') && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                    onPress={() => navigation.navigate('Clases', { screen: 'Reservas', params: { id_sesion: item.id_sesion } })}
                >
                    <Icon name="eye" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Ver reservas</Text>
                </TouchableOpacity>

            )}

            {userRole === 'cliente' && !reservasUsuario.includes(item.id_sesion) && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
                    onPress={() => handleReservarSesion(item.id_sesion)}
                >
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Reservar</Text>
                </TouchableOpacity>
            )}

            {userRole === 'administrador' && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f0ad4e' }]}
                    onPress={() => navigation.navigate('Clases', { screen: 'EditSesion', params: { sesion: item } })}
                >
                    <Icon name="pencil" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Editar sesion</Text>
                </TouchableOpacity>
            )}

            {userRole === 'administrador' && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
                    onPress={() => handleEliminarSesion(item.id_sesion)}
                >
                    <Icon name="delete" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
            )}

        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.titleContainer}>
                <Icon name="calendar" size={30} color="#fff" />
                    <Text style={styles.title}>Sesiones disponibles</Text>
                </View>
                <View style={styles.underline} />

                {userRole === 'administrador' && (
                    <Card style={styles.createCard}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.claseNombre}>Crear nueva sesión</Text>
                            <Icon name="plus-circle" size={50} color="#28a745" style={styles.icon} />
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                                onPress={() => navigation.navigate('Clases', { screen: 'CrearSesion', params: { id_clase } })}
                            >
                                <Icon name="calendar-plus" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Añadir sesión</Text>
                            </TouchableOpacity>
                        </Card.Actions>
                    </Card>
                )}

                <FlatList
                    data={sesiones}
                    keyExtractor={(item) => item.id_sesion.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
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
    createCard: { borderColor: '#28a745', borderWidth: 2, backgroundColor: '#eafbea', width: "85%", marginBottom: 20 },
    cardContent: { alignItems: 'center' },
    claseNombre: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    icon: { marginVertical: 10 },
    cardActions: { justifyContent: 'center' },
    sessionCard: { backgroundColor: '#fff', marginBottom: 15, padding: 15, width: 300, borderRadius: 12, alignItems: 'center' },
    sessionInfo: { alignItems: 'center', marginBottom: 10 },
    sessionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 5 },
    sessionText: { fontSize: 16, color: '#666' },
    actionButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginTop: 10, width: 200, justifyContent: 'center' },
    buttonText: { color: '#fff', marginLeft: 10 },
    listContent: { paddingBottom: 20 },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginVertical: 2,
    },
    
    infoIcon: {
        marginRight: 8,
    },
    
    sessionText: {
        fontSize: 16,
        color: '#666',
    },
    
    sessionKey: {
        fontWeight: 'bold',
        color: '#333',
    },
    
    sessionValue: {
        color: '#666',
    },
    

});
