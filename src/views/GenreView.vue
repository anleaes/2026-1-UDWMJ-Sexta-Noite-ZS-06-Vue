<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const genres = ref([]);
const errorMessage = ref('');
const successMessage = ref('');

// Dados do formulário baseados no model Genre do Django
const formData = ref({
  name: '',
  description: ''
});

// Busca os gêneros do Django
async function fetchGenres() {
  try {
    const response = await api.get('/genre/');
    genres.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    errorMessage.value = 'Não foi possível carregar a lista de gêneros.';
  }
}

// Cadastra um novo gênero
async function handleCreateGenre() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await api.post('/genre/', formData.value);
    successMessage.value = 'Gênero cadastrado com sucesso!';
    
    // Limpa o formulário
    formData.value = { name: '', description: '' };
    
    // Atualiza a listagem
    fetchGenres();
  } catch (error) {
    console.error('Erro ao cadastrar gênero:', error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Ocorreu um erro ao cadastrar o gênero.';
  }
}

onMounted(() => {
  fetchGenres();
});
</script>

<template>
  <div class="genre-container">
    <h2>Gerenciar Gêneros</h2>

    <div class="content-layout">
      <!-- Formulário de Cadastro (Esquerda) -->
      <div class="form-section">
        <h3>Cadastrar Gênero</h3>
        <form @submit.prevent="handleCreateGenre" class="simple-form">
          <div class="form-group">
            <label for="name">Nome do Gênero</label>
            <input v-model="formData.name" type="text" id="name" required />
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea v-model="formData.description" id="description" rows="4"></textarea>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button type="submit" class="btn">Salvar</button>
        </form>
      </div>

      <!-- Tabela de Listagem (Direita) -->
      <div class="list-section">
        <h3>Lista de Gêneros</h3>
        <p v-if="genres.length === 0" class="no-data">Nenhum gênero cadastrado.</p>
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="genre in genres" :key="genre.id">
              <td><strong>{{ genre.name }}</strong></td>
              <td>{{ genre.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.genre-container {
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