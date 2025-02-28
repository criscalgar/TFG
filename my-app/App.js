import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { UserProvider } from './src/context/UserContext';

export default function App() {
    return (
        <UserProvider>
            <NavigationContainer>
                <MainNavigator />
            </NavigationContainer>
        </UserProvider>
    );
}
