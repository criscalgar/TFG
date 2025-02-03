import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LogoutButton from './logoutButton'; // ✅ Botón de cerrar sesión

export default function CustomHeader() {
    const navigation = useNavigation();
    const route = useRoute();

    const isLoginScreen = route.name === 'Login';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                {/* 🔹 Nombre del gimnasio con emoticono (Centrado) */}
                <Text style={styles.gymName}>🏋️‍♂️ GYM ETSII</Text>

                {/* 🔹 Botón de cerrar sesión (NO en Login) */}
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
    gymName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        flex: 1,
    },
});
