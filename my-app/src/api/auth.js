import axios from 'axios';
import { API_URL } from '../config';



export async function login(email, contraseña) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, contraseña });
    return response.data; // Maneja el token o datos devueltos
  } catch (error) {
    throw new Error(error.response.data.message || 'Error al iniciar sesión');
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