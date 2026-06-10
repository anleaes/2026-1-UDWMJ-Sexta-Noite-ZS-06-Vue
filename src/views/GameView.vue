<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const games = ref([]);
const developers = ref([]);
const consolesList = ref([]);
const genres = ref([]);

const errorMessage = ref('');
const successMessage = ref('');

// Controle do Modal de Cadastro
const showModal = ref(false);

// Dados do formulário
const formData = ref({
  title: '',
  description: '',
  release_year: '',
  developer: '',    
  genre: [],        
  consoles: []      
});

// Arquivo da imagem selecionada pelo usuário
const selectedFile = ref(null);

function handleFileChange(event) {
  selectedFile.value = event.target.files[0];
}

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

async function handleCreateGame() {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const payload = new FormData();
    payload.append('title', formData.value.title);
    payload.append('description', formData.value.description);
    payload.append('release_year', formData.value.release_year);
    payload.append('developer', formData.value.developer);

    if (selectedFile.value) {
      payload.append('cover_image', selectedFile.value);
    }

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

    // Limpa o formulário e fecha o modal ao ter sucesso
    formData.value = { title: '', description: '', release_year: '', developer: '', genre: [], consoles: [] };
    selectedFile.value = null;
    showModal.value = false; // <-- Fecha o modal!
    
    // Alerta de sucesso nativo para confirmar pro usuário já que o modal fechou
    alert('Jogo cadastrado com sucesso!');

    // Recarrega a listagem de jogos para mostrar o novo jogo
    loadAllData();
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Ocorreu um erro ao cadastrar o jogo.';
  }
}

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
    
    <div class="header-row">
      <h2>Catálogo de Jogos</h2>
      <button class="add-game-btn" @click="showModal = true">
        + Adicionar Novo Jogo
      </button>
    </div>

    <div class="list-section">
      <p v-if="games.length === 0" class="no-data">Nenhum jogo cadastrado.</p>
      
      <div v-else class="games-grid">
        <router-link 
          v-for="game in games" 
          :key="game.id" 
          :to="`/jogo/${game.id}`" 
          class="game-card clickable-card"
        >
          <div class="card-image">
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
        </router-link>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        
        <div class="modal-header">
          <h3>Cadastrar Novo Jogo</h3>
          <button class="close-btn" @click="showModal = false">✖</button>
        </div>

        <form @submit.prevent="handleCreateGame" class="simple-form">
          <div class="form-group">
            <label for="title">Título do Jogo</label>
            <input v-model="formData.title" type="text" id="title" required />
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="release_year">Ano de Lançamento</label>
              <input v-model="formData.release_year" type="number" id="release_year" required />
            </div>
            
            <div class="form-group half-width">
              <label for="developer">Desenvolvedor</label>
              <select v-model="formData.developer" id="developer" required>
                <option value="" disabled>Selecione...</option>
                <option v-for="dev in developers" :key="dev.id" :value="dev.id">
                  {{ dev.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="cover_image">Imagem de Capa</label>
            <input @change="handleFileChange" type="file" id="cover_image" accept="image/*" class="file-input" />
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="consoles">Consoles <small>(Ctrl para vários)</small></label>
              <select v-model="formData.consoles" id="consoles" multiple required class="multi-select">
                <option v-for="c in consolesList" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="genre">Gêneros <small>(Ctrl para vários)</small></label>
              <select v-model="formData.genre" id="genre" multiple required class="multi-select">
                <option v-for="g in genres" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea v-model="formData.description" id="description" rows="3"></textarea>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <div class="modal-footer">
            <button type="button" class="btn btn-cancel" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn btn-save">Salvar Jogo</button>
          </div>
        </form>

      </div>
    </div>
    </div>
</template>

<style scoped>
.game-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* Novo cabeçalho flexível */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 10px;
}

.header-row h2 {
  margin: 0;
  color: #2c3e50;
}

.add-game-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-game-btn:hover {
  background-color: #3aa876;
}

/* A lista agora ocupa 100% */
.list-section {
  width: 100%;
}

.games-grid {
  display: grid;
  /* Grade fluida: cards preenchem a tela lado a lado até acabar o espaço */
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

.clickable-card {
  text-decoration: none; 
  color: inherit; 
  transition: transform 0.2s, box-shadow 0.2s; 
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-5px); 
  box-shadow: 0 6px 12px rgba(0,0,0,0.15); 
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
.card-details h4 { margin: 0; font-size: 18px; color: #2c3e50; }
.card-details p { margin: 0; font-size: 14px; color: #555; }
.game-desc { margin-top: 8px !important; font-style: italic; font-size: 13px !important; color: #777 !important; }
.no-data { color: #666; font-style: italic; text-align: center; font-size: 18px; margin-top: 40px;}

/* ========================================= */
/* ESTILOS DO MODAL DE CADASTRO              */
/* ========================================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 25px;
  width: 100%;
  max-width: 600px; /* Modal um pouco mais largo para acomodar os campos */
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.simple-form { display: flex; flex-direction: column; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-row { display: flex; gap: 15px; }
.half-width { flex: 1; }

.form-group label { margin-bottom: 6px; font-weight: bold; font-size: 14px; color: #333; }
.form-group input, .form-group textarea, .form-group select { 
  padding: 10px; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  font-size: 14px;
}
.file-input { padding: 6px !important; }
.multi-select { height: 100px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 15px; font-weight: bold; }
.btn-save { background-color: #42b983; color: white; }
.btn-save:hover { background-color: #3aa876; }
.btn-cancel { background-color: #f0f0f0; color: #555; }
.btn-cancel:hover { background-color: #e4e4e4; }
.error { color: #dc3545; font-size: 14px; margin-top: -5px; margin-bottom: 15px;}
</style>