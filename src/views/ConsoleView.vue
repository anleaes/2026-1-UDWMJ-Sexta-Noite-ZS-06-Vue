<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const consoles = ref([]);
const errorMessage = ref('');
const successMessage = ref('');

// Dados do formulário de cadastro baseados no model Console do Django
const formData = ref({
  name: '',
  manufacturer: '',
  release_year: ''
});

// Busca os consoles do Django
async function fetchConsoles() {
  try {
    const response = await api.get('/console/console/');
    consoles.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar consoles:', error);
    errorMessage.value = 'Não foi possível carregar a lista de consoles.';
  }
}

// Envia o cadastro de um novo console para o Django
async function handleCreateConsole() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await api.post('/console/console/', formData.value);
    successMessage.value = 'Console cadastrado com sucesso!';
    
    // Limpa o formulário
    formData.value = { name: '', manufacturer: '', release_year: '' };
    
    // Atualiza a tabela na tela
    fetchConsoles();
  } catch (error) {
    console.error('Erro ao cadastrar console:', error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Ocorreu um erro ao cadastrar o console.';
  }
}

onMounted(() => {
  fetchConsoles();
});
</script>

<template>
  <div class="console-container">
    <h2>Gerenciar Consoles</h2>

    <div class="content-layout">
      <!-- Formulário de Cadastro (Esquerda) -->
      <div class="form-section">
        <h3>Cadastrar Console</h3>
        <form @submit.prevent="handleCreateConsole" class="simple-form">
          <div class="form-group">
            <label for="name">Nome do Console</label>
            <input v-model="formData.name" type="text" id="name" required />
          </div>

          <div class="form-group">
            <label for="manufacturer">Fabricante</label>
            <input v-model="formData.manufacturer" type="text" id="manufacturer" required />
          </div>

          <div class="form-group">
            <label for="release_year">Ano de Lançamento</label>
            <input v-model="formData.release_year" type="number" id="release_year" required />
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button type="submit" class="btn">Salvar</button>
        </form>
      </div>

      <!-- Tabela de Listagem (Direita) -->
      <div class="list-section">
        <h3>Lista de Consoles</h3>
        <p v-if="consoles.length === 0" class="no-data">Nenhum console cadastrado.</p>
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Fabricante</th>
              <th>Ano de Lançamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="consoleItem in consoles" :key="consoleItem.id">
              <td><strong>{{ consoleItem.name }}</strong></td>
              <td>{{ consoleItem.manufacturer }}</td>
              <td>{{ consoleItem.release_year }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.console-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.content-layout {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.form-section {
  flex: 1;
  min-width: 300px;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 6px;
  background-color: #f9f9f9;
}
.list-section {
  flex: 2;
  min-width: 400px;
}
.simple-form {
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
.btn:hover {
  background-color: #3aa876;
}
.error { color: red; font-size: 14px; }
.success { color: green; font-size: 14px; }

/* Tabela */
.simple-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.simple-table th, .simple-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.simple-table th {
  background-color: #f2f2f2;
}
.no-data {
  color: #666;
  font-style: italic;
}
</style>