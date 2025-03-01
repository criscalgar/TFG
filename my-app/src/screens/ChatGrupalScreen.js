import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Animated, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatGrupalScreen = () => {
    const [messages, setMessages] = useState([]);
    const [userType, setUserType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [messageText, setMessageText] = useState("");

    const keyboardHeight = useState(new Animated.Value(10))[0];

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
            Animated.timing(keyboardHeight, {
                toValue: event.endCoordinates.height - 80, // Ajusta la altura cuando el teclado se abre
                duration: 200,
                useNativeDriver: false
            }).start();
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(keyboardHeight, {
                toValue: 10, // Vuelve a la posición original
                duration: 200,
                useNativeDriver: false
            }).start();
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        fetchUserData();
        fetchMessages();
        const interval = setInterval(fetchMessages, 1000); // Actualiza mensajes cada segundo

        return () => clearInterval(interval); // Limpia el intervalo al desmontar
    }, []);



    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserType(user.tipo_usuario);
                setUserId(user.id_usuario);
            }
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/private/mensajes`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error obteniendo mensajes:', error);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim()) return;

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await axios.post(`${API_URL}/private/mensajes`, {
                id_usuario: userId,
                texto: messageText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newMessage = {
                id_mensaje: response.data.id_mensaje,
                id_usuario: userId,
                nombre: "Tú", // Puedes obtener el nombre del usuario desde AsyncStorage si es necesario
                texto: messageText,
                timestamp: new Date().toISOString(), // Se usa la fecha actual
                fecha_envio: new Date().toISOString().split('T')[0] // Solo la fecha sin hora
            };

            setMessages(prevMessages => [newMessage, ...prevMessages]); // Agregar mensaje sin esperar el fetch
            setMessageText(""); // Limpiar la caja de texto
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    };


    const renderMessage = ({ item }) => {
        const isWorker = item.tipo_usuario !== 'cliente';
        const alignment = isWorker ? styles.workerMessage : styles.clientMessage;
        const backgroundColor = isWorker ? '#DCF8C6' : '#FFFFFF';
        const textAlign = isWorker ? 'left' : 'right';

        const date = new Date(item.timestamp);
        const formattedTime = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        return (
            <View style={[styles.messageContainer, alignment]}>
                <View style={[styles.messageBubble, { backgroundColor }]}>
                    <Text style={[styles.userName, { textAlign }]}>{isWorker ? `${item.nombre} (${item.tipo_usuario})` : `${item.nombre} ${item.apellido}`}</Text>
                    <Text style={[styles.messageText, { textAlign }]}>{item.texto}</Text>
                    <View style={styles.timestampContainer}>
                        {isWorker ? (
                            <Text style={[styles.timestamp, styles.timestampRight]}>
                                {formattedTime} {formattedDate}
                            </Text>
                        ) : (
                            <Text style={[styles.timestamp, styles.timestampLeft]}>
                                {formattedTime} {formattedDate}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <View style={styles.titleContainer}>
                        <Icon name="chat" size={34} color="#fff" />
                        <Text style={styles.title}>Chat grupal</Text>
                    </View>
                    <View style={styles.underline} />

                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id_mensaje.toString()}
                        contentContainerStyle={styles.chatContainer}
                        keyboardShouldPersistTaps="handled" // Permite tocar la lista mientras el teclado está abierto
                        showsVerticalScrollIndicator={false} // Oculta el scroll visual
                    />
                    {/* Barra de entrada de mensajes */}

                    <Animated.View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Escribe un mensaje"
                            placeholderTextColor="#666"
                            value={messageText}
                            onChangeText={setMessageText}
                        />
                        <TouchableOpacity onPress={sendMessage}>
                            <Icon name="send" size={24} color="#007bff" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    flexContainer: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 60,
    },
    chatContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    underline: {
        width: '60%',
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        marginBottom: 15,
    },
    messageContainer: {
        marginBottom: 5,
        maxWidth: '95%',
    },
    clientMessage: {
        alignSelf: 'flex-end',
    },
    workerMessage: {
        alignSelf: 'flex-start',
    },
    userName: {
        fontWeight: 'bold',
        color: '#075E54',
        marginBottom: 3,
    },
    messageBubble: {
        borderRadius: 8,
        padding: 8,
        elevation: 2,
    },
    messageText: {
        fontSize: 15,
        color: '#000',
    },
    timestampContainer: {
        marginTop: 3,
    },
    timestamp: {
        fontSize: 11,
        color: '#666',
    },
    timestampLeft: {
        textAlign: 'left',
        alignSelf: 'flex-start',
    },
    timestampRight: {
        textAlign: 'right',
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 30,
        width: '95%',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 10, // Se ajustará dinámicamente
    },
    emojiIcon: {
        marginRight: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingHorizontal: 8,
    },
});

export default ChatGrupalScreen;