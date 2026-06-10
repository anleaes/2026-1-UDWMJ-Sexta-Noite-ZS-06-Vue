<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

// Controle da aba selecionada ('user' ou 'admin')
const accountType = ref('user');

const formData = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  email: '',
  username: '',
  password: '',
  confirm_password: '' // Novo campo baseado na sua imagem
});

const errorMessage = ref('');
const successMessage = ref('');

async function handleCadastro() {
  errorMessage.value = '';
  successMessage.value = '';

  // Validação simples de senha
  if (formData.value.password !== formData.value.confirm_password) {
    errorMessage.value = 'As senhas não coincidem. Tente novamente.';
    return;
  }

  try {
    const payload = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      birth_date: formData.value.birth_date || null,
      email: formData.value.email,
      username: formData.value.username,
      password: formData.value.password,
    };

    // Manda as flags pro Django (ele decide como usar lá no AdminViewSet)
    if (accountType.value === 'admin') {
      payload.is_superuser = true;
      payload.is_staff = true;
    }

    // A MÁGICA ACONTECE AQUI: Define a rota dinamicamente
    const endpoint = accountType.value === 'admin' ? '/administradores/' : '/usuarios/';
    
    // Dispara a requisição para a rota correta
    await api.post(endpoint, payload);
    
    successMessage.value = `${accountType.value === 'admin' ? 'Administrador' : 'Usuário'} cadastrado com sucesso! Redirecionando...`;
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Erro ao tentar cadastrar. Verifique os dados ou o console.';
  }
}
</script>

<template>
  <div class="auth-container">
    
    <div class="header-titles">
      <h2>Criar Nova Conta</h2>
      <p class="switch-auth">
        Já tem uma conta? <RouterLink to="/login">Faça Login</RouterLink>
      </p>
    </div>

    <div class="tabs-container">
      <button 
        :class="['tab-btn', { active: accountType === 'user' }]" 
        @click="accountType = 'user'"
      >
        Usuário
      </button>
      <button 
        :class="['tab-btn', { active: accountType === 'admin' }]" 
        @click="accountType = 'admin'"
      >
        Administrador
      </button>
    </div>

    <form @submit.prevent="handleCadastro" class="auth-form">
      
      <h4 class="section-title">Dados do {{ accountType === 'admin' ? 'Administrador' : 'Usuário' }}</h4>

      <div class="form-group">
        <label for="first_name">Nome</label>
        <input v-model="formData.first_name" type="text" id="first_name" required />
      </div>

      <div class="form-group">
        <label for="last_name">Sobrenome</label>
        <input v-model="formData.last_name" type="text" id="last_name" required />
      </div>

      <div class="form-group">
        <label for="username">Nome de Usuário (Login)</label>
        <input v-model="formData.username" type="text" id="username" required />
      </div>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input v-model="formData.email" type="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="birth_date">Data de Nascimento</label>
        <input v-model="formData.birth_date" type="date" id="birth_date" />
      </div>

      <div class="form-group">
        <label for="password">Senha</label>
        <input v-model="formData.password" type="password" id="password" required />
      </div>

      <div class="form-group">
        <label for="confirm_password">Confirmar Senha</label>
        <input v-model="formData.confirm_password" type="password" id="confirm_password" required />
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <button type="submit" class="btn">
        Cadastrar {{ accountType === 'admin' ? 'Administrador' : 'Usuário' }}
      </button>
    </form>
    
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 600px; /* Aumentei a largura para ficar mais parecido com o React */
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
}

.header-titles {
  text-align: center;
  margin-bottom: 25px;
}

.header-titles h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.switch-auth {
  margin: 0;
  font-size: 14px;
}

.switch-auth a {
  color: #007bff;
  font-weight: bold;
  text-decoration: none;
}

.switch-auth a:hover {
  text-decoration: underline;
}

/* ESTILO DAS ABAS */
.tabs-container {
  display: flex;
  background-color: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 25px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background-color: #fff;
  color: #007bff;
  font-weight: bold;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-title {
  text-align: center;
  color: #555;
  margin-bottom: 20px;
}

.auth-form { 
  display: flex; 
  flex-direction: column; 
}

.form-group { 
  margin-bottom: 15px; 
  display: flex; 
  flex-direction: column; 
}

.form-group label { 
  margin-bottom: 6px; 
  font-size: 13px;
  color: #333;
}

.form-group input { 
  padding: 10px; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  font-size: 14px;
  background-color: #fcfcfc;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  background-color: #fff;
}

.btn { 
  padding: 14px; 
  background-color: #007bff; /* Cor azul do React */
  color: white; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

.btn:hover { 
  background-color: #0056b3; 
}

.error { 
  color: #dc3545; 
  font-size: 14px; 
  margin-bottom: 15px;
  text-align: center;
}

.success { 
  color: #28a745; 
  font-size: 14px; 
  margin-bottom: 15px;
  text-align: center;
}
</style>