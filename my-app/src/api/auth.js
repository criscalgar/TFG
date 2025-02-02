import axios from 'axios';
import { API_URL } from '../config';

export async function login(email, contraseña) {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, contraseña });
        return response.data; // Devuelve los datos del usuario y el token si la autenticación es exitosa
    } catch (error) {
        if (error.response) {
            // Captura errores específicos desde el backend
            if (error.response.status === 403) {
                throw new Error('No tienes la cuota al día. Por favor, realiza tu pago.');
            } else if (error.response.status === 401) {
                throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else {
                throw new Error(error.response.data.error || 'Error desconocido del servidor.');
            }
        } else if (error.request) {
            throw new Error('No se recibió respuesta del servidor. Verifica tu conexión a internet.');
        } else {
            throw new Error('Error en la solicitud de inicio de sesión. Inténtalo nuevamente.');
        }
    }
}


export async function register(userData, token) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
  }
}