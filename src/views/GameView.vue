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

// Dados do formulário principal
const formData = ref({
  title: '',
  description: '',
  release_year: '',
  average_rating: '', // Novo campo adicionado
  developer: '',    
  genre: [],        
  consoles: []      
});

const selectedFile = ref(null);

// ==========================================
// ESTADOS PARA CRIAÇÃO INLINE COM TODOS OS CAMPOS
// ==========================================
// Desenvolvedora
const showNewDev = ref(false);
const newDevName = ref('');
const newDevCountry = ref('');
const newDevFoundationYear = ref('');
const newDevDescription = ref('');

// Gênero
const showNewGenre = ref(false);
const newGenreName = ref('');
const newGenreDescription = ref('');

// Console
const showNewConsole = ref(false);
const newConsoleName = ref('');
const newConsoleManufacturer = ref('');
const newConsoleReleaseYear = ref('');

// ==========================================
// LÓGICA DE SELEÇÃO MÚLTIPLA (CHIPS)
// ==========================================
function toggleGenre(id) {
  const index = formData.value.genre.indexOf(id);
  if (index > -1) {
    formData.value.genre.splice(index, 1);
  } else {
    formData.value.genre.push(id);
  }
}

function toggleConsole(id) {
  const index = formData.value.consoles.indexOf(id);
  if (index > -1) {
    formData.value.consoles.splice(index, 1);
  } else {
    formData.value.consoles.push(id);
  }
}

// ==========================================
// LÓGICA DE AVALIAÇÃO (RATING) E ANO
// ==========================================
function handleYearChange(event) {
  const numericValue = event.target.value.replace(/[^0-9]/g, '');
  formData.value.release_year = numericValue;
}

function handleRatingChange(event) {
  let cleaned = event.target.value.replace(/[^0-9]/g, '');
  if (cleaned === '') { 
    formData.value.average_rating = ''; 
    return; 
  }
  let num = parseInt(cleaned, 10);
  if (num > 100) num = 100; 
  
  if (num === 100) {
    formData.value.average_rating = '10.0';
  } else if (cleaned.length >= 2) {
    let firstPart = cleaned.substring(0, cleaned.length - 1);
    let lastPart = cleaned.substring(cleaned.length - 1);
    formData.value.average_rating = `${firstPart}.${lastPart}`;
  } else {
    formData.value.average_rating = cleaned;
  }
}

function incrementRating() {
  let current = parseFloat(formData.value.average_rating) || 0;
  if (current < 10) {
    formData.value.average_rating = (current + 0.1).toFixed(1);
  }
}

function decrementRating() {
  let current = parseFloat(formData.value.average_rating) || 0;
  if (current > 0) {
    formData.value.average_rating = (current - 0.1).toFixed(1);
  }
}

// ==========================================
// FUNÇÕES DE CRIAÇÃO INLINE
// ==========================================
async function handleCreateDeveloper() {
  if (!newDevName.value) return alert('O nome da Desenvolvedora é obrigatório!');
  try {
    const res = await api.post('/developer/', { 
      name: newDevName.value,
      country: newDevCountry.value,
      foundation_year: newDevFoundationYear.value ? Number(newDevFoundationYear.value) : null,
      description: newDevDescription.value
    });
    developers.value.push(res.data);
    formData.value.developer = res.data.id; 
    
    showNewDev.value = false;
    newDevName.value = '';
    newDevCountry.value = '';
    newDevFoundationYear.value = '';
    newDevDescription.value = '';
    alert('Desenvolvedora criada!');
  } catch (error) { 
    alert('Erro ao criar Desenvolvedora.'); 
  }
}

async function handleCreateGenre() {
  if (!newGenreName.value) return alert('O nome do Gênero é obrigatório!');
  try {
    const res = await api.post('/genre/', { 
      name: newGenreName.value,
      description: newGenreDescription.value
    });
    genres.value.push(res.data);
    // Auto-seleciona o gênero criado (como no seu React)
    if (!formData.value.genre.includes(res.data.id)) {
      formData.value.genre.push(res.data.id);
    }
    
    showNewGenre.value = false;
    newGenreName.value = '';
    newGenreDescription.value = '';
    alert('Gênero criado!');
  } catch (error) { 
    alert('Erro ao criar Gênero.'); 
  }
}

