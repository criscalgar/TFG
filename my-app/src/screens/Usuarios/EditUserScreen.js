import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Modal,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
} from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

export default function EditUserScreen({ route, navigation }) {
    const { user } = route.params;
    const [newUser, setNewUser] = useState({
        id_usuario: user?.id_usuario || '',
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || '',
        tipo_usuario: user?.tipo_usuario || '',
        id_membresia: user?.id_membresia || null,
    });

    const [membresia, setMembresia] = useState({ tipo: '', precio: 0 });
    const [membresias, setMembresias] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMembresias();
        if (user.id_membresia) {
            fetchMembresia(user.id_membresia);
        } else {
            Alert.alert('Error', 'El usuario no tiene una membresía asignada');
        }
    }, [user]);

    // Obtener todas las membresías disponibles
    const fetchMembresias = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/membresias`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMembresias(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las membresías');
        }
    };

    // Obtener la membresía actual del usuario
    const fetchMembresia = async (idMembresia) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            const response = await axios.get(`${API_URL}/private/membresias/${idMembresia}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data) {
                setMembresia({
                    tipo: response.data.tipo_membresia || 'Sin asignar',
                    precio: response.data.precio || 0,
                });
            } else {
                setMembresia({ tipo: 'Sin asignar', precio: 0 });
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la membresía');
        }
    };

    // Guardar cambios en el usuario
    const handleSaveChanges = async () => {
        if (!newUser.nombre || !newUser.apellido || !newUser.email || !newUser.tipo_usuario) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }

            await axios.put(`${API_URL}/private/usuarios/${user.email}`, newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Éxito', 'Usuario modificado');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo modificar el usuario');
        }
    };

    const handleDeleteUser = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert('Error', 'No estás autenticado');
            return;
        }

        try {
            await axios.delete(`${API_URL}/private/usuarios/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Éxito', 'Usuario eliminado');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
        }
    };

    // Cambiar membresía del usuario
    const handleChangeMembresia = async (membresia) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No estás autenticado');
                return;
            }
    
            console.log("Actualizando membresía para:", user.email);
            console.log("Nueva membresía seleccionada:", membresia);
    
            // Usa la ruta correcta para actualizar todo el usuario
            const response = await axios.put(
                `${API_URL}/private/usuarios/${user.email}`,
                {
                    nombre: newUser.nombre,
                    apellido: newUser.apellido,
                    tipo_usuario: newUser.tipo_usuario,
                    id_membresia: membresia.id_membresia, // Actualizamos la membresía aquí
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            console.log("Respuesta de la API:", response.data);
    
            setMembresia({
                tipo: membresia.tipo_membresia,
                precio: membresia.precio,
            });
    
            setNewUser({ ...newUser, id_membresia: membresia.id_membresia });
            setModalVisible(false);
            Alert.alert("Éxito", "Membresía actualizada correctamente");
        } catch (error) {
            console.error("Error al actualizar membresía:", error.response?.data || error.message);
            Alert.alert('Error', `No se pudo actualizar la membresía: ${error.response?.data?.message || error.message}`);
        }
    };
    

    return (
        <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.titleCard}>
                    <Text style={styles.title}>Editar Usuario</Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={newUser.nombre}
                        onChangeText={(text) => setNewUser({ ...newUser, nombre: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Apellido"
                        value={newUser.apellido}
                        onChangeText={(text) => setNewUser({ ...newUser, apellido: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={newUser.email}
                        onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Tipo de usuario"
                        value={newUser.tipo_usuario}
                        onChangeText={(text) => setNewUser({ ...newUser, tipo_usuario: text })}
                    />
                    <TouchableOpacity style={styles.membresiaContainer} onPress={() => setModalVisible(true)}>
                        <Text style={styles.membresiaText}>Membresía: {membresia.tipo} ({membresia.precio}€)</Text>
                    </TouchableOpacity>

                    {/* Modal de selección de membresía */}
                    <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Selecciona una Membresía</Text>
                                <ScrollView>
                                    {membresias.map((membresia) => (
                                        <TouchableOpacity key={membresia.id_membresia} style={styles.modalOption} onPress={() => handleChangeMembresia(membresia)}>
                                            <Text style={styles.modalOptionText}>{membresia.tipo_membresia} ({membresia.precio}€)</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <PaperButton mode="contained" onPress={() => setModalVisible(false)}>Cerrar</PaperButton>
                            </View>
                        </View>
                    </Modal>
                    <PaperButton
                        mode="contained"
                        icon={() => <Icon name="save" size={20} color="#fff" />}
                        style={styles.saveButton}
                        onPress={handleSaveChanges}
                    >
                        Guardar Cambios
                    </PaperButton>

                    <PaperButton
                        mode="contained"
                        icon={() => <Icon name="delete" size={20} color="#fff" />}
                        style={styles.deleteButton}
                        onPress={handleDeleteUser}
                    >
                        Eliminar Usuario
                    </PaperButton>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    titleCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 5, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        alignItems: 'center',
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 15,
        width: '100%',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    saveButton: {
        backgroundColor: '#28a745',
        marginTop: 20,
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        marginTop: 10,
        width: '100%',
    },
    membresiaContainer: { padding: 15, backgroundColor: '#ddd', borderRadius: 5, marginBottom: 10 },
    membresiaText: {
        fontSize: 16,
        fontWeight: '600',
    },
   modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalOption: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        borderRadius: 5,
    },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
});

