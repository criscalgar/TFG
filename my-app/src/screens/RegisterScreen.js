import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
    // Estados para manejar los datos del formulario y los errores
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [tipo_usuario, setTipoUsuario] = useState('usuario');  // Asignar tipo por defecto o dejarlo editable
    const [id_membresia, setIdMembresia] = useState('');  // Asigna el id de membresía si es necesario
    const [error, setError] = useState('');

    // Función para manejar el registro
    const handleRegister = async () => {
        if (email && contraseña) {
            try {
                // Obtener el token JWT almacenado en AsyncStorage
                const token = await AsyncStorage.getItem('userToken');
                
                if (!token) {
                    setError('Debes iniciar sesión primero');
                    return;
                }

                // Hacer la solicitud al backend para registrar un nuevo usuario
                const response = await fetch('http://localhost:3000/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera
                    },
                    body: JSON.stringify({
                        nombre,
                        apellido,
                        email,
                        contraseña,
                        tipo_usuario,
                        id_membresia,
                    }),
                });

                const data = await response.json();

                if (data.message) {
                    // Si el registro es exitoso, redirigir al login o mostrar un mensaje de éxito
                    navigation.navigate('Login');
                } else {
                    setError(data.error || 'Error al registrar el usuario');
                }
            } catch (error) {
                setError('Error de conexión');
            }
        } else {
            setError('Por favor, completa todos los campos');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Registrarse</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
            />
            <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
            />
            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={contraseña}
                onChangeText={setContraseña}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Registrar" onPress={handleRegister} />
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                ¿Ya tienes una cuenta? Inicia sesión
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingLeft: 8,
    },
    error: {
        color: 'red',
    },
    link: {
        marginTop: 12,
        color: 'blue',
    },
});

export default RegisterScreen;
