import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';

const TrainerScreen = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        // Obtener usuarios
        axios
            .get('http://localhost:3000/private/usuarios', {
                headers: { Authorization: `Bearer ${TOKEN}` }, // Reemplaza TOKEN con tu lógica de autenticación
            })
            .then((response) => setUsuarios(response.data))
            .catch((error) => Alert.alert('Error', 'No se pudo cargar la lista de usuarios'));
    }, []);

    const registrarAsistencia = (tipo) => {
        axios
            .post(
                `http://localhost:3000/private/turnos/${tipo}`,
                {},
                { headers: { Authorization: `Bearer ${TOKEN}` } }
            )
            .then(() => Alert.alert('Éxito', `Asistencia ${tipo} registrada`))
            .catch((error) => Alert.alert('Error', `No se pudo registrar la asistencia de ${tipo}`));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel del Entrenador</Text>

            <Button title="Registrar Entrada" onPress={() => registrarAsistencia('entrada')} />
            <Button title="Registrar Salida" onPress={() => registrarAsistencia('salida')} />

            <Text style={styles.subtitle}>Usuarios:</Text>
            <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <Text>{item.nombre} {item.apellido}</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 18, marginTop: 20 },
});

export default TrainerScreen;
