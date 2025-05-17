import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Alert,
    Modal,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NuevoHorarioScreen({ navigation }) {
    const [horarioData, setHorarioData] = useState({
        id_usuario: '',
        nombre_usuario: '',
        fecha: '',
        hora_entrada: '',
        hora_salida: ''
    });

    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingUsuarios, setLoadingUsuarios] = useState(true);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/usuarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const usuariosFiltrados = response.data.filter(
                (u) => u.tipo_usuario === 'entrenador' || u.tipo_usuario === 'administrador'
            );

            setUsuarios(usuariosFiltrados);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoadingUsuarios(false);
        }
    };

    const handleRegisterHorario = async () => {
        if (!horarioData.id_usuario || !horarioData.fecha || !horarioData.hora_entrada || !horarioData.hora_salida) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.post(
                `${API_URL}/private/horarios-laborales`,
                {
                    id_usuario: horarioData.id_usuario,
                    fecha: horarioData.fecha,
                    hora_entrada: horarioData.hora_entrada,
                    hora_salida: horarioData.hora_salida,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Horario registrado con éxito');
            navigation.goBack();
        } catch (error) {
            console.error('Error al registrar horario:', error);
            // Mostrar mensaje de error recibido del backend, si existe
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert('Error', error.response.data.error);
            } else {
                Alert.alert('Error', 'No se pudo registrar el horario');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFechaChange = (text) => {
        // Permitir solo números
        let formattedText = text.replace(/[^0-9]/g, "");

        if (formattedText.length > 4) {
            formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4);
        }
        if (formattedText.length > 7) {
            formattedText = formattedText.slice(0, 7) + '-' + formattedText.slice(7, 10);
        }

        setHorarioData({ ...horarioData, fecha: formattedText });
    };

    const handleHoraChange = (text, field) => {
        let formattedText = text.replace(/[^0-9]/g, "");

        if (formattedText.length > 2) {
            formattedText = formattedText.slice(0, 2) + ':' + formattedText.slice(2, 4);
        }

        setHorarioData({ ...horarioData, [field]: formattedText });
    };


    const handleSelectUsuario = (usuario) => {
        setSelectedUsuario(usuario);
        setHorarioData({
            ...horarioData,
            id_usuario: usuario.id_usuario,
            nombre_usuario: `${usuario.nombre} ${usuario.apellido}`
        });
        setModalVisible(false);
    };

    return (
        <ImageBackground
            source={require('../../assets/fondoLogin.webp')}
            style={styles.background}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                        <View style={styles.titleContainer}>
                            <Icon name="calendar-plus" size={34} color="#fff" />
                            <Text style={styles.title}>Nuevo horario</Text>
                        </View>
                        <View style={styles.underline} />

                        <Card style={styles.card}>
                            <Card.Content>
                                {/* Seleccionar Usuario */}
                                <TouchableOpacity style={styles.usuarioButton} onPress={() => setModalVisible(true)}>
                                    <Text style={selectedUsuario ? styles.selectorText : styles.placeholderText}>
                                        {selectedUsuario
                                            ? `${selectedUsuario.nombre} ${selectedUsuario.apellido} (${selectedUsuario.tipo_usuario})`
                                            : 'Seleccionar Usuario'}
                                    </Text>
                                    <Icon name="account-search" size={22} color="#007bff" />
                                </TouchableOpacity>

                                {/* ID Usuario */}
                                <View style={styles.inputContainer}>
                                    <Icon name="identifier" size={22} color="#555" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputReadonly]}
                                        placeholder="ID Usuario"
                                        value={horarioData.id_usuario ? horarioData.id_usuario.toString() : ''}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Icon name="calendar" size={22} color="#555" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Fecha (YYYY-MM-DD)"
                                        value={horarioData.fecha}
                                        onChangeText={handleFechaChange} // ✅ Formatea automáticamente con guiones
                                        keyboardType="numeric"
                                        maxLength={10} // ✅ Evita que ingresen más caracteres
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Icon name="clock-time-eight-outline" size={22} color="#555" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Hora Entrada (HH:MM)"
                                        value={horarioData.hora_entrada}
                                        onChangeText={(text) => handleHoraChange(text, 'hora_entrada')} // ✅ Formatea con dos puntos
                                        keyboardType="numeric"
                                        maxLength={5}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Icon name="clock-time-five-outline" size={22} color="#555" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Hora Salida (HH:MM)"
                                        value={horarioData.hora_salida}
                                        onChangeText={(text) => handleHoraChange(text, 'hora_salida')} // ✅ Formatea con dos puntos
                                        keyboardType="numeric"
                                        maxLength={5}
                                    />
                                </View>


                                <Modal visible={modalVisible} transparent={true} animationType="slide">
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContainer}>
                                            <Text style={styles.modalTitle}>Selecciona un Usuario</Text>

                                            {loadingUsuarios ? (
                                                <ActivityIndicator size="large" color="#007bff" />
                                            ) : (
                                                <ScrollView>
                                                    {usuarios.map((usuario) => (
                                                        <TouchableOpacity
                                                            key={usuario.id_usuario}
                                                            style={[
                                                                styles.modalOption,
                                                                selectedUsuario?.id_usuario === usuario.id_usuario && styles.selectedOption
                                                            ]}
                                                            onPress={() => handleSelectUsuario(usuario)}
                                                        >
                                                            <Text style={styles.modalOptionText}>
                                                                {usuario.nombre} {usuario.apellido} ({usuario.tipo_usuario})
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}

                                            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                                Cerrar
                                            </Button>
                                        </View>
                                    </View>
                                </Modal>

                                <Button mode="contained" onPress={handleRegisterHorario} style={styles.registerButton} loading={loading}>
                                    Registrar Horario
                                </Button>
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // 🔹 Mayor contraste con el fondo
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8, // 🔹 Sombra más oscura
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 24, // 🔹 Hice el título más grande
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.8)', // 🔹 Sombra directa en el texto
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    underline: {
        width: '60%',
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        marginBottom: 15,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 12,
        elevation: 5,
        backgroundColor: '#fff',
        marginTop: 20, // 🔹 Ajusté la posición
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 12,
        paddingHorizontal: 12, // 🔹 Mayor espacio lateral
        width: '100%', // 🔹 Reduce el ancho del campo
        alignSelf: 'center', // 🔹 Centra los campos en la pantalla
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1, // 🔹 Hace que el TextInput se ajuste dentro del contenedor
        paddingVertical: 10, // 🔹 Mayor comodidad de escritura
        fontSize: 16,
        color: '#333',
    },
    inputReadonly: {
        backgroundColor: '#f0f0f0',
        color: '#666',
    },
    usuarioButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007bff',
        padding: 14,
        borderRadius: 10,
        width: '100%',
        backgroundColor: '#fff',
        marginBottom: 15
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // 🔹 Opacidad aumentada
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalOption: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        marginVertical: 6,
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: 'blue',
    },
    registerButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
    },
});