import React, { useEffect, useState } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    ImageBackground, 
    Animated 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Iconos atractivos
import { API_URL } from '../../config';

export default function RegisterScreen({ navigation }) {
    const [anos, setAnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const animatedScale = new Animated.Value(1); // Efecto de presión

    useEffect(() => {
        const fetchAnos = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await fetch(`${API_URL}/private/turnos/anos`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Error al obtener los años.');
                const data = await response.json();
                setAnos(data);
            } catch (error) {
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnos();
    }, []);

    const handlePressIn = () => {
        Animated.spring(animatedScale, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(animatedScale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <ImageBackground 
            source={require('../../assets/fondoLogin.webp')} 
            style={styles.background} 
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.header}>📆 Selecciona un año</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                    <FlatList
                        data={anos}
                        keyExtractor={(item) => item.ano.toString()}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                                <TouchableOpacity 
                                    style={styles.button} 
                                    onPress={() => navigation.navigate('MonthSelection', { ano: item.ano })}
                                    activeOpacity={0.7}
                                    onPressIn={handlePressIn}
                                    onPressOut={handlePressOut}
                                >
                                    <Icon name="calendar-star" size={24} color="#fff" style={styles.icon} />
                                    <Text style={styles.buttonText}>{item.ano}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    />
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    /* Fondo de la pantalla */
    background: { 
        flex: 1, 
        width: '100%', 
        height: '100%' 
    },

    /* Contenedor principal */
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        justifyContent: 'center', // Centrar elementos en pantalla
    },

    /* Lista de años */
    list: { 
        paddingBottom: 20, 
        alignItems: 'center' 
    },

    /* Encabezado de la pantalla */
    header: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20, 
        color: '#ffffff', 
        textShadowColor: 'rgba(0, 0, 0, 0.5)', 
        textShadowOffset: { width: 2, height: 2 }, 
        textShadowRadius: 3 
    },

    /* Botón de selección de año */
    button: { 
        flexDirection: 'row', // Icono + texto en línea
        alignItems: 'center',
        backgroundColor: '#82caff', // Azul claro atractivo
        paddingVertical: 15, 
        paddingHorizontal: 30, 
        borderRadius: 15, 
        marginBottom: 15, 
        justifyContent: 'center', 
        width: 250, 
        elevation: 5, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 2, height: 3 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4, 
        borderWidth: 1, 
        borderColor: '#fff', // Bordes blancos para un mejor contraste
    },

    /* Icono dentro del botón */
    icon: {
        marginRight: 10, // Espaciado entre icono y texto
    },

    /* Texto dentro del botón */
    buttonText: { 
        fontSize: 20, 
        color: '#000', // Letra negra para mejor contraste con el azul claro
        fontWeight: 'bold' 
    },
});
