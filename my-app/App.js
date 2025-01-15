import React from 'react';
import { NavigationContainer } from '@react-navigation/native';  // Importa NavigationContainer para gestionar la navegación
import MainNavigator from './src/navigation/MainNavigator'; // Importa tu MainNavigator

export default function App() {
  return (
    <NavigationContainer>
      <MainNavigator />  {/* MainNavigator maneja la navegación entre pantallas */}
    </NavigationContainer>
  );
}