async function handleCreateConsole() {
  if (!newConsoleName.value) return alert('O nome do Console é obrigatório!');
  try {
    const res = await api.post('/console/', { 
      name: newConsoleName.value, 
      manufacturer: newConsoleManufacturer.value,
      release_year: newConsoleReleaseYear.value ? Number(newConsoleReleaseYear.value) : null
    });
    consolesList.value.push(res.data);
    // Auto-seleciona o console criado
    if (!formData.value.consoles.includes(res.data.id)) {
      formData.value.consoles.push(res.data.id);
    }
    
    showNewConsole.value = false;
    newConsoleName.value = '';
    newConsoleManufacturer.value = '';
    newConsoleReleaseYear.value = '';
    alert('Console criado!');
  } catch (error) { 
    alert('Erro ao criar Console.'); 
  }
}

// ==========================================
// FUNÇÕES PRINCIPAIS E DE DADOS
// ==========================================
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

  // VALIDAÇÕES (Idênticas ao React)
  if (!formData.value.title || !formData.value.developer || formData.value.genre.length === 0 || formData.value.consoles.length === 0) {
    alert("Atenção: Preencha o título, desenvolvedora, ao menos um gênero e um console!");
    return;
  }

  if (formData.value.release_year) {
    const yearNum = parseInt(formData.value.release_year, 10);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1950 || yearNum > currentYear + 5) {
      alert("Atenção: Por favor, insira um ano de lançamento válido.");
      return;
    }
  }

  try {
    const payload = new FormData();
    payload.append('title', formData.value.title);
    payload.append('description', formData.value.description);
    payload.append('release_year', formData.value.release_year);
    payload.append('developer', formData.value.developer);

    // Ajuste da nota
    let finalRating = formData.value.average_rating;
    if (finalRating === "0" || finalRating === "0.") finalRating = "0.0";
    if (finalRating !== "") payload.append("average_rating", finalRating);

    if (selectedFile.value) {
      payload.append('cover_image', selectedFile.value);
    }

    formData.value.genre.forEach(id => payload.append('genre', id));
    formData.value.consoles.forEach(id => payload.append('consoles', id));

    await api.post('/jogos/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Limpeza
    formData.value = { title: '', description: '', release_year: '', average_rating: '', developer: '', genre: [], consoles: [] };
    selectedFile.value = null;
    showModal.value = false; 
    
    alert('Jogo cadastrado com sucesso!');
    loadAllData();
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error);
    alert('O Django recusou os dados. Verifique o console.');
  }
}

function getDeveloperName(dev) {
  if (!dev) return '-';
  if (typeof dev === 'object') return dev.name;
  const found = developers.value.find(d => d.id === dev);
  return found ? found.name : '-';
}

function getGenresNames(genreData) {
  if (!genreData || genreData.length === 0) return '-';
  if (typeof genreData[0] === 'object') return genreData.map(g => g.name).join(', ');
  return genres.value.filter(g => genreData.includes(g.id)).map(g => g.name).join(', ');
}

