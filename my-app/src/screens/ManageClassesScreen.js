import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config'; // Usa tu archivo de configuración

export default function ManageClassesScreen() {
    const [clases, setClases] = useState([]);
    const [newClass, setNewClass] = useState({ nombre: '', descripcion: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClases();
    }, []);

    // Obtener la lista de clases
    const fetchClases = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/private/clases`);
            setClases(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las clases');
        } finally {
            setLoading(false);
        }
    };

    // Función para agregar una nueva clase
    const handleAddClass = async () => {
        if (!newClass.nombre || !newClass.descripcion) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/private/clases`, newClass, {
                headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` },
            });
            Alert.alert('Éxito', 'Clase agregada');
            fetchClases(); // Actualiza la lista de clases
        } catch (error) {
            Alert.alert('Error', 'No se pudo agregar la clase');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestionar Clases</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre de la clase"
                value={newClass.nombre}
                onChangeText={(text) => setNewClass({ ...newClass, nombre: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={newClass.descripcion}
                onChangeText={(text) => setNewClass({ ...newClass, descripcion: text })}
            />
            <Button title="Agregar Clase" onPress={handleAddClass} />

            {loading ? (
                <Text>Cargando clases...</Text>
            ) : (
                <FlatList
                    data={clases}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.classCard}>
                            <Text>{item.nombre}</Text>
                            <Text>{item.descripcion}</Text>
                        </View>
                    )}
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        width: '80%',
    },
    classCard: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 5,
    },
});
