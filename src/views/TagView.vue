<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const tags = ref([]);
const gameTags = ref([]);
const games = ref([]);

const errorMessage = ref('');
const successMessage = ref('');

// Form do cadastro de uma Tag base
const tagForm = ref({
  name: '',
  category: ''
});

// Form do vinculo da Tag com o Jogo (GameTag)
const gameTagForm = ref({
  game: '',
  tag: '',
  is_primary: false,
  is_spoiler: false
});

// Carrega todos os dados do backend
async function loadData() {
  try {
    const [tagsRes, gameTagsRes, gamesRes] = await Promise.all([
      api.get('/tag/tag/'),
      api.get('/tag/gametag/'),
      api.get('/jogos/')
    ]);

    tags.value = tagsRes.data;
    gameTags.value = gameTagsRes.data;
    games.value = gamesRes.data;
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    errorMessage.value = 'Erro ao carregar as informações das marcadores.';
  }
}

// Cria uma nova Tag
async function handleCreateTag() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await api.post('/tag/tag/', tagForm.value);
    successMessage.value = 'Tag criada com sucesso!';
    tagForm.value = { name: '', category: '' };
    loadData();
  } catch (error) {
    console.error('Erro ao cadastrar tag:', error);
    errorMessage.value = 'Erro ao cadastrar nova tag.';
  }
}

// Vincula a Tag ao Jogo (Cria uma GameTag)
async function handleLinkGameTag() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await api.post('/tag/gametag/', gameTagForm.value);
    successMessage.value = 'Tag associada ao jogo com sucesso!';
    gameTagForm.value = { game: '', tag: '', is_primary: false, is_spoiler: false };
    loadData();
  } catch (error) {
    console.error('Erro ao vincular tag ao jogo:', error);
    errorMessage.value = 'Erro ao associar marcador ao jogo.';
  }
}

// Auxiliares para formatação de listagem
function getGameTitle(id) {
  const game = games.value.find(g => g.id === id);
  return game ? game.title : '-';
}

function getTagName(id) {
  const tag = tags.value.find(t => t.id === id);
  return tag ? tag.name : '-';
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="tag-container">
    <h2>Gerenciar Marcadores (Tags)</h2>

    <div class="content-layout">
      <!-- Formulários (Esquerda) -->
      <div class="forms-column">
        <!-- FORM 1: Criar Tag Global -->
        <div class="form-section">
          <h3>Cadastrar Nova Tag</h3>
          <form @submit.prevent="handleCreateTag" class="simple-form">
            <div class="form-group">
              <label for="tag-name">Nome da Tag</label>
              <input v-model="tagForm.name" type="text" id="tag-name" placeholder="Ex: Terror, Indie" required />
            </div>
            
            <div class="form-group">
              <label for="tag-category">Categoria</label>
              <input v-model="tagForm.category" type="text" id="tag-category" placeholder="Ex: Gênero, Mecânica" required />
            </div>

            <button type="submit" class="btn">Salvar Tag</button>
          </form>
        </div>

        <!-- FORM 2: Associar Tag ao Jogo (GameTag) -->
        <div class="form-section">
          <h3>Associar Tag a um Jogo</h3>
          <form @submit.prevent="handleLinkGameTag" class="simple-form">
            <div class="form-group">
              <label for="game-select">Jogo</label>
              <select v-model="gameTagForm.game" id="game-select" required>
                <option value="" disabled>Selecione um jogo</option>
                <option v-for="g in games" :key="g.id" :value="g.id">{{ g.title }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="tag-select">Tag</label>
              <select v-model="gameTagForm.tag" id="tag-select" required>
                <option value="" disabled>Selecione uma tag</option>
                <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }} ({{ t.category }})</option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <input v-model="gameTagForm.is_primary" type="checkbox" id="is_primary" />
              <label for="is_primary">Tag Principal</label>
            </div>

            <div class="form-group checkbox-group">
              <input v-model="gameTagForm.is_spoiler" type="checkbox" id="is_spoiler" />
              <label for="is_spoiler">Contém Spoiler</label>
            </div>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>

            <button type="submit" class="btn">Associar Marcador</button>
          </form>
        </div>
      </div>

      <!-- Tabela de Listagem de Associações (Direita) -->
      <div class="list-section">
        <h3>Lista de Associações (GameTags)</h3>
        <p v-if="gameTags.length === 0" class="no-data">Nenhuma associação de tag realizada.</p>
        
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Marcador (Tag)</th>
              <th>Principal?</th>
              <th>Spoiler?</th>
              <th>Votos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gt in gameTags" :key="gt.id">
              <td><strong>{{ getGameTitle(gt.game) }}</strong></td>
              <td><span class="tag-badge">{{ getTagName(gt.tag) }}</span></td>
              <td>{{ gt.is_primary ? 'Sim ⭐' : 'Não' }}</td>
              <td>{{ gt.is_spoiler ? '⚠️ Spoiler' : 'Não' }}</td>
              <td>👍 {{ gt.upvotes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.content-layout {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.forms-column {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-section {
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
.form-group input, .form-group select {
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
.tag-badge {
  background-color: #e0f2f1;
  color: #004d40;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 13px;
}
.no-data {
  color: #666;
  font-style: italic;
}
</style>