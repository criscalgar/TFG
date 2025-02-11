import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ImageBackground, ScrollView, Text, Linking, TouchableOpacity, Alert
} from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const TrainerScreen = ({ navigation }) => {

  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);

  // Ubicación del gimnasio
  const GYM_LOCATION = {
    latitude: 37.369986,
    longitude: -6.053663,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Obtener ubicación del usuario
  const checkLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('⚠️ La ubicación está desactivada. Actívela para ver tu posición respecto al gimnasio.');
      setLocationPermission(false);
    } else {
      setLocationPermission(true);
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }

    if (!locationChecked) {
      setLocationChecked(true);
    }
  };

  // Abrir Google Maps con la ruta al gimnasio
  const openGoogleMaps = () => {
    if (!userLocation) {
      Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación actual.');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${GYM_LOCATION.latitude},${GYM_LOCATION.longitude}`;
    Linking.openURL(url);
  };

  // Horarios del gimnasio
  const gymHours = [
    { day: 'L - V', hours: '06:00 - 22:00', icon: 'clock-outline' },
    { day: 'S - D', hours: '08:00 - 20:00', icon: 'clock-outline' }
  ];

  return (
    <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          {/* 🔹 Título Ubicación del gimnasio */}
          <View style={styles.titleContainer}>
            <Icon name="map-marker" size={34} color="#fff" />
            <Text style={styles.title}>Ubicación del gimnasio</Text>
          </View>
          <View style={styles.underline} />

          {/* 🔹 Mapa Interactivo */}
          <Card style={styles.mapCard}>
            <Card.Content style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={GYM_LOCATION}
                showsUserLocation={locationPermission}>
                <Marker coordinate={GYM_LOCATION} title="Gimnasio" pinColor='red' />
                {userLocation && <Marker coordinate={userLocation} title='Tu ubicación' pinColor='blue' />}
              </MapView>
            </Card.Content>
          </Card>

          {/* 🔹 Ubicación y Dirección */}
          <TouchableOpacity style={styles.locationCard} onPress={openGoogleMaps}>
            <Icon name="map-marker" size={30} color="#fff" />
            <Text style={styles.locationText}>Abrir en Google Maps</Text>
          </TouchableOpacity>

          <View style={styles.spacing} />

          {/* 🔹 Título Horario del gimnasio */}
          <View style={styles.titleContainer}>
            <Icon name="clock-outline" size={34} color="#fff" />
            <Text style={styles.title}>Horario del gimnasio</Text>
          </View>
          <View style={styles.underline} />

          {/* 🔹 Horarios del gimnasio */}
          {gymHours.map((item, index) => (
            <View key={index} style={styles.hourCard}>
              <Icon name={item.icon} size={22} color="#fff" style={styles.icon} />
              <Text style={styles.hourText}>{item.day}: {item.hours}</Text>
            </View>
          ))}

          <View style={styles.spacing} />

          {/* 🔹 Funcionalidades del Entrenador */}
          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Icon name="account-group" size={50} color="#000" />
                <Title style={styles.cardTitle}>Gestionar Usuarios</Title>
                <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('ManageUsers')}>
                  Ir a Usuarios
                </Button>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Icon name="dumbbell" size={50} color="#000" />
                <Title style={styles.cardTitle}>Gestionar Clases</Title>
                <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('ManageClasses')}>
                  Ir a Clases
                </Button>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.cardWrapper}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Icon name="account-plus" size={50} color="#000" />
                <Title style={styles.cardTitle}>Registrar Usuario</Title>
                <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('RegisterUser')}>
                  Nuevo Usuario
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
  scrollContainer: { alignItems: 'center', paddingVertical: 20 },

  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  underline: { width: '60%', height: 4, backgroundColor: '#fff', borderRadius: 2, marginBottom: 15 },

  /* 🔹 Estilo del mapa */
  mapCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },

  /* 🔹 Botón de Google Maps */
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  locationText: { color: '#fff', fontSize: 16, marginLeft: 10 },
  spacing: { height: 50 },
  /* 🔹 Tarjetas de horarios */
  hourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '90%',
  },
  icon: { marginRight: 10 },
  hourText: { color: '#fff', fontSize: 16 },

  /* 🔹 Tarjetas de funcionalidades */
  cardWrapper: { width: '100%', alignItems: 'center', marginBottom: 20 },
  card: { width: 270, backgroundColor: '#fff', borderRadius: 10, elevation: 5, height: 210 },
  cardContent: { alignItems: 'center', justifyContent: 'center', padding: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 10, marginTop: 30 },
  button: { marginTop: 10, backgroundColor: '#007bff' },
});

export default TrainerScreen;
