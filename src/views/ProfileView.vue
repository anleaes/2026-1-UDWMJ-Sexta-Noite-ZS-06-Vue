<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const profile = ref(null); // Guardará o perfil se ele existir
const isEditing = ref(false);

const errorMessage = ref('');
const successMessage = ref('');

// Campos do formulário
const formData = ref({
  bio: '',
  country: ''
});

// Arquivo de imagem selecionado para o avatar
const selectedAvatar = ref(null);

// Captura a seleção do arquivo de imagem
function handleAvatarChange(event) {
  selectedAvatar.value = event.target.files[0];
}

// Busca o perfil do usuário logado
async function fetchProfile() {
  try {
    const response = await api.get('/perfil/');
    
    // Como o get_queryset filtra pelo usuário logado, se existir um perfil, ele virá no primeiro índice da lista
    if (response.data && response.data.length > 0) {
      profile.value = response.data[0];
      // Preenche os dados do formulário para edição
      formData.value.bio = profile.value.bio;
      formData.value.country = profile.value.country;
    } else {
      profile.value = null;
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    errorMessage.value = 'Não foi possível carregar as informações do perfil.';
  }
}

// Cria o perfil pela primeira vez (POST)
async function handleCreateProfile() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const payload = new FormData();
    payload.append('bio', formData.value.bio);
    payload.append('country', formData.value.country);
    
    if (selectedAvatar.value) {
      payload.append('avatar', selectedAvatar.value);
    }

    await api.post('/perfil/', payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    successMessage.value = 'Perfil criado com sucesso!';
    selectedAvatar.value = null;
    fetchProfile(); // Recarrega os dados
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    errorMessage.value = 'Erro ao criar perfil. Verifique os campos.';
  }
}

// Atualiza o perfil existente 
async function handleUpdateProfile() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const payload = new FormData();
    payload.append('bio', formData.value.bio);
    payload.append('country', formData.value.country);
    
    if (selectedAvatar.value) {
      payload.append('avatar', selectedAvatar.value);
    }

    await api.patch(`/perfil/${profile.value.id}/`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    successMessage.value = 'Perfil atualizado com sucesso!';
    selectedAvatar.value = null;
    isEditing.value = false;
    fetchProfile(); // Recarrega os dados
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    errorMessage.value = 'Erro ao atualizar perfil.';
  }
}

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="profile-container">
    <h2>Meu Perfil</h2>

    <!-- CASO 1: O Usuário já possui um perfil cadastrado -->
    <div v-if="profile && !isEditing" class="profile-card">
      <div class="profile-header">
        <div class="avatar-container">
          <img v-if="profile.avatar" :src="profile.avatar" alt="Avatar" class="avatar-img" />
          <div v-else class="avatar-placeholder">Sem Foto</div>
        </div>
        <div class="profile-info">
          <h3>País: {{ profile.country }}</h3>
          <p><strong>Jogos Adicionados:</strong> {{ profile.games_added }}</p>
        </div>
      </div>
      
      <div class="profile-bio">
        <h4>Biografia</h4>
        <p>{{ profile.bio || 'Nenhuma biografia adicionada.' }}</p>
      </div>

      <button @click="isEditing = true" class="btn btn-edit">Editar Perfil</button>
    </div>

    <!-- CASO 2: O Usuário NÃO possui perfil, ou está editando um existente -->
    <div v-else class="form-section">
      <h3>{{ profile ? 'Editar Perfil' : 'Criar seu Perfil' }}</h3>
      
      <form @submit.prevent="profile ? handleUpdateProfile() : handleCreateProfile()" class="simple-form">
        <div class="form-group">
          <label for="country">País</label>
          <input v-model="formData.country" type="text" id="country" required />
        </div>

        <div class="form-group">
          <label for="avatar">Foto de Avatar</label>
          <input @change="handleAvatarChange" type="file" id="avatar" accept="image/*" />
        </div>

        <div class="form-group">
          <label for="bio">Biografia</label>
          <textarea v-model="formData.bio" id="bio" rows="5" placeholder="Escreva um pouco sobre você..."></textarea>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>

        <div class="button-group">
          <button type="submit" class="btn">Salvar</button>
          <button v-if="profile" type="button" @click="isEditing = false" class="btn btn-cancel">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.profile-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 24px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.profile-header {
  display: flex;
  gap: 20px;
  align-items: center;
}
.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  font-size: 12px;
  color: #777;
}
.profile-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}
.profile-info p {
  margin: 0;
  color: #666;
}
.profile-bio {
  margin-top: 25px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}
.profile-bio h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}
.profile-bio p {
  color: #555;
  line-height: 1.5;
}

/* Formulário */
.form-section {
  border: 1px solid #ccc;
  padding: 24px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.simple-form {
  display: flex;
  flex-direction: column;
}
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input, .form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.button-group {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}
.btn:hover { background-color: #3aa876; }
.btn-edit { margin-top: 20px; width: 100%; }
.btn-cancel { background-color: #777; }
.btn-cancel:hover { background-color: #555; }

.error { color: red; font-size: 14px; }
.success { color: green; font-size: 14px; }
</style>