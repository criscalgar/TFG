import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UsersPaymentsScreen({ route }) {
    const { user } = route.params;
    const [pagoRealizado, setPagoRealizado] = useState(null);
    const [fechaPago, setFechaPago] = useState(null);
    const [membresia, setMembresia] = useState({ tipo: '', precio: 0 });
    const [loading, setLoading] = useState(true);
    const [processingPago, setProcessingPago] = useState(false);

    useEffect(() => {
        fetchUserPaymentData();
    }, []);

    const fetchUserPaymentData = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            return;
        }

        try {
            const responsePago = await axios.get(`${API_URL}/private/pagos/${user.id_usuario}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { fechaPago } = responsePago.data;
            setFechaPago(fechaPago);

            const responseMembresia = await axios.get(`${API_URL}/private/membresias/${user.id_membresia}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { tipo_membresia, precio } = responseMembresia.data;
            setMembresia({ tipo: tipo_membresia, precio });

            if (tipo_membresia === 'trabajador') {
                setPagoRealizado(true);
                setLoading(false);
                return;
            }

            if (!fechaPago) {
                setPagoRealizado(false);
            } else {
                const currentDate = new Date();
                const pagoDate = new Date(fechaPago);
                const pagoRealizadoEsteMes =
                    currentDate.getFullYear() === pagoDate.getFullYear() &&
                    currentDate.getMonth() === pagoDate.getMonth();
                setPagoRealizado(pagoRealizadoEsteMes);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleMakePayment = async () => {
        setProcessingPago(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            setProcessingPago(false);
            return;
        }

        try {
            await axios.post(
                `${API_URL}/private/pagos/${user.id_usuario}`,
                {
                    fechaPago: new Date().toISOString().split('T')[0],
                    monto: membresia.precio,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Pago realizado', 'El pago se ha registrado con éxito');
            fetchUserPaymentData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo realizar el pago');
        } finally {
            setProcessingPago(false);
        }
    };

    return (
        <ImageBackground
            source={require('../assets/fondoLogin.webp')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.title}>Estado del Pago</Text>
                        <Text style={styles.subtitle}>Usuario: {user.nombre} {user.apellido}</Text>

                        {loading ? (
                            <ActivityIndicator animating={true} size="large" color="#6200ee" />
                        ) : membresia.tipo === 'trabajador' ? (
                            <View style={styles.highlightCard}>
                                <Text style={styles.highlightText}>No procede pago para miembros con la membresía de trabajador.</Text>
                            </View>
                        ) : pagoRealizado ? (
                            <View style={styles.highlightCard}>
                                <Text style={styles.highlightText}>La cuota de este mes ya está pagada.</Text>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.highlightCard}>
                                    <Text style={styles.highlightText}>El pago no ha sido realizado este mes.</Text>
                                </View>
                                <Text style={styles.message}>
                                    Cantidad a pagar: <Text style={styles.price}>{membresia.precio}€</Text>
                                </Text>
                                <Button
                                    mode="contained"
                                    onPress={handleMakePayment}
                                    loading={processingPago}
                                    style={styles.paymentButton}
                                    labelStyle={styles.paymentButtonText}
                                    disabled={processingPago}
                                >
                                    Proceder al pago
                                </Button>
                            </View>
                        )}
                    </Card.Content>
                </Card>
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '90%',
        padding: 20,
        borderRadius: 15,
        backgroundColor: '#ffffff',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    highlightCard: {
        backgroundColor: '#6200ee',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    highlightText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    price: {
        fontWeight: 'bold',
        color: '#28a745',
    },
    paymentButton: {
        backgroundColor: '#28a745',
        marginTop: 20,
        borderRadius: 10,
        paddingVertical: 8,
    },
    paymentButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
