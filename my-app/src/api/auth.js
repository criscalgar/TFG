import axios from 'axios';

const API_URL = 'http://192.168.1.44:3000'; // Cambia por tu IP y puerto

export async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // Maneja el token o datos devueltos
  } catch (error) {
    throw new Error(error.response.data.message || 'Error al iniciar sesión');
  }
}

