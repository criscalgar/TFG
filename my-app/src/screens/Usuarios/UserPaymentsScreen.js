import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UsersPaymentsScreen({ route, navigation}) {
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

    const handleMakePayment = () => {
        navigation.navigate('SimulatedPayment', {
          onPaymentSuccess: async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
              Alert.alert('Error', 'No estás autenticado');
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
      
              Alert.alert('✅ Pago realizado', 'El pago se ha registrado con éxito');
              fetchUserPaymentData(); // Refresca los datos
            } catch (error) {
              Alert.alert('Error', 'No se pudo registrar el pago');
            }
          }
        });
      };
      

    return (
        <ImageBackground
            source={require('../../assets/fondoLogin.webp')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.title}>Estado del pago</Text>
                        <Text style={styles.subtitle}>Usuario: {user.nombre} {user.apellido}</Text>

                        {loading ? (
                            <ActivityIndicator animating={true} size="large" color="#6200ee" />
                        ) : membresia.tipo === 'trabajador' ? (
                            <View style={styles.successContainer}>
                                <MaterialCommunityIcons name="cash-remove" size={30} color="red" />
                                <Text style={styles.successText}>CUOTA GRATUITA</Text>
                            </View>

                        ) : pagoRealizado ? (
                            <View style={styles.successContainer}>
                                <MaterialCommunityIcons name="check-circle" size={30} color="green" />
                                <Text style={styles.successText}>LA CUOTA DE ESTE MES YA ESTÁ PAGADA</Text>
                            </View>


                        ) : (
                            <View>
                                <Text style={styles.message}>
                                    Cantidad a pagar: <Text style={styles.price}>{membresia.precio}€</Text>
                                </Text>

                                <View style={styles.alertContainer}>
                                    <MaterialCommunityIcons name="alert" size={30} color="orange" />
                                    <Text style={styles.alertText}>¡EL PAGO DE ESTE MES NO HA SIDO REALIZADO!</Text>
                                </View>

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
        fontWeight: 'bold'
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
    alertContainer: {
        flexDirection: 'row',  // 📌 Alinea icono y texto en línea
        alignItems: 'center',   // 📌 Centra verticalmente
        padding: 15,           // 📌 Espaciado interno
        width: '100%',          // 📌 Ancho adaptable
        alignSelf: 'flex-start',  // 📌 Mueve la vista más a la izquierda
        marginLeft: -20,        // 📌 Ajusta el margen izquierdo
    },
    alertText: {
        color: 'black',  // 📌 Texto en negro
        fontSize: 16,
        fontWeight: 'bold',  // 📌 Texto en negrita
        marginLeft: 10, // 📌 Espacio entre el icono y el texto
        textAlign: 'justify', // 📌 Justifica el texto
        flexShrink: 1, // 📌 Evita que el texto desborde y se ajuste correctamente
    },
    successContainer: {
        flexDirection: 'row',  // 📌 Mantiene el icono y texto en la misma línea
        alignItems: 'center',   // 📌 Centra verticalmente el icono y el texto
        padding: 5,           // 📌 Espaciado interno
        width: '100%',         // 📌 Ocupar todo el ancho disponible
        justifyContent: 'flex-start',  // 📌 Mueve el contenido hacia la izquierda
        marginVertical: 1,    // 📌 Espaciado superior e inferior
    },
    successText: {
        color: 'black',  // 📌 Texto en negro
        fontSize: 16,
        fontWeight: 'bold',  // 📌 Texto en negrita
        marginLeft: 10, // 📌 Espacio entre el icono y el texto
        textAlign: 'left', // 📌 Asegura alineación izquierda sin justificación innecesaria
        flexShrink: 1, // 📌 Evita que el texto se desborde
    },
});
