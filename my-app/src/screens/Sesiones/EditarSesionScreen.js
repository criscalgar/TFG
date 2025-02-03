import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    ScrollView,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditarSesionScreen({ route, navigation }) {
    const { sesion } = route.params; // Datos de la sesión a editar
    const [horaInicio, setHoraInicio] = useState(sesion.hora_inicio.slice(0, 5));
    const [horaFin, setHoraFin] = useState(sesion.hora_fin.slice(0, 5));
    const [capacidadMaxima, setCapacidadMaxima] = useState(sesion.capacidad_maxima.toString());

    // Validación de la hora de inicio y fin
    const validarHoras = (inicio, fin) => {
        const [hInicio, mInicio] = inicio.split(':').map(Number);
        const [hFin, mFin] = fin.split(':').map(Number);

        return hInicio < hFin || (hInicio === hFin && mInicio < mFin);
    };

    const handleActualizarSesion = async () => {
        if (!horaInicio || !horaFin || !capacidadMaxima) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (!validarHoras(horaInicio, horaFin)) {
            Alert.alert('Error', 'La hora de inicio debe ser menor que la hora de fin.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.put(
                `${API_URL}/private/sesiones/${sesion.id_sesion}`,
                { hora_inicio: horaInicio, hora_fin: horaFin, capacidad_maxima: parseInt(capacidadMaxima) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Sesión actualizada correctamente');
            navigation.goBack(); 
        } catch (error) {
            console.error('Error al actualizar la sesión:', error);
            Alert.alert('Error', 'No se pudo actualizar la sesión');
        }
    };

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.container}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.title}>Editar sesión</Text>

                                {/* Campo de fecha NO EDITABLE */}
                                <TextInput
                                    style={[styles.input, styles.disabledInput]}
                                    placeholder="Fecha (YYYY-MM-DD)"
                                    value={sesion.fecha}
                                    editable={false}
                                />
                                
                                {/* Campos editables */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hora de inicio (HH:mm)"
                                    value={horaInicio}
                                    onChangeText={setHoraInicio}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hora de fin (HH:mm)"
                                    value={horaFin}
                                    onChangeText={setHoraFin}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Capacidad máxima"
                                    keyboardType="numeric"
                                    value={capacidadMaxima}
                                    onChangeText={(text) => setCapacidadMaxima(text === '' ? '' : text)}
                                />

                                {/* Botones alineados verticalmente */}
                                <View style={styles.buttonContainer}>
                                    <Button mode="contained" onPress={handleActualizarSesion} style={styles.saveButton}>
                                        Guardar Cambios
                                    </Button>
                                    <Button mode="contained" onPress={() => navigation.goBack()} style={styles.cancelButton}>
                                        Cancelar
                                    </Button>
                                </View>

                            </Card.Content>
                        </Card>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
        width: '100%',
    },
    disabledInput: {
        backgroundColor: '#e0e0e0',
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'column', // Para que los botones estén uno encima del otro
        alignItems: 'stretch',
        width: '100%',
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: '#28a745', // Verde
        marginBottom: 10,
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#dc3545', // Rojo
        marginBottom: 10,
        width: '100%',
    },
    reservasButton: {
        backgroundColor: '#007bff', // Azul
        width: '100%',
    },
});


