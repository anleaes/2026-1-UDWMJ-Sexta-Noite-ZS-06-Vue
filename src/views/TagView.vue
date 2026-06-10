<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth'; // Importado para verificar se é Admin

const authStore = useAuthStore();

const tags = ref([]);
const errorMessage = ref('');
const successMessage = ref('');

// Form do cadastro de uma Tag base
const tagForm = ref({
  name: '',
  category: ''
});

// Carrega as Tags usando a rota correta do ecossistema
async function loadTags() {
  try {
    const response = await api.get('/tag/categoria/');
    tags.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    errorMessage.value = 'Erro ao carregar os marcadores.';
  }
}

// Cria uma nova Tag (Protegido)
async function handleCreateTag() {
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    // Montamos o pacote exatamente com os nomes que o modelo do Django exige
    const payload = {
      name: tagForm.value.name,
      category: tagForm.value.category,
      created_by: authStore.user.id  // Injetamos o ID do admin que está logado agora
    };

    // Enviamos o pacote completo para a rota correta
    await api.post('/tag/categoria/', payload);
    
    successMessage.value = 'Tag criada com sucesso!';
    // Limpa o formulário e recarrega a lista
    tagForm.value = { name: '', category: '' }; 
    loadTags();

  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Erro ao criar a tag.';
  }
}

onMounted(() => {
  loadTags();
  console.log("Usuário logado no Vue:", authStore.user);
});
</script>

<template>
  <div class="tag-container">
    <div class="header-titles">
      <h2>Marcadores da Comunidade (Tags)</h2>
      <p class="subtitle">Explore as tags disponíveis para categorizar os jogos.</p>
    </div>

    <div v-if="authStore.user?.is_admin" class="admin-section">
      <div class="form-section">
        <h3>+ Criar Nova Tag</h3>
        <form @submit.prevent="handleCreateTag" class="simple-form form-row">
          
          <div class="form-group half-width">
            <label for="tag-name">Nome da Tag</label>
            <input v-model="tagForm.name" type="text" id="tag-name" placeholder="Ex: Mundo Aberto, Terror" required />
          </div>
          
          <div class="form-group half-width">
            <label for="tag-category">Categoria</label>
            <input v-model="tagForm.category" type="text" id="tag-category" placeholder="Ex: Gênero, Mecânica" required />
          </div>

          <div class="btn-container">
            <button type="submit" class="btn">Salvar Tag</button>
          </div>
        </form>
        
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
      </div>
    </div>

    <div v-else class="user-notice">
      <p>⚠️ Apenas administradores do sistema podem criar novas tags. Se sentir falta de alguma, entre em contato com o suporte.</p>
    </div>

    <div class="list-section">
      <h3 class="list-title">Tags Existentes</h3>
      
      <div v-if="tags.length === 0" class="no-data">
        <p>Nenhuma tag foi criada no sistema ainda.</p>
      </div>
      
      <div v-else class="tags-grid">
        <div v-for="tag in tags" :key="tag.id" class="tag-card">
          <span class="tag-name">{{ tag.name }}</span>
          <span v-if="tag.category" class="tag-category">{{ tag.category }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.tag-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header-titles {
  text-align: center;
  margin-bottom: 30px;
}

.header-titles h2 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: #666;
}

/* Área do Administrador */
.admin-section {
  margin-bottom: 30px;
}

.form-section {
  border: 1px solid #cce5ff;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8fbff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.form-section h3 {
  margin-top: 0;
  color: #0056b3;
  border-bottom: 2px solid #e6f2ff;
  padding-bottom: 10px;
}

.simple-form {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.form-row {
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.half-width {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.btn-container {
  margin-bottom: 2px; /* Alinha o botão com os inputs */
}

.btn {
  padding: 11px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn:hover {
  background-color: #3aa876;
}

/* Aviso para usuários comuns */
.user-notice {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ffeeba;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
}

/* Listagem de Tags */
.list-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.list-title {
  margin-top: 0;
  color: #333;
  margin-bottom: 15px;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-card {
  display: flex;
  flex-direction: column;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  padding: 10px 15px;
  border-radius: 6px;
  min-width: 120px;
}

.tag-name {
  font-weight: bold;
  color: #212529;
  font-size: 15px;
}

.tag-category {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.error { color: #dc3545; font-size: 14px; margin-top: 15px; }
.success { color: #28a745; font-size: 14px; margin-top: 15px; }
.no-data { color: #666; font-style: italic; }
</style>