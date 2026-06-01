<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const formData = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  email: '',
  username: '',
  password: ''
});

const errorMessage = ref('');
const successMessage = ref('');

async function handleCadastro() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    // Registra o usuário comum no seu backend Django
    await api.post('/usuarios/', formData.value);
    successMessage.value = 'Cadastro realizado! Redirecionando para login...';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Erro ao tentar cadastrar.';
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Criar Conta</h2>
    <form @submit.prevent="handleCadastro" class="auth-form">
      <div class="form-group">
        <label for="first_name">Nome</label>
        <input v-model="formData.first_name" type="text" id="first_name" required />
      </div>

      <div class="form-group">
        <label for="last_name">Sobrenome</label>
        <input v-model="formData.last_name" type="text" id="last_name" required />
      </div>

      <div class="form-group">
        <label for="birth_date">Data de Nascimento</label>
        <input v-model="formData.birth_date" type="date" id="birth_date" />
      </div>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input v-model="formData.email" type="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="username">Usuário</label>
        <input v-model="formData.username" type="text" id="username" required />
      </div>

      <div class="form-group">
        <label for="password">Senha</label>
        <input v-model="formData.password" type="password" id="password" required />
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="submit" class="btn">Cadastrar</button>
    </form>
    <p class="switch-auth">
      Já tem uma conta? <RouterLink to="/login">Entrar</RouterLink>
    </p>
  </div>
</template>

<style scoped>
/* Copia o estilo do LoginView */
.auth-container {
  max-width: 350px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: Arial, sans-serif;
}
.auth-form { display: flex; flex-direction: column; }
.form-group { margin-bottom: 12px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 4px; font-weight: bold; }
.form-group input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.btn { padding: 10px; background-color: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; }
.btn:hover { background-color: #3aa876; }
.error { color: red; font-size: 14px; }
.success { color: green; font-size: 14px; }
.switch-auth { margin-top: 15px; text-align: center; }
</style>