import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { Provider as PaperProvider } from 'react-native-paper'; // Importa el Provider de react-native-paper

export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <MainNavigator />
            </NavigationContainer>
        </PaperProvider>
    );
}
