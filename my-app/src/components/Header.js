import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutButton from './logoutButton';
import axios from 'axios';
import { API_URL } from '../config';

export default function CustomHeader() {
    const navigation = useNavigation();
    const route = useRoute();
    const [unreadCount, setUnreadCount] = useState(0);

    const isLoginScreen = route.name === 'Login';

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    return;
                }

                const response = await axios.get(`${API_URL}/private/notificaciones`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data.notificaciones || !Array.isArray(response.data.notificaciones)) {
                    console.error('Error: La respuesta no es un array válido:', response.data);
                    return;
                }

                // 🔹 Filtramos solo las notificaciones con estado exactamente igual a "no leido"
                const unread = response.data.notificaciones.filter(n => n.estado.trim().toLowerCase() === 'no leido');


                setUnreadCount(unread.length);
            } catch (error) {
                console.error('Error obteniendo notificaciones:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                {!isLoginScreen && (
                    <TouchableOpacity onPress={() => navigation.navigate('Notificaciones' )}>

                        <Ionicons name="notifications-outline" size={28} color="black" />
                        {unreadCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                )}

                <Text style={styles.gymName}>🏋️‍♂️ GYM ETSII</Text>

                {!isLoginScreen && <LogoutButton navigation={navigation} />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#ECE5DD',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        backgroundColor: '#ECE5DD',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingHorizontal: 15,
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    gymName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        flex: 1,
    },
});
