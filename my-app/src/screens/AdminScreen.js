import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function AdminScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Administrador</Text>
      <Button title="Gestionar Usuarios" onPress={() => {/* Lógica para gestionar usuarios */}} />
      <Button title="Gestionar Clases" onPress={() => {/* Lógica para gestionar clases */}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
