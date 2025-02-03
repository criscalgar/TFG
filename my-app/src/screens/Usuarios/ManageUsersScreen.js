import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ImageBackground, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import { Button as PaperButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ManageUsersScreen({ navigation }) {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchUsuarios();
        }, [])
    );

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/usuarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handlePayments = (user) => {
        navigation.navigate('UserPayments', { user });
    };

    const handleEditUser = (user) => {
        console.log('Usuario seleccionado para editar:', user);
        navigation.navigate('EditUser', { user });
    };

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.iconContainer}>
                <Image source={require('../../assets/foto.jpg')} style={styles.icon} />
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
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                {loading ? (
                    <Text style={styles.loadingText}>Cargando usuarios...</Text>
                ) : (
                    <FlatList
                        data={usuarios}
                        numColumns={2}
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
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
        width: 60,
        height: 60,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#007bff',
        marginTop: 10,
    },
    paymentButton: {
        backgroundColor: '#28a745',
        marginTop: 10,
    },
    flatListContent: {
        justifyContent: 'space-between',
    },
    backButton: {
        marginLeft: 15,
    },
});
