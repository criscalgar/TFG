import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
    const saveToken = async (token) => {
        await AsyncStorage.setItem('token', token);
    };

    const getToken = async () => {
        return await AsyncStorage.getItem('token');
    };

    const clearToken = async () => {
        await AsyncStorage.removeItem('token');
    };

    return { saveToken, getToken, clearToken };
};
