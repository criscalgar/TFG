import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    ImageBackground,
    ScrollView,
    LogBox,
    Modal
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

LogBox.ignoreLogs([
    'VirtualizedLists should never be nested inside plain ScrollViews'
]);


const HorariosLaboralesScreen = ({navigation}) => {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalVisible, setModalVisible] = useState(false);


    useEffect(() => {
        fetchHorarios();
        
        
    }, []);

    const fetchHorarios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/private/horarios-laborales`);

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const horariosFiltrados = response.data.filter((h) => {
                const fechaHorario = new Date(h.fecha);
                return fechaHorario >= hoy;
            });

            setHorarios(horariosFiltrados);
        } catch (error) {
            console.error('Error obteniendo horarios:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // 📌 Filtrar horarios por fecha (día y mes) y por nombre
    const horariosFiltrados = horarios.filter((h) =>
        (filtroFecha === '' || h.fecha.includes(filtroFecha)) &&
        (filtroNombre === '' || `${h.nombre} ${h.apellido}`.toLowerCase().includes(filtroNombre.toLowerCase()))
    );

    // 📌 Eliminar un horario laboral
    const eliminarHorario = async (id_horario) => {
        try {
            await axios.delete(`${API_URL}/private/horarios-laborales/${id_horario}`);
            Alert.alert('Horario eliminado');
            fetchHorarios();
        } catch (error) {
            console.error('Error eliminando horario:', error);
        }
    };
    

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.overlay}>
                        <View style={styles.titleContainer}>
                            <Icon name="calendar" size={34} color="#fff" />
                            <Text style={styles.title}>Horarios laborales</Text>
                        </View>
                        <View style={styles.underline} />

                        {/* 🔹 Botón para crear horarios */}
                        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('HorarioLaboral', { screen: 'nuevoHorario'})}>
                            <Icon name="plus-circle" size={26} color="#fff" />
                            <Text style={styles.addButtonText}>Agregar Horario</Text>
                        </TouchableOpacity>

                        {/* 🔍 Input para filtrar por nombre */}
                        <View style={styles.searchContainer}>
                            <Icon name="account-search" size={24} color="#007bff" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Filtrar por nombre"
                                placeholderTextColor="#999"
                                value={filtroNombre}
                                onChangeText={setFiltroNombre}
                            />
                            {filtroNombre.length > 0 && (
                                <TouchableOpacity onPress={() => setFiltroNombre('')}>
                                    <Icon name="close-circle" size={24} color="#ff4d4d" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* 🔍 Input para filtrar por fecha */}
                        <View style={styles.searchContainer}>
                            <Icon name="calendar-search" size={24} color="#007bff" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Filtrar por fecha (MM-DD)"
                                placeholderTextColor="#999"
                                value={filtroFecha}
                                onChangeText={(text) => {
                                    let formattedText = text.replace(/[^0-9]/g, ""); // Permitir solo números
                                    if (formattedText.length > 2) {
                                        formattedText = formattedText.slice(0, 2) + '-' + formattedText.slice(2, 4);
                                    }
                                    setFiltroFecha(formattedText);
                                }}
                                keyboardType="numeric"
                                maxLength={5}
                            />
                            {filtroFecha.length > 0 && (
                                <TouchableOpacity onPress={() => setFiltroFecha('')}>
                                    <Icon name="close-circle" size={24} color="#ff4d4d" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#007bff" />
                        ) : (
                            <FlatList
                                data={horariosFiltrados}
                                keyExtractor={(item) => item.id_horario.toString()}
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled={true}
                                ListEmptyComponent={() => (
                                    <Text style={styles.noData}>No hay horarios disponibles</Text>
                                )}
                                renderItem={({ item }) => (
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.userName}>{item.nombre} {item.apellido}</Text>
                                            <Icon name="clock-outline" size={20} color="#666" />
                                        </View>
                                        <Text style={styles.dateText}>
                                            📅 {(() => {
                                                const fecha = new Date(item.fecha);
                                                const dia = String(fecha.getDate()).padStart(2, '0');
                                                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                                                return `${dia}/${mes}`;
                                            })()}
                                        </Text>

                                        <Text style={styles.timeText}>
                                            🕒 {item.hora_entrada.slice(0, 5)} - {item.hora_salida.slice(0, 5)}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => eliminarHorario(item.id_horario)}
                                        >
                                            <Text style={styles.deleteText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    scrollContainer: { flexGrow: 1 },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 60,
        paddingHorizontal: 20,
    },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
    underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: '90%',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 220,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    userName: { fontSize: 18, fontWeight: 'bold', color: 'black' },
    dateText: { fontSize: 16, color: '#555' },
    timeText: { fontSize: 16, color: '#000', marginVertical: 5 },
    deleteButton: { marginTop: 10, backgroundColor: '#ff4d4d', padding: 10, borderRadius: 5, alignItems: 'center', width: 100, alignSelf: 'center' },
    deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    noData: { textAlign: 'center', fontSize: 16, color: '#fff', marginTop: 20 },
    addButton: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#007bff', borderRadius: 10, marginBottom: 15 },
    addButtonText: { color: '#fff', fontSize: 16, marginLeft: 10 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
    input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
    modalButton: { padding: 10, backgroundColor: '#007bff', marginTop: 10, borderRadius: 5 },
    modalButtonCancel: { padding: 10, backgroundColor: '#007bff', marginTop: 10, borderRadius: 5, backgroundColor: 'red' },
    modalButtonText: { color: '#fff', textAlign: 'center' }
});

export default HorariosLaboralesScreen;
