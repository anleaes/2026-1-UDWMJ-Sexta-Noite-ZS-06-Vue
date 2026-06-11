<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const reviews = ref([]);
const games = ref([]);
const errorMessage = ref('');
const successMessage = ref('');

// Dados do formulário
const formData = ref({
  game: '',          
  rating: '',        
  recommended: true, 
  comment: ''        
});

// Carrega os jogos disponíveis e as avaliações já feitas
async function loadData() {
  try {
    const [reviewsRes, gamesRes] = await Promise.all([
      api.get('/review/'),
      api.get('/jogos/')
    ]);
    reviews.value = reviewsRes.data;
    games.value = gamesRes.data;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    errorMessage.value = 'Não foi possível carregar as informações das avaliações.';
  }
}

// Envia a avaliação para o Django
async function handleCreateReview() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await api.post('/review/', formData.value);
    successMessage.value = 'Sua avaliação foi enviada!';
    
    // Reseta o formulário
    formData.value = { game: '', rating: '', recommended: true, comment: '' };
    
    // Recarrega os dados
    loadData();
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Ocorreu um erro ao enviar a avaliação.';
  }
}

// Auxiliar para obter o título do jogo correspondente ao ID
function getGameTitle(id) {
  const game = games.value.find(g => g.id === id);
  return game ? game.title : '-';
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="review-container">
    <h2>Avaliações de Jogos</h2>

    <div class="content-layout">
      <!-- Formulário para Escrever Avaliação (Esquerda) -->
      <div class="form-section">
        <h3>Escrever uma Avaliação</h3>
        <form @submit.prevent="handleCreateReview" class="simple-form">
          <div class="form-group">
            <label for="game">Selecione o Jogo</label>
            <select v-model="formData.game" id="game" required>
              <option value="" disabled>Escolha um jogo</option>
              <option v-for="game in games" :key="game.id" :value="game.id">
                {{ game.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="rating">Nota (0 a 5)</label>
            <input v-model.number="formData.rating" type="number" id="rating" min="0" max="5" step="0.1" required />
          </div>

          <div class="form-group checkbox-group">
            <input v-model="formData.recommended" type="checkbox" id="recommended" />
            <label for="recommended">Eu recomendo este jogo</label>
          </div>

          <div class="form-group">
            <label for="comment">Seu Comentário</label>
            <textarea v-model="formData.comment" id="comment" rows="4"></textarea>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button type="submit" class="btn">Enviar Avaliação</button>
        </form>
      </div>

      <!-- Listagem de Avaliações (Direita) -->
      <div class="list-section">
        <h3>Últimas Avaliações</h3>
        <p v-if="reviews.length === 0" class="no-data">Nenhuma avaliação registrada ainda.</p>
        
        <div v-else class="reviews-list">
          <div v-for="rev in reviews" :key="rev.id" class="review-card">
            <div class="review-header">
              <h4>{{ getGameTitle(rev.game) }}</h4>
              <span class="rating-badge">⭐ {{ rev.rating }}</span>
            </div>
            
            <div class="review-recommendation">
              <span v-if="rev.recommended" class="badge-success">👍 Recomendado</span>
              <span v-else class="badge-danger">👎 Não Recomendado</span>
            </div>

            <p class="review-comment">{{ rev.comment || 'Sem comentários.' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-container {
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
  min-width: 320px;
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
.form-group input, .form-group textarea, .form-group select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.checkbox-group label {
  margin-bottom: 0;
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

/* Lista de Cards */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.review-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  background-color: #fff;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.review-header h4 {
  margin: 0;
  font-size: 17px;
  color: #2c3e50;
}
.rating-badge {
  font-weight: bold;
  color: #f39c12;
}
.review-recommendation {
  margin-top: 5px;
}
.badge-success {
  font-size: 12px;
  color: #27ae60;
  font-weight: bold;
}
.badge-danger {
  font-size: 12px;
  color: #c0392b;
  font-weight: bold;
}
.review-comment {
  margin-top: 10px;
  font-style: italic;
  color: #555;
  font-size: 14px;
}
.no-data {
  color: #666;
  font-style: italic;
}
</style>