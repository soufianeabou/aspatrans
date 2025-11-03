import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: __DEV__ ? 'http://10.0.2.2:4000' : 'http://localhost:4000',
  timeout: 10000, // 10 secondes timeout
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        await AsyncStorage.removeItem('token');
        // Navigation will be handled by AuthContext
      } else if (status === 403) {
        // Forbidden - show French message
        error.message = data.message || 'Accès interdit';
      } else if (status === 404) {
        // Not found
        error.message = data.message || 'Ressource non trouvée';
      } else if (status === 500) {
        // Server error
        error.message = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else {
        // Other errors
        error.message = data.message || error.message || 'Une erreur est survenue';
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'Pas de connexion au serveur. Vérifiez votre connexion internet.';
    } else {
      // Something else happened
      error.message = error.message || 'Une erreur inattendue est survenue';
    }
    
    return Promise.reject(error);
  }
);

export default api;
