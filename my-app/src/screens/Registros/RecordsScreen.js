import React, { useEffect, useState } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    FlatList, 
    Alert, 
    ActivityIndicator, 
    ImageBackground, 
    Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title } from 'react-native-paper';
import { API_URL } from '../../config';

export default function RecordsScreen({ route, navigation }) {
    const { ano, mes } = route.params;
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistros = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) throw new Error('No se encontró el token de autenticación.');

                const response = await fetch(`${API_URL}/private/turnos/registros/${ano}/${mes}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Error al obtener los registros.');

                const data = await response.json();
                setRegistros(data);
            } catch (error) {
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistros();
    }, [ano, mes]);

    // Función para formatear la fecha (Día/Mes/Año)
    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Función para formatear la hora (HH:MM)
    const formatHora = (hora) => {
        return hora ? hora.substring(0, 5) : 'Aún en turno';
    };

    // Renderizar cada tarjeta de registro
    const renderRegistro = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                {/* Imagen de perfil */}
                <View style={styles.iconContainer}>
                    <Image source={require('../../assets/foto.jpg')} style={styles.icon} />
                </View>

                {/* Información del registro */}
                <View style={styles.infoContainer}>
                    <Title style={styles.title}>{item.nombre} {item.apellido}</Title>
                    <Text style={styles.info}>📅 {formatFecha(item.fecha)}</Text>
                    <Text style={styles.info}>🕒 Entrada: {formatHora(item.hora_entrada)}</Text>
                    <Text style={styles.info}>🕕 Salida: {formatHora(item.hora_salida)}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.fullContainer}>
            {/* ✅ Incorporamos el Header Global */}
            <ImageBackground 
                source={require('../../assets/fondoLogin.webp')} 
                style={styles.background} 
                resizeMode="cover"
            >
                <View style={styles.container}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : (
                        <FlatList
                            data={registros}
                            keyExtractor={(item) => item.id_registro.toString()}
                            renderItem={renderRegistro}
                            contentContainerStyle={styles.list}
                        />
                    )}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    /* Contenedor global */
    fullContainer: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },

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
        backgroundColor: 'rgba(0, 0, 0, 0.3)' 
    },

    /* Lista de registros */
    list: { 
        paddingBottom: 20 
    },

    /* Tarjeta del registro */
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 15, 
        marginBottom: 15, 
        elevation: 5, 
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%', // ✅ Tarjetas más estrechas y elegantes
        alignSelf: 'center', 
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    /* Contenedor de la imagen */
    iconContainer: { 
        width: 70, 
        height: 70, 
        borderRadius: 35, 
        overflow: 'hidden', 
        marginRight: 15,
        alignSelf: 'center',
        borderColor: '#007bff',
        borderWidth: 2,
    },

    /* Imagen de perfil */
    icon: { 
        width: '100%', 
        height: '100%',
    },

    /* Contenedor de la información */
    infoContainer: { 
        flex: 1,
    },

    /* Título del trabajador */
    title: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 5,
        color: '#333'
    },

    /* Texto de la información */
    info: { 
        fontSize: 16, 
        color: '#555',
        marginTop: 5
    },
});
