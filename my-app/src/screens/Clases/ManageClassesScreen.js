import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ImageBackground } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClasesScreen({ navigation }) {
    const [clases, setClases] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchClases();
        fetchUserRole();
    }, []);

    const fetchUserRole = async () => {
        try {
            const userData = await AsyncStorage.getItem('user'); // Obtener usuario completo
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

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.container}>

                {/* Mostrar la tarjeta para crear una nueva clase solo si es administrador */}
                {userRole === 'administrador' && (
                    <Card style={[styles.card, styles.createCard]}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.claseNombre}>Crear Nueva Clase</Text>
                            <Icon name="plus-circle" size={50} color="#28a745" style={styles.icon} />
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate('CrearClaseScreen')}
                                style={styles.createButton}
                            >
                                Añadir Clase
                            </Button>
                        </Card.Actions>
                    </Card>
                )}

                {clases.map((clase) => (
                    <Card key={clase.id_clase} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.claseNombre}>{clase.tipo_clase}</Text>
                            <Icon name={getIconForClassType(clase.tipo_clase)} size={40} color="#FFA500" style={styles.icon} />
                            <Text style={styles.claseDescripcion}>{clase.descripcion}</Text>
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained"
                                    onPress={() => navigation.navigate('SesionesScreen', { id_clase: clase.id_clase })}
                                    style={styles.button}
                                >
                                    Ver sesiones
                                </Button>

                                {/* Mostrar el botón de eliminar solo si es administrador */}
                                {userRole === 'administrador' && (
                                    <Button
                                        mode="contained"
                                        onPress={() => handleEliminarClase(clase.id_clase)}
                                        style={[styles.button, styles.deleteButton]}
                                        icon="delete"
                                    >
                                        Eliminar
                                    </Button>
                                )}
                            </View>
                        </Card.Actions>
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
        marginVertical: 5,
        width: '80%',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    createButton: {
        backgroundColor: '#28a745',
        width: '80%',
    },
});