function getConsolesNames(consoleData) {
  if (!consoleData || consoleData.length === 0) return '-';
  if (typeof consoleData[0] === 'object') return consoleData.map(c => c.name).join(', ');
  return consolesList.value.filter(c => consoleData.includes(c.id)).map(c => c.name).join(', ');
}

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="game-container">
    
    <div class="header-row">
      <h2>Catálogo de Jogos</h2>
      <button class="add-game-btn" @click="showModal = true">+ Adicionar Novo Jogo</button>
    </div>

    <div class="list-section">
      <p v-if="games.length === 0" class="no-data">Nenhum jogo cadastrado.</p>
      
      <div v-else class="games-grid">
        <router-link v-for="game in games" :key="game.id" :to="`/jogo/${game.id}`" class="game-card clickable-card">
          <div class="card-image">
            <img v-if="game.cover_image" :src="game.cover_image" alt="Capa" />
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

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea v-model="formData.description" id="description" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="release_year">Ano de Lançamento</label>
              <input v-model="formData.release_year" @input="handleYearChange" type="text" id="release_year" maxlength="4" />
            </div>

            <div class="form-group half-width">
              <label>Avaliação</label>
              <div class="rating-container">
                <button type="button" class="rating-btn" @click="decrementRating">-</button>
                <input 
                  v-model="formData.average_rating" 
                  @input="handleRatingChange" 
                  type="text" 
                  class="rating-input" 
                  placeholder="0.0" 
                  maxlength="4" 
                />
                <button type="button" class="rating-btn" @click="incrementRating">+</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="cover_image">Capa do Jogo</label>
            <input @change="handleFileChange" type="file" id="cover_image" accept="image/*" class="file-input" />
          </div>

          <div class="form-group">
            <div class="label-with-action">
              <label for="developer">Desenvolvedora</label>
              <button type="button" class="btn-link" @click="showNewDev = !showNewDev">
                {{ showNewDev ? 'Cancelar' : '+ Nova Desenvolvedora' }}
              </button>
            </div>
            
            <div v-if="showNewDev" class="inline-create multi-inputs sub-box">
              <input v-model="newDevName" type="text" placeholder="Nome" />
              <input v-model="newDevCountry" type="text" placeholder="País" />
              <input v-model="newDevFoundationYear" type="number" placeholder="Ano de Fundação" />
              <textarea v-model="newDevDescription" placeholder="Descrição" rows="2"></textarea>
              <button type="button" @click="handleCreateDeveloper" class="btn-save-inline full-width">Salvar Desenvolvedora</button>
            </div>
            
            <select v-else v-model="formData.developer" id="developer" required>
              <option value="" disabled>Selecione uma desenvolvedora</option>
              <option v-for="dev in developers" :key="dev.id" :value="dev.id">{{ dev.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <div class="label-with-action">
              <label>Gêneros</label>
              <button type="button" class="btn-link" @click="showNewGenre = !showNewGenre">
                {{ showNewGenre ? 'Cancelar' : '+ Novo Gênero' }}
              </button>
            </div>

            <div class="chips-container">
              <button 
                type="button" 
                v-for="gen in genres" 
                :key="gen.id" 
                :class="['chip', { 'chip-selected': formData.genre.includes(gen.id) }]"
                @click="toggleGenre(gen.id)"
              >
                {{ gen.name }}
              </button>
            </div>

            <div v-if="showNewGenre" class="inline-create multi-inputs sub-box" style="margin-top: 10px;">
              <input v-model="newGenreName" type="text" placeholder="Nome do Gênero" />
              <textarea v-model="newGenreDescription" placeholder="Descrição" rows="2"></textarea>
              <button type="button" @click="handleCreateGenre" class="btn-save-inline full-width">Salvar Gênero</button>
            </div>
          </div>

          <div class="form-group">
            <div class="label-with-action">
              <label>Consoles</label>
              <button type="button" class="btn-link" @click="showNewConsole = !showNewConsole">
                {{ showNewConsole ? 'Cancelar' : '+ Novo Console' }}
              </button>
            </div>

            <div class="chips-container">
              <button 
                type="button" 
                v-for="con in consolesList" 
                :key="con.id" 
                :class="['chip', { 'chip-selected': formData.consoles.includes(con.id) }]"
                @click="toggleConsole(con.id)"
              >
                {{ con.name }}
              </button>
            </div>

            <div v-if="showNewConsole" class="inline-create multi-inputs sub-box" style="margin-top: 10px;">
              <input v-model="newConsoleName" type="text" placeholder="Nome do Console" />
              <input v-model="newConsoleManufacturer" type="text" placeholder="Fabricante" />
              <input v-model="newConsoleReleaseYear" type="number" placeholder="Ano de Lançamento" />
              <button type="button" @click="handleCreateConsole" class="btn-save-inline full-width">Salvar Console</button>
            </div>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <div class="modal-footer">
            <button type="button" class="btn btn-cancel" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn btn-save">Salvar Novo Jogo</button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ESTILOS DA LISTA E BASE */
.game-container { padding: 20px; font-family: Arial, sans-serif; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; }
.header-row h2 { margin: 0; color: #2c3e50; }
.add-game-btn { background-color: #42b983; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; transition: background-color 0.2s; }
.add-game-btn:hover { background-color: #3aa876; }
.list-section { width: 100%; }
.games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 15px; }
.game-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
.clickable-card { text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
.clickable-card:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
.card-image { height: 160px; background-color: #eaeaea; display: flex; align-items: center; justify-content: center; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.no-image { color: #777; font-weight: bold; }
.card-details { padding: 15px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.card-details h4 { margin: 0; font-size: 18px; color: #2c3e50; }
.card-details p { margin: 0; font-size: 14px; color: #555; }
.game-desc { margin-top: 8px !important; font-style: italic; font-size: 13px !important; color: #777 !important; }
.no-data { color: #666; font-style: italic; text-align: center; font-size: 18px; margin-top: 40px;}

/* MODAL E FORMULÁRIO */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; box-sizing: border-box; }
.modal-content { background-color: #fff; border-radius: 8px; padding: 25px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.modal-header h3 { margin: 0; color: #2c3e50; font-size: 20px; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #999; }
.close-btn:hover { color: #333; }
.simple-form { display: flex; flex-direction: column; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-row { display: flex; gap: 15px; }
.half-width { flex: 1; }
.form-group label { margin-bottom: 6px; font-weight: bold; font-size: 14px; color: #333; }
.form-group input, .form-group textarea, .form-group select { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
.file-input { padding: 6px !important; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
.btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 15px; font-weight: bold; }
.btn-save { background-color: #42b983; color: white; }
.btn-save:hover { background-color: #3aa876; }
.btn-cancel { background-color: #f0f0f0; color: #555; }
.btn-cancel:hover { background-color: #e4e4e4; }
.error { color: #dc3545; font-size: 14px; margin-top: -5px; margin-bottom: 15px;}

/* ========================================== */
/* ESTILOS DE AVALIAÇÃO E CHIPS (NOVOS)       */
/* ========================================== */
.rating-container { display: flex; align-items: center; gap: 8px; }
.rating-btn { background-color: #42b983; color: white; border: none; border-radius: 4px; width: 35px; height: 35px; font-size: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.rating-btn:hover { background-color: #3aa876; }
.rating-input { width: 60px; text-align: center; }

.chips-container { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background-color: #f0f4ff; border: 1px solid #ccc; border-radius: 20px; padding: 8px 15px; font-size: 14px; font-weight: bold; color: #333; cursor: pointer; transition: all 0.2s; }
.chip:hover { background-color: #e2eafc; }
.chip-selected { background-color: #42b983; border-color: #42b983; color: white; }
.chip-selected:hover { background-color: #3aa876; }

/* CRIAÇÃO INLINE */
.label-with-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.label-with-action label { margin-bottom: 0; }
.btn-link { background: none; border: none; color: #007bff; font-size: 12px; cursor: pointer; padding: 0; font-weight: bold; }
.btn-link:hover { text-decoration: underline; }
.sub-box { background-color: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px dashed #ccc; }
.inline-create { display: flex; gap: 5px; }
.inline-create input, .inline-create textarea { flex: 1; padding: 8px; font-size: 13px; }
.multi-inputs { flex-direction: column; gap: 8px; } 
.btn-save-inline { background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px; padding: 8px; }
.btn-save-inline:hover { background-color: #218838; }
.full-width { width: 100%; }
</style>