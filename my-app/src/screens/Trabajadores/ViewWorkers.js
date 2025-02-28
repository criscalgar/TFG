import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, Alert, ImageBackground, Image, TouchableOpacity 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ViewWorkersScreen() {
    const [trabajadores, setTrabajadores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrabajadores();
    }, []);

    const fetchTrabajadores = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/trabajadores`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTrabajadores(response.data);
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
            Alert.alert('Error', 'No se pudieron cargar los trabajadores');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.workerCard}>
            <View style={styles.iconContainer}>
                <Image source={require('../../assets/foto.jpg')} style={styles.icon} />
            </View>
            <Text style={styles.name}>{item.nombre} {item.apellido}</Text>
            
            {/* Tarjetas con iconos */}
            <View style={styles.infoContainer}>
                <View style={styles.row}>
                    <Icon name="account" size={22} color="#fff" style={styles.fieldIcon} />
                    <Text style={styles.workerField}>{item.rol}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="phone" size={22} color="#fff" style={styles.fieldIcon} />
                    <Text style={styles.workerField}>{item.telefono}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="email" size={22} color="#fff" style={styles.fieldIcon} />
                    <Text style={styles.workerField}>{item.email}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                
                {/* 🎨 Título con Icono */}
                <View style={styles.titleContainer}>
                    <Icon name="account-group" size={34} color="#fff" style={styles.titleIcon} />
                    <Text style={styles.title}>Lista de trabajadores</Text>
                </View>
                <View style={styles.underline} />

                {loading ? (
                    <Text style={styles.loadingText}>Cargando...</Text>
                ) : (
                    <FlatList
                        data={trabajadores}
                        keyExtractor={(item) => item.id_usuario.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.flatListContent}
                    />
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    loadingText: {
        fontSize: 18,
        color: '#fff',
    },
    workerCard: {
        backgroundColor: '#fff',  // ✅ Fondo blanco para mejor contraste
        marginBottom: 15,
        padding: 15,
        width: 300,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',  // ✅ Texto oscuro para mejor legibilidad
        textAlign: 'center',
        marginBottom: 10,
    },
    infoContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',  // ✅ Campos translúcidos
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    fieldIcon: {
        marginRight: 10,
    },
    workerField: {
        fontSize: 16,
        color: '#333',  // ✅ Texto oscuro dentro de los campos translúcidos
        fontWeight: '500',
    },
    flatListContent: {
        paddingBottom: 80, 
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#007bff',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
});
