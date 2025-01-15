import axios from 'axios';

// Configuración general de Axios
const API_URL = 'http://192.168.1.44:3000'; // Reemplaza 192.168.1.100 con tu IP local

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
