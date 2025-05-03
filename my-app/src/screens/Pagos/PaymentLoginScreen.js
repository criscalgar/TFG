import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button as PaperButton } from 'react-native-paper';
import axios from 'axios';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../../config';

const LoginPaymentScreen = ({ route, navigation }) => {
  const { user } = route.params;  // Recibimos el usuario desde LoginScreen
  const [metodo, setMetodo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [codigoSeguridad, setCodigoSeguridad] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Función para validar teléfono (9 dígitos, que empieza con 6 o 7)
  const validatePhoneNumber = (phone) => {
    const phonePattern = /^[67]\d{8}$/;  // El número debe comenzar con 6 o 7 y tener 9 dígitos
    return phonePattern.test(phone);
  };

  const handlePayment = async () => {
    if (metodo === 'tarjeta') {
      if (!numeroTarjeta || !nombreTitular || !fechaVencimiento || !codigoSeguridad) {
        Alert.alert('Error', 'Por favor, completa todos los campos de la tarjeta.');
        return;
      }
    } else if (metodo === 'bizum') {
      if (!telefono || !validatePhoneNumber(telefono)) {
        Alert.alert('Error', 'Por favor, ingresa un número de teléfono válido (9 dígitos y que empiece con 6 o 7).');
        return;
      }
    }

    try {
      const monto = user.monto;  // Usamos directamente el monto del usuario
      const response = await axios.post(`${API_URL}/private/pagoss/${user.id_usuario}`, {
        monto,
        metodo_pago: metodo,
      });

      if (response.status === 201) {
        Alert.alert('Pago realizado', 'Tu pago ha sido completado correctamente.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al realizar el pago:', error);
      Alert.alert('Error', 'Hubo un problema al realizar el pago.');
    }
  };

  const renderPaymentIcons = () => (
    <View style={styles.paymentIcons}>
      <TouchableOpacity onPress={() => setMetodo('tarjeta')}>
        <MaterialIcons name="credit-card" size={50} color={metodo === 'tarjeta' ? '#28a745' : '#ccc'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMetodo('bizum')}>
        <MaterialCommunityIcons name="cellphone-nfc" size={50} color={metodo === 'bizum' ? '#009ee3' : '#ccc'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={require('../../assets/fondoLogin.webp')} style={styles.background} resizeMode="cover">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formContainer}>
              {/* Mostrar datos del usuario */}
              <TextInput
                style={styles.inputField}
                value={`${user.nombre} ${user.apellido}`}
                editable={false}
                placeholder="Nombre y Apellido"
              />
              <TextInput
                style={styles.inputField}
                value={`${user.monto?.toString()} €`}
                editable={false}
                placeholder="Monto y Membresía"
              />
              
              {/* Mostrar el ícono del método seleccionado */}
              {renderPaymentIcons()}

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

              {metodo === 'bizum' && (
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Introduce tu teléfono"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                />
              )}

              <PaperButton mode="contained" onPress={handlePayment} style={styles.confirmButton}>
                Confirmar con {metodo.toUpperCase()}
              </PaperButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 50,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputField: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    paddingLeft: 10,
    width: '100%',
  },
  confirmButton: { marginTop: 30, backgroundColor: '#28a745' },
  paymentIcons: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputSmall: { width: '48%' },
  phoneInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
    paddingLeft: 10,
    width: '100%',
  },
});

export default LoginPaymentScreen;
