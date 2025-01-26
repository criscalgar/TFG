import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { Button as PaperButton } from 'react-native-paper'; // Usamos PaperButton para los botones con estilo
import { useNavigation } from '@react-navigation/native'; // Para navegar

export default function ManageUsersScreen() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Obtener la lista de usuarios
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    // Función para redirigir a la pantalla de pagos
    const handlePayments = (user) => {
        navigation.navigate('UserPayments', { user }); // Navegar a la pantalla de pagos
    };

    const handleEditUser = (user) => {
        console.log('Usuario seleccionado para editar:', user); // Verificar que incluya id_membresia
        navigation.navigate('EditUser', { user }); // Navegar a la pantalla de edición
    };

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.iconContainer}>
                <Image
                    source={require('../assets/foto.jpg')} // Ruta al ícono de usuario
                    style={styles.icon}
                />
            </View>
            <Text style={styles.name}>{item.nombre} {item.apellido}</Text>
            <PaperButton mode="contained" style={styles.editButton} onPress={() => handleEditUser(item)}>
                Editar
            </PaperButton>
            <PaperButton mode="contained" style={styles.paymentButton} onPress={() => handlePayments(item)}>
                Ver Pagos
            </PaperButton>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestionar Usuarios</Text>
            {loading ? (
                <Text>Cargando usuarios...</Text>
            ) : (
                <FlatList
                    data={usuarios}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.flatListContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    userCard: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fff',
        width: 150,
        borderRadius: 5,
        height: 210,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        width: 60, // Tamaño del ícono
        height: 60, // Tamaño del ícono
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#007bff', // Cambiado a azul
        marginTop: 10,
    },
    paymentButton: {
        backgroundColor: '#28a745', // Cambiado a verde
        marginTop: 10,
    },
    flatListContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
});
