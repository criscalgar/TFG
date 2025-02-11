import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, Alert, ImageBackground, Image, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Button as PaperButton } from 'react-native-paper';

export default function ManageUsersScreen({ navigation }) {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
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
        fetchUserRole();
    }, []);

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
        navigation.navigate('EditUser', { user });
    };

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.iconContainer}>
                <Image source={require('../../assets/foto.jpg')} style={styles.icon} />
            </View>
            <Text style={styles.name}>{item.nombre} {item.apellido}</Text>

            {/* Campos con iconos */}
            <View style={styles.infoContainer}>
                <View style={styles.row}>
                    <Icon name="account" size={22} color="#fff" style={styles.fieldIcon} />
                    <Text style={styles.userField}>{item.tipo_usuario}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="email" size={22} color="#fff" style={styles.fieldIcon} />
                    <Text style={styles.userField}>{item.email}</Text>
                </View>
            </View>

            {/* Botones alineados y con el mismo tamaño */}
            <View style={styles.buttonContainer}>
                {userRole === 'administrador' && (
                    <PaperButton 
                        mode="contained" 
                        style={[styles.actionButton, styles.editButton]} 
                        labelStyle={styles.buttonText}
                        onPress={() => handleEditUser(item)}
                    >
                        Editar
                    </PaperButton>
                )}
                
                <PaperButton 
                    mode="contained" 
                    style={[styles.actionButton, styles.paymentButton]} 
                    labelStyle={styles.buttonText}
                    onPress={() => handlePayments(item)}
                >
                    Ver Pagos
                </PaperButton>
            </View>
        </View>
    );

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>

                {/* 🎨 Título con Icono */}
                <View style={styles.titleContainer}>
                    <Icon name="account-group" size={34} color="#fff" />
                    <Text style={styles.title}>Lista de usuarios</Text>
                </View>
                <View style={styles.underline} />

                {loading ? (
                    <Text style={styles.loadingText}>Cargando usuarios...</Text>
                ) : (
                    <FlatList
                        data={usuarios}
                        keyExtractor={(item) => item.id_usuario.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.flatListContent}
                    />
                )}

                {/* 🔄 Botón Flotante para Refrescar */}
                <TouchableOpacity 
                    style={styles.fab}
                    onPress={fetchUsuarios}
                    activeOpacity={0.7}
                >
                    <Icon name="refresh" size={28} color="#fff" />
                </TouchableOpacity>

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
    userCard: {
        backgroundColor: '#fff',
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
        color: '#333',
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 4,
    },
    fieldIcon: {
        marginRight: 10,
    },
    userField: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    editButton: {
        backgroundColor: '#007bff',
    },
    paymentButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        fontSize: 14,
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
    },
});
