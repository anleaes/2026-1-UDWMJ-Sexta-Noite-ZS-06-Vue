import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref(null);

  async function login(username, password) {
    try {
      // Faz login no endpoint padrão do Django REST Framework
      await api.post('/api-auth/login/', { username, password });
      isAuthenticated.value = true;
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Usuário ou senha inválidos.' };
    }
  }

  async function logout() {
    try {
      await api.post('/api-auth/logout/');
      isAuthenticated.value = false;
      user.value = null;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout
  };
});