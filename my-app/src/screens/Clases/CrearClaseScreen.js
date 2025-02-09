import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ImageBackground,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CrearClaseScreen({ navigation }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipoClase, setTipoClase] = useState('');
    const [tiposDisponibles, setTiposDisponibles] = useState([]);

    // Lista de tipos de clase predefinidos
    const tiposClases = ['Yoga', 'Crossfit', 'Zumba', 'Pilates', 'Boxeo', 'Ciclismo', 'Natación'];

    useEffect(() => {
        fetchClasesExistentes();
    }, []);

    const fetchClasesExistentes = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/clases`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const clasesExistentes = response.data.map((clase) => clase.tipo_clase);
            const tiposFiltrados = tiposClases.filter((tipo) => !clasesExistentes.includes(tipo));

            setTiposDisponibles(tiposFiltrados);
        } catch (error) {
            console.error('Error al obtener clases existentes:', error);
            Alert.alert('Error', 'No se pudieron cargar las clases existentes');
        }
    };

    const handleCrearClase = async () => {
        if (!tipoClase || !descripcion.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.post(
                `${API_URL}/private/clases`,
                { tipo_clase: tipoClase, descripcion },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Clase creada correctamente', [
                { text: 'OK', onPress: () => navigation.navigate('ManageClasses') }
            ]);
            
        } catch (error) {
            console.error('Error al crear la clase:', error);
            Alert.alert('Error', 'No se pudo crear la clase');
        }
    };

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                        <View style={styles.overlay}>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.title}>Crear nueva clase</Text>
                                    
                                    {/* Selector de tipo de clase */}
                                    <View style={styles.dropdown}>
                                        {tiposDisponibles.length > 0 ? (
                                            tiposDisponibles.map((tipo) => (
                                                <Button
                                                    key={tipo}
                                                    mode={tipoClase === tipo ? 'contained' : 'outlined'}
                                                    onPress={() => setTipoClase(tipo)}
                                                    style={[
                                                        styles.tipoClaseButton,
                                                        tipoClase === tipo && styles.selectedButton,
                                                    ]}
                                                >
                                                    {tipo}
                                                </Button>
                                            ))
                                        ) : (
                                            <Text style={styles.noDisponiblesText}>
                                                No hay tipos de clase disponibles para agregar.
                                            </Text>
                                        )}
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Descripción"
                                        multiline
                                        numberOfLines={3}
                                        value={descripcion}
                                        onChangeText={setDescripcion}
                                    />

                                    <Button mode="contained" onPress={handleCrearClase} style={styles.createButton}>
                                        Crear Clase
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
    dropdown: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    tipoClaseButton: {
        margin: 5,
    },
    selectedButton: {
        backgroundColor: '#007bff',
    },
    createButton: {
        backgroundColor: '#28a745',
        marginTop: 10,
    },
    noDisponiblesText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 10,
    },
});



