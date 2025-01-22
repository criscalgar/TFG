import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UsersPaymentsScreen({ route }) {
    const { userId } = route.params; // Recibimos el id del usuario desde la pantalla anterior
    const [pagoRealizado, setPagoRealizado] = useState(null);
    const [fechaPago, setFechaPago] = useState(null);

    useEffect(() => {
        checkUserPayment();
    }, []);

    const checkUserPayment = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/usuarios/${userId}/pago`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Guardar la fecha del último pago
            const pagoFecha = response.data.fechaPago; // Asume que 'fechaPago' es devuelta en formato "YYYY-MM-DD"
            setFechaPago(pagoFecha);
            
            // Verificar si el pago es del mes y año actuales
            const currentDate = new Date();
            const pagoDate = new Date(pagoFecha);

            const pagoRealizadoEsteMes = currentDate.getFullYear() === pagoDate.getFullYear() && currentDate.getMonth() === pagoDate.getMonth();
            setPagoRealizado(pagoRealizadoEsteMes);

        } catch (error) {
            Alert.alert('Error', 'No se pudo verificar el pago');
        }
    };

    const handleMakePayment = async () => {
        // Lógica para realizar el pago
        Alert.alert('Pago realizado', 'El pago se ha realizado con éxito');
        // Después de hacer el pago, puedes hacer algo como redirigir o actualizar la base de datos
    };

    return (
        <View>
            <Text>Estado del Pago</Text>
            {pagoRealizado === null ? (
                <Text>Cargando...</Text>
            ) : pagoRealizado ? (
                <Text>La cuota de este mes ya está pagada.</Text>
            ) : (
                <View>
                    <Text>El pago no ha sido realizado este mes.</Text>
                    <Button title="Realizar pago" onPress={handleMakePayment} />
                </View>
            )}
        </View>
    );
}
