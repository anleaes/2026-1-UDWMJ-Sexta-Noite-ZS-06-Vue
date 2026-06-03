<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const games = ref([]);
const developers = ref([]);
const consolesList = ref([]);
const genres = ref([]);

const errorMessage = ref('');
const successMessage = ref('');

// Dados do formulário
const formData = ref({
  title: '',
  description: '',
  release_year: '',
  developer: '',    // ID do Desenvolvedor selecionado
  genre: [],        // Array de IDs de Gêneros selecionados (M2M)
  consoles: []      // Array de IDs de Consoles selecionados (M2M)
});

// Arquivo da imagem selecionada pelo usuário
const selectedFile = ref(null);

// Captura a seleção da imagem de capa
function handleFileChange(event) {
  selectedFile.value = event.target.files[0];
}

// Busca todos os dados necessários do Django
async function loadAllData() {
  try {
    const [gamesRes, devRes, consoleRes, genreRes] = await Promise.all([
      api.get('/jogos/'),
      api.get('/developer/'),
      api.get('/console/'),
      api.get('/genre/')
    ]);

    games.value = gamesRes.data;
    developers.value = devRes.data;
    consolesList.value = consoleRes.data;
    genres.value = genreRes.data;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    errorMessage.value = 'Erro ao carregar as informações do sistema.';
  }
}

// Cadastra um novo jogo usando multipart/form-data (necessário para upload de arquivos)
async function handleCreateGame() {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const payload = new FormData();
    payload.append('title', formData.value.title);
    payload.append('description', formData.value.description);
    payload.append('release_year', formData.value.release_year);
    payload.append('developer', formData.value.developer);

    // Envia o arquivo da capa se o usuário selecionou um
    if (selectedFile.value) {
      payload.append('cover_image', selectedFile.value);
    }

    // Para campos ManyToMany (Gêneros e Consoles), adicionamos cada ID individualmente
    formData.value.genre.forEach(id => {
      payload.append('genre', id);
    });
    formData.value.consoles.forEach(id => {
      payload.append('consoles', id);
    });

    await api.post('/jogos/', payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    successMessage.value = 'Jogo cadastrado com sucesso!';
    
    // Limpa o formulário
    formData.value = { title: '', description: '', release_year: '', developer: '', genre: [], consoles: [] };
    selectedFile.value = null;
    
    // Limpa o campo de input file visualmente
    const fileInput = document.getElementById('cover_image');
    if (fileInput) fileInput.value = '';

    // Recarrega a listagem de jogos
    loadAllData();
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Ocorreu um erro ao cadastrar o jogo.';
  }
}

// Auxiliares para exibir os nomes ao invés de IDs na listagem
function getDeveloperName(id) {
  const dev = developers.value.find(d => d.id === id);
  return dev ? dev.name : '-';
}

function getGenresNames(genreIds) {
  if (!genreIds) return '';
  return genres.value
    .filter(g => genreIds.includes(g.id))
    .map(g => g.name)
    .join(', ');
}

function getConsolesNames(consoleIds) {
  if (!consoleIds) return '';
  return consolesList.value
    .filter(c => consoleIds.includes(c.id))
    .map(c => c.name)
    .join(', ');
}

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="game-container">
    <h2>Catálogo de Jogos</h2>

    <div class="content-layout">
      <!-- Formulário de Cadastro (Esquerda) -->
      <div class="form-section">
        <h3>Cadastrar Jogo</h3>
        <form @submit.prevent="handleCreateGame" class="simple-form">
          <div class="form-group">
            <label for="title">Título do Jogo</label>
            <input v-model="formData.title" type="text" id="title" required />
          </div>

          <div class="form-group">
            <label for="release_year">Ano de Lançamento</label>
            <input v-model="formData.release_year" type="number" id="release_year" required />
          </div>

          <div class="form-group">
            <label for="cover_image">Imagem de Capa</label>
            <input @change="handleFileChange" type="file" id="cover_image" accept="image/*" />
          </div>

          <!-- Seleção de Desenvolvedor (Chave Estrangeira Única) -->
          <div class="form-group">
            <label for="developer">Desenvolvedor</label>
            <select v-model="formData.developer" id="developer" required>
              <option value="" disabled>Selecione um desenvolvedor</option>
              <option v-for="dev in developers" :key="dev.id" :value="dev.id">
                {{ dev.name }}
              </option>
            </select>
          </div>

          <!-- Seleção Múltipla de Consoles (ManyToMany) -->
          <div class="form-group">
            <label for="consoles">Consoles (Segure Ctrl para selecionar vários)</label>
            <select v-model="formData.consoles" id="consoles" multiple required class="multi-select">
              <option v-for="c in consolesList" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.manufacturer }})
              </option>
            </select>
          </div>

          <!-- Seleção Múltipla de Gêneros (ManyToMany) -->
          <div class="form-group">
            <label for="genre">Gêneros (Segure Ctrl para selecionar vários)</label>
            <select v-model="formData.genre" id="genre" multiple required class="multi-select">
              <option v-for="g in genres" :key="g.id" :value="g.id">
                {{ g.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea v-model="formData.description" id="description" rows="3"></textarea>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button type="submit" class="btn">Salvar Jogo</button>
        </form>
      </div>

      <!-- Grid de Jogos Cadastrados (Direita) -->
      <div class="list-section">
        <h3>Jogos no Catálogo</h3>
        <p v-if="games.length === 0" class="no-data">Nenhum jogo cadastrado.</p>
        
        <div v-else class="games-grid">
          <div v-for="game in games" :key="game.id" class="game-card">
            <div class="card-image">
              <!-- Exibe a capa do jogo se houver, senão mostra um placeholder simples -->
              <img v-if="game.cover_image" :src="game.cover_image" alt="Capa do Jogo" />
              <div v-else class="no-image">Sem Capa</div>
            </div>
            
            <div class="card-details">
              <h4>{{ game.title }} ({{ game.release_year }})</h4>
              <p><strong>Desenvolvedor:</strong> {{ getDeveloperName(game.developer) }}</p>
              <p><strong>Gêneros:</strong> {{ getGenresNames(game.genre) }}</p>
              <p><strong>Plataformas:</strong> {{ getConsolesNames(game.consoles) }}</p>
              <p v-if="game.average_rating"><strong>Nota Média:</strong> ⭐ {{ game.average_rating }}</p>
              <p class="game-desc">{{ game.description || 'Sem descrição.' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
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
  min-width: 450px;
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
.multi-select {
  height: 100px;
}
.btn {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}
.btn:hover {
  background-color: #3aa876;
}
.error { color: red; font-size: 14px; }
.success { color: green; font-size: 14px; }

/* Grid de Jogos (Cards) */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 15px;
}
.game-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}
.card-image {
  height: 160px;
  background-color: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image {
  color: #777;
  font-weight: bold;
}
.card-details {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-details h4 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}
.card-details p {
  margin: 0;
  font-size: 14px;
  color: #555;
}
.game-desc {
  margin-top: 8px !important;
  font-style: italic;
  font-size: 13px !important;
  color: #777 !important;
}
.no-data {
  color: #666;
  font-style: italic;
}
</style>