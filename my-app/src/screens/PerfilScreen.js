import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { Ionicons } from 'react-native-vector-icons'; // Importa Ionicons para los iconos
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PerfilScreen = () => {
    const [user, setUser] = useState(null);
    const [membershipData, setMembershipData] = useState({
        tipo_membresia: '',
        monto: '',
        estadoCuota: '',
    });
    const navigation = useNavigation();

    // Obtén los detalles del perfil del usuario
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Obtener los datos del usuario desde AsyncStorage
                const storedUser = await AsyncStorage.getItem('user');
                const userData = storedUser ? JSON.parse(storedUser) : null;

                if (userData) {
                    setUser(userData);

                    // Llamar a la API para obtener el tipo de membresía, monto y estado de la cuota
                    const membershipResponse = await axios.get(`${API_URL}/private/perfil/${userData.id_usuario}`);

                    const pagoRealizado = membershipResponse.data.pago_realizado;

                    // Si el tipo de usuario no es "cliente", asignamos 0 al monto y "Cuota gratuita" a pago_realizado
                    const monto = userData.tipo_usuario !== 'cliente' ? 0 : membershipResponse.data.monto;
                    
                    const estadoCuota = userData.tipo_usuario !== 'cliente' ? 'Cuota gratuita' : pagoRealizado;

                    setMembershipData({
                        tipo_membresia: membershipResponse.data.tipo_membresia || '',
                        monto: monto || '',
                        estadoCuota: estadoCuota || 'No disponible', // Si es undefined, asignamos 'No disponible'
                    });
                } else {
                    Alert.alert('Error', 'No se pudo cargar la información del usuario.');
                }
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
                Alert.alert('Error', 'No se pudieron cargar los datos del usuario.');
            }
        };

        fetchUserData();
    }, []);

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <ScrollView contentContainerStyle={styles.overlay}> 

                {/* 🎨 Título con Icono */}
                <View style={styles.titleContainer}>
                    <Icon name="account-group" size={34} color="#fff" style={styles.titleIcon} />
                    <Text style={styles.title}>Perfil</Text>
                </View>
                <View style={styles.underline} />
                
                <View style={styles.profileContainer}>

                    {/* Imagen de perfil */}
                    <Image
                        source={require('../assets/foto.jpg')} // Ajusta la ruta de la imagen aquí
                        style={styles.profileImage}
                    />

                    {/* Nombre */}
                    <View style={styles.fieldContainer}>
                        <Ionicons name="person-outline" size={24} color="#333" style={styles.icon} />
                        <Text style={styles.fieldLabel}>Nombre:</Text>
                        <Text style={styles.fieldValue}>{user.nombre}</Text>
                    </View>

                    {/* Apellido */}
                    <View style={styles.fieldContainer}>
                        <Ionicons name="person-outline" size={24} color="#333" style={styles.icon} />
                        <Text style={styles.fieldLabel}>Apellido:</Text>
                        <Text style={styles.fieldValue}>{user.apellido}</Text>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <Ionicons name="mail-outline" size={24} color="#333" style={styles.icon} />
                        <Text style={styles.fieldLabel}>Email:</Text>
                        <Text style={styles.fieldValue}>{user.email}</Text>
                    </View>

                    {/* Tipo de Membresía */}
                    <View style={styles.fieldContainer}>
                        <Ionicons name="card-outline" size={24} color="#333" style={styles.icon} />
                        <Text style={styles.fieldLabel}>Tipo de Membresía:</Text>
                        <Text style={styles.fieldValue}>{membershipData.tipo_membresia}</Text>
                    </View>

                    {/* Monto */}
                    <View style={styles.fieldContainer}>
                        <Ionicons name="cash-outline" size={24} color="#333" style={styles.icon} />
                        <Text style={styles.fieldLabel}>Monto:</Text>
                        <Text style={styles.fieldValue}>
                            {membershipData.tipo_membresia === 'trabajador' ? `0 €` : `${membershipData.monto} €`}
                        </Text>
                    </View>

                    {/* Estado de la cuota */}
                    <View style={styles.fieldContainer}>
                        <Ionicons name="checkmark-circle-outline" size={24} color="#333" style={styles.icon} />
                        <Text style={styles.fieldLabel}>Estado de la cuota:</Text>
                        <Text style={styles.fieldValue}>
                            {membershipData.estadoCuota}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '60%',
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
    profileContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
        marginBottom: 50,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    fieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    icon: {
        marginRight: 10,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    fieldValue: {
        fontSize: 16,
        color: '#666',
        marginTop: 1,
        marginLeft: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PerfilScreen;
