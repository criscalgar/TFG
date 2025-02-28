import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, FlatList
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';

export default function NotificacionesScreen() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotificaciones(); // Llamada inicial
    
        const interval = setInterval(fetchNotificaciones, 1000); // 🔹 Ejecuta cada 2 segundos
    
        return () => clearInterval(interval); // 🔹 Limpia el intervalo cuando se desmonta el componente
    }, []);
    

    const fetchNotificaciones = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/notificaciones`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotificaciones(response.data.notificaciones);
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLeida = async (id_notificacion) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.put(`${API_URL}/private/notificaciones/${id_notificacion}/marcar-leida`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotificaciones((prev) =>
                prev.map((notif) =>
                    notif.id_notificacion === id_notificacion
                        ? { ...notif, estado: 'leido' }
                        : notif
                )
            );
        } catch (error) {
            console.error('Error marcando como leída:', error);
            Alert.alert('Error', 'No se pudo marcar la notificación como leída');
        }
    };

    const eliminarNotificacion = async (id_notificacion) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.delete(`${API_URL}/private/notificaciones/${id_notificacion}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotificaciones((prev) =>
                prev.filter((notif) => notif.id_notificacion !== id_notificacion)
            );
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            Alert.alert('Error', 'No se pudo eliminar la notificación');
        }
    };

    const marcarTodasLeidas = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.put(`${API_URL}/private/notificaciones/marcar-todas-leidas`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotificaciones((prev) => prev.map((notif) => ({ ...notif, estado: 'leido' })));
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
            Alert.alert('Error', 'No se pudieron marcar todas las notificaciones como leídas');
        }
    };

    const eliminarTodasNotificaciones = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.log('❌ No se encontró token.');
                Alert.alert('Error', 'No estás autenticado');
                return;
            }
            const response = await axios.delete(`${API_URL}/private/notificaciones`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log('📩 Respuesta de la API:', response.data);
    
            if (response.data.success) {
                setNotificaciones([]); 
                Alert.alert('Éxito', 'Todas las notificaciones han sido eliminadas');
            } else {
                Alert.alert('Error', 'No se pudieron eliminar todas las notificaciones');
            }
        } catch (error) {
            console.error('❌ Error eliminando todas las notificaciones:', error);
            Alert.alert('Error', 'No se pudieron eliminar todas las notificaciones');
        }
    };
    
    

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                 {/* 🎨 Título con Icono (Mismo estilo que "Lista de usuarios") */}
                 <View style={styles.titleContainer}>
                    <Ionicons name="notifications" size={34} color="#fff" />
                    <Text style={styles.title}>Notificaciones</Text>
                </View>
                <View style={styles.underline} />

                {notificaciones.length > 0 && (
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton} onPress={marcarTodasLeidas}>
                            <MaterialIcons name="done-all" size={24} color="white" />
                            <Text style={styles.actionText}>Marcar todas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={eliminarTodasNotificaciones}>
                            <MaterialIcons name="delete" size={24} color="white" />
                            <Text style={styles.actionText}>Eliminar todas</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={notificaciones}
                    keyExtractor={(item) => item.id_notificacion.toString()}
                    renderItem={({ item }) => (
                        <View style={[styles.notificationCard, item.estado === 'no leido' && styles.unread]}>
                            <Text style={styles.notificationText}>{item.texto}</Text>
                            <View style={styles.notificationActions}>
                                {item.estado === 'no leido' && (
                                    <TouchableOpacity onPress={() => marcarComoLeida(item.id_notificacion)}>
                                        <Ionicons name="checkmark-done" size={24} color="green" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => eliminarNotificacion(item.id_notificacion)}>
                                    <Ionicons name="trash-outline" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-circle-outline" size={90} color="#444" style={styles.emptyIcon} />
                            <Text style={styles.emptyText}>¡No tienes notificaciones!</Text>
                            <Text style={styles.emptySubText}>Aquí aparecerán tus notificaciones cuando las tengas.</Text>
                        </View>
                    }
                    
                    
                    
                    
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 60,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 6,
        marginTop: 30
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    underline: {
        width: '60%',
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        marginBottom: 15,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        width: '90%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
    notificationCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        width: '95%',
        alignSelf: 'center'
    },
    unread: {
        backgroundColor: '#e3f2fd',
    },
    notificationText: {
        fontSize: 16,
        flex: 1,
    },
    notificationActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo semitransparente
        paddingVertical: 25,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        width: '85%',
        alignSelf: 'center',
    },
    
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // 🔹 Más claro para mayor visibilidad
        paddingVertical: 30,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25, // 🔹 Mayor visibilidad con sombra
        shadowRadius: 8,
        elevation: 6,
        width: '90%', // 🔹 Un poco más ancho para mayor legibilidad
        alignSelf: 'center',
    },
    
    emptyIcon: {
        opacity: 1, // 🔹 Máxima visibilidad
        marginBottom: 15,
        color: '#222', // 🔹 Un gris más oscuro
    },
    
    emptyText: {
        fontSize: 22, // 🔹 Más grande para mejor lectura
        fontWeight: 'bold',
        color: '#222', // 🔹 Más contraste
        textAlign: 'center',
        marginBottom: 8,
    },
    
    emptySubText: {
        fontSize: 16, // 🔹 Más grande
        fontWeight: '500', // 🔹 Un poco más gruesa
        color: '#444', // 🔹 Más oscuro para mejor visibilidad
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    
    
    
    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
