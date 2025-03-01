import React, { useState, useEffect } from 'react';
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

export default function CrearSesionScreen({ route, navigation }) {
    const { id_clase } = route.params;
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [capacidadMaxima, setCapacidadMaxima] = useState('');
    const [idTrabajador, setIdTrabajador] = useState('');

    useEffect(() => {
        obtenerIdTrabajador();
    }, []);

    const obtenerIdTrabajador = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/trabajador`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data && response.data.id_trabajador) {
                setIdTrabajador(response.data.id_trabajador);
            } else {
                Alert.alert('Error', 'No se pudo obtener el ID del trabajador');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error al obtener el ID del trabajador:', error);
            Alert.alert('Error', 'No se pudo obtener el ID del trabajador');
            navigation.goBack();
        }
    };

    const validarHoras = (inicio, fin) => {
        const [hInicio, mInicio] = inicio.split(':').map(Number);
        const [hFin, mFin] = fin.split(':').map(Number);

        return hInicio < hFin || (hInicio === hFin && mInicio < mFin);
    };

    const handleCrearSesion = async () => {
        if (!fecha || !horaInicio || !horaFin || !capacidadMaxima) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (!validarHoras(horaInicio, horaFin)) {
            Alert.alert('Error', 'La hora de inicio debe ser menor que la hora de fin.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log('Token enviado:', token);

            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const nuevaSesion = {
                id_clase,
                id_trabajador: idTrabajador,
                fecha,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                capacidad_maxima: parseInt(capacidadMaxima),
            };

            await axios.post(`${API_URL}/private/sesiones`, nuevaSesion, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert('Éxito', 'Sesión creada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error al crear la sesión:', error);
            Alert.alert('Error', 'No se pudo crear la sesión');
        }
    };

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Ajusta el offset según sea necesario
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                        <View style={styles.overlay}>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.title}>Crear nueva sesión</Text>

                                    <TextInput
                                        style={[styles.input, styles.disabledInput]}
                                        placeholder="ID Clase"
                                        value={id_clase.toString()}
                                        editable={false}
                                    />
                                    <TextInput
                                        style={[styles.input, styles.disabledInput]}
                                        placeholder="ID Trabajador"
                                        value={idTrabajador.toString()}
                                        editable={false}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Fecha (YYYY-MM-DD)"
                                        value={fecha}
                                        onChangeText={setFecha}
                                    />
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
                                        onChangeText={setCapacidadMaxima}
                                    />

                                    <TextInput
                                        style={[styles.input, styles.disabledInput]}
                                        placeholder="Asistentes actuales"
                                        value="0"
                                        editable={false}
                                    />

                                    <Button mode="contained" onPress={handleCrearSesion} style={styles.createButton}>
                                        Crear Sesión
                                    </Button>
                                </Card.Content>
                            </Card>
                        </View>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overlay: {
        width: '100%',
        alignItems: 'center',
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
    createButton: {
        backgroundColor: '#28a745',
        marginTop: 10,
    },
});
