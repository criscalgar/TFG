import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Card, Title, Button } from 'react-native-paper'; // Usamos Card y Button de React Native Paper
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Asegúrate de instalar react-native-vector-icons

export default function AdminScreen() {
  const navigation = useNavigation();

  // Funciones de navegación
  const gestionarUsuarios = () => {
    navigation.navigate('ManageUsers');
  };

  const gestionarClases = () => {
    navigation.navigate('ManageClasses');
  };

  const registrarUsuario = () => {
    navigation.navigate('RegisterUser');
  };

  return (
    <ImageBackground
      source={require('../assets/fondoLogin.webp')} // Ruta de tu imagen
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        {/* Tarjeta: Gestionar Usuarios */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="account-group" size={50} color="#000" />
            <Title style={styles.cardTitle}>Gestionar Usuarios</Title>
            <Button
              mode="contained"
              style={styles.button}
              onPress={gestionarUsuarios}
            >
              Ir a Usuarios
            </Button>
          </Card.Content>
        </Card>

        {/* Tarjeta: Gestionar Clases */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="dumbbell" size={50} color="#000" />
            <Title style={styles.cardTitle}>Gestionar Clases</Title>
            <Button
              mode="contained"
              style={styles.button}
              onPress={gestionarClases}
            >
              Ir a Clases
            </Button>
          </Card.Content>
        </Card>

        {/* Tarjeta: Registrar Usuario */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="account-plus" size={50} color="#000" />
            <Title style={styles.cardTitle}>Registrar Usuario</Title>
            <Button
              mode="contained"
              style={styles.button}
              onPress={registrarUsuario}
            >
              Nuevo Usuario
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center', // Centrar contenido de la tarjeta
    justifyContent: 'center',
    padding: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff', // Fondo azul para el botón
  },
});
