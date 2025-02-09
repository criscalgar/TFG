import React from 'react';
import { View, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ClientScreen({ navigation }) {

  const gestionarClases = () => navigation.navigate('ManageClasses');
  const verTrabajadores = () => navigation.navigate('ViewWorkers');

  return (
    <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Icon name="dumbbell" size={50} color="#000" />
                <Title style={styles.cardTitle}>Clases disponibles</Title>
                <Button mode="contained" style={styles.button} onPress={gestionarClases}>
                  Ir a Clases
                </Button>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Icon name="account-group" size={50} color="#000"/>
                <Title style={styles.cardTitle}>Ver trabajadores</Title>
                <Button mode="contained" style={styles.button} onPress={verTrabajadores}>
                  Ver trabajadores
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  scrollContainer: {
      alignItems: 'center',
      paddingVertical: 20,
  },
  cardWrapper: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
  },
  card: {
      width: 270,
      backgroundColor: '#fff',
      borderRadius: 10,
      elevation: 5,
      height: 210,
  },
  cardContent: { alignItems: 'center', justifyContent: 'center', padding: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 10, marginTop: 30 },
  button: { marginTop: 10, backgroundColor: '#007bff' },
});