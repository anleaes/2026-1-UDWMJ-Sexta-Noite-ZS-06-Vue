<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  const result = await authStore.login(username.value, password.value);
  if (result.success) {
    router.push('/'); // Vai para a tela inicial
  } else {
    errorMessage.value = result.message;
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Entrar</h2>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label for="username">Usuário</label>
        <input v-model="username" type="text" id="username" required />
      </div>
      
      <div class="form-group">
        <label for="password">Senha</label>
        <input v-model="password" type="password" id="password" required />
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" class="btn">Entrar</button>
    </form>
    <p class="switch-auth">
      Não tem conta? <RouterLink to="/cadastro">Cadastre-se</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 350px;
  margin: 80px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: Arial, sans-serif;
}
.auth-form {
  display: flex;
  flex-direction: column;
}
.form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 4px;
  font-weight: bold;
}
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:hover { background-color: #3aa876; }
.error { color: red; font-size: 14px; }
.switch-auth { margin-top: 15px; text-align: center; }
</style>