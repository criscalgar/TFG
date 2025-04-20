import React, { useState } from 'react';
import { View, StyleSheet, Alert, Linking, ImageBackground, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function SimulatedPaymentScreen({ navigation, route }) {
  const { onPaymentSuccess } = route.params; // Función pasada desde el componente que llama esta pantalla
  const [metodo, setMetodo] = useState('tarjeta'); // Método de pago seleccionado
  const [telefono, setTelefono] = useState(''); // Almacenar el número de teléfono para Bizum
  const [numeroTarjeta, setNumeroTarjeta] = useState(''); // Número de tarjeta
  const [nombreTitular, setNombreTitular] = useState(''); // Nombre del titular
  const [fechaVencimiento, setFechaVencimiento] = useState(''); // Fecha de vencimiento
  const [codigoSeguridad, setCodigoSeguridad] = useState(''); // Código de seguridad

  // Confirmar el pago seleccionado
  const handleConfirm = async () => {
    if (metodo === 'tarjeta') {
      if (!numeroTarjeta || !nombreTitular || !fechaVencimiento || !codigoSeguridad) {
        Alert.alert('Error', 'Por favor, completa todos los campos de la tarjeta.');
      } else {
        // Simula el pago con tarjeta
        Alert.alert(`✅ Pago simulado con ${metodo.toUpperCase()}`, '', [
          {
            text: 'OK',
            onPress: () => {
              onPaymentSuccess(); // Indica que el pago fue exitoso
              navigation.goBack(); // Regresa a la pantalla anterior
            }
          }
        ]);
      }
    } else if (metodo === 'bizum') {
      if (telefono === '') {
        Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
      } else {
        // Simula el proceso de pago de Bizum
        Alert.alert(`✅ Pago simulado con Bizum`, `Pago simulado con Bizum de ${telefono}`, [
          {
            text: 'OK',
            onPress: () => {
              // Notificación simulada
              Alert.alert('Simulación', 'Esto solo es una simulación.');
              onPaymentSuccess(); // Indica que el pago fue exitoso
              navigation.goBack(); // Regresa a la pantalla anterior
            }
          }
        ]);
      }
    }
  };

  // Renderizar los íconos correspondientes a cada método de pago
  const renderIcon = () => {
    switch (metodo) {
      case 'tarjeta':
        return <MaterialIcons name="credit-card" size={36} color="#28a745" />;
      case 'bizum':
        return <MaterialCommunityIcons name="cellphone-nfc" size={36} color="#009ee3" />;
      default:
        return null;
    }
  };

  return (
    <ImageBackground source={require('../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
      {/* TouchableWithoutFeedback envuelve solo la vista para cerrar el teclado */}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Solo en iOS
          style={styles.overlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.title}>Selecciona método de pago</Text>

            {/* Selección del método de pago */}
            <RadioButton.Group onValueChange={setMetodo} value={metodo}>
              <View style={metodo === 'tarjeta' ? styles.selectedMethod : styles.radioOption}>
                <RadioButton.Item
                  label="Tarjeta bancaria"
                  value="tarjeta"
                  labelStyle={styles.radioLabel}
                  status={metodo === 'tarjeta' ? 'checked' : 'unchecked'}
                />
              </View>
              <View style={metodo === 'bizum' ? styles.selectedMethod : styles.radioOption}>
                <RadioButton.Item
                  label="Bizum"
                  value="bizum"
                  labelStyle={styles.radioLabel}
                  status={metodo === 'bizum' ? 'checked' : 'unchecked'}
                />
              </View>
            </RadioButton.Group>

            {/* Mostrar el ícono del método seleccionado */}
            <View style={styles.iconContainer}>{renderIcon()}</View>

            {/* Si el método es Tarjeta, muestra los campos correspondientes */}
            {metodo === 'tarjeta' && (
              <>
                <TextInput
                  style={styles.inputField}
                  placeholder="Número de tarjeta"
                  value={numeroTarjeta}
                  onChangeText={setNumeroTarjeta}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nombre del titular"
                  value={nombreTitular}
                  onChangeText={setNombreTitular}
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.inputField, styles.inputSmall]}
                    placeholder="MM/AA"
                    value={fechaVencimiento}
                    onChangeText={setFechaVencimiento}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.inputField, styles.inputSmall]}
                    placeholder="Código de seguridad"
                    value={codigoSeguridad}
                    onChangeText={setCodigoSeguridad}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {/* Si el método es Bizum, muestra el campo para el teléfono */}
            {metodo === 'bizum' && (
              <TextInput
                style={styles.phoneInput}
                placeholder="Introduce tu teléfono"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            )}

            {/* Botón para proceder con el pago */}
            <Button mode="contained" onPress={handleConfirm} style={styles.confirmButton}>
              Confirmar con {metodo.toUpperCase()}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Agregar opacidad al fondo
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    width: '90%',
    elevation: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmButton: {
    marginTop: 30,
    backgroundColor: '#28a745',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  inputField: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    paddingLeft: 10,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputSmall: {
    width: '48%',
  },
  phoneInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    paddingLeft: 10,
    width: '100%',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  radioOption: {
    paddingVertical: 8,
    paddingLeft: 20,
    backgroundColor: '#f9f9f9',
  },
  selectedMethod: {
    backgroundColor: '#d1f7d1', // Fondo sombreado cuando la opción está seleccionada
    paddingVertical: 8,
    paddingLeft: 20,
    borderRadius: 5,
  },
});

