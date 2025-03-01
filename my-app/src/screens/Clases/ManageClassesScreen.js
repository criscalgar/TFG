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
import { Card, Button as PaperButton } from 'react-native-paper';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ClasesScreen({ navigation }) {
    const [clases, setClases] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchClases();
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

    const fetchClases = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/clases`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setClases(response.data);
        } catch (error) {
            console.error('Error al obtener clases:', error);
            Alert.alert('Error', 'No se pudieron cargar las clases');
        }
    };

    const handleEliminarClase = async (id_clase) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que quieres eliminar esta clase?',
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

                            await axios.delete(`${API_URL}/private/clases/${id_clase}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            Alert.alert('Éxito', 'Clase eliminada correctamente');
                            fetchClases();
                        } catch (error) {
                            console.error('Error al eliminar la clase:', error);
                            Alert.alert('Error', 'No se pudo eliminar la clase');
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
        <View style={styles.classCard}>
            <View style={styles.classInfo}>
                <Icon name={getIconForClassType(item.tipo_clase)} size={40} color="#FFA500" />
                <Text style={styles.className}>{item.tipo_clase}</Text>
            </View>

            {/* Botón siempre visible */}
            <TouchableOpacity
                style={styles.sessionsButton}
                onPress={() => navigation.navigate('Clases', { screen: 'Sesiones', params: { id_clase: item.id_clase } })}

            >
                <Icon name="eye" size={22} color="#fff" />
                <Text style={styles.sessionsText}>Ver sesiones</Text>
            </TouchableOpacity>

            {/* Mostrar botones solo si el usuario es administrador */}
            {userRole === 'administrador' && (
                <View style={styles.adminButtons}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleEliminarClase(item.id_clase)}>
                        <Icon name="delete" size={22} color="#fff" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Clases disponibles</Text>
                </View>
                <View style={styles.underline} />

                {/* Botón para crear una nueva clase (solo visible para Administradores) */}
                {userRole === 'administrador' && (
                    <Card style={[styles.card, styles.createCard]}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.claseNombre}>Crear nueva clase</Text>
                            <Icon name="plus-circle" size={50} color="#28a745" style={styles.icon} />
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <PaperButton
                                mode="contained"
                                onPress={() => navigation.navigate('Clases', { screen: 'CrearClase' })} 
                                style={styles.createButton}
                                labelStyle={styles.buttonText}
                            >
                                Añadir usuario
                            </PaperButton>
                        </Card.Actions>
                    </Card>
                )}


                <FlatList
                    data={clases}
                    keyExtractor={(item) => item.id_clase.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContent}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
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
    claseNombre: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
        textAlign: 'center',
    },
    icon: {
        marginVertical: 10,
    },
    claseDescripcion: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    cardActions: {
        justifyContent: 'center',
        width: '100%',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007bff',
        marginVertical: 5, // Separación entre botones
        width: '80%',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    createButton: {
        backgroundColor: '#28a745',
        width: '80%',
    },
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', padding: 20 },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
    underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },

    classCard: { backgroundColor: '#fff', marginBottom: 15, padding: 15, width: 300, borderRadius: 12, alignItems: 'center' },
    classInfo: { width: '100%', paddingHorizontal: 10, alignItems: 'center' },
    className: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5 },

    sessionsButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginTop: 10, width: 150 },
    sessionsText: { color: '#fff', marginLeft: 10 },

    deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, flexDirection: 'row', alignItems: 'center', width: 150 },
    deleteText: { color: '#fff', marginLeft: 5 },
    addButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    addText: { color: '#fff', marginLeft: 10 },
    adminButtons: { marginTop: 10 },
});