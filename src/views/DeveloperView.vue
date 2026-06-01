<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const developers = ref([]);
const errorMessage = ref('');
const successMessage = ref('');

// Dados do formulário de cadastro
const formData = ref({
  name: '',
  country: '',
  foundation_year: '',
  description: ''
});

// Busca a lista de desenvolvedores do Django
async function fetchDevelopers() {
  try {
    const response = await api.get('/developer/developer/');
    developers.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar desenvolvedores:', error);
    errorMessage.value = 'Não foi possível carregar a lista de desenvolvedores.';
  }
}

// Envia o cadastro de um novo desenvolvedor para o Django
async function handleCreateDeveloper() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await api.post('/developer/developer/', formData.value);
    successMessage.value = 'Desenvolvedor cadastrado com sucesso!';
    
    // Limpa o formulário
    formData.value = { name: '', country: '', foundation_year: '', description: '' };
    
    // Atualiza a lista exibida na tela
    fetchDevelopers();
  } catch (error) {
    console.error('Erro ao cadastrar desenvolvedor:', error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Ocorreu um erro ao cadastrar.';
  }
}

// Executa assim que a tela é carregada
onMounted(() => {
  fetchDevelopers();
});
</script>

<template>
  <div class="developer-container">
    <h2>Gerenciar Desenvolvedores</h2>

    <div class="content-layout">
      <!-- Formulário de Cadastro -->
      <div class="form-section">
        <h3>Cadastrar Desenvolvedor</h3>
        <form @submit.prevent="handleCreateDeveloper" class="simple-form">
          <div class="form-group">
            <label for="name">Nome da Empresa</label>
            <input v-model="formData.name" type="text" id="name" required />
          </div>

          <div class="form-group">
            <label for="country">País de Origem</label>
            <input v-model="formData.country" type="text" id="country" required />
          </div>

          <div class="form-group">
            <label for="foundation_year">Ano de Fundação</label>
            <input v-model="formData.foundation_year" type="number" id="foundation_year" required />
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea v-model="formData.description" id="description" rows="3"></textarea>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button type="submit" class="btn">Salvar</button>
        </form>
      </div>

      <!-- Tabela de Listagem -->
      <div class="list-section">
        <h3>Lista de Desenvolvedores</h3>
        <p v-if="developers.length === 0" class="no-data">Nenhum desenvolvedor cadastrado.</p>
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>País</th>
              <th>Ano</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dev in developers" :key="dev.id">
              <td><strong>{{ dev.name }}</strong></td>
              <td>{{ dev.country }}</td>
              <td>{{ dev.foundation_year }}</td>
              <td>{{ dev.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.developer-container {
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
.form-group input, .form-group textarea {
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

/* Estilos de Tabela Simples */
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