<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const gameId = route.params.id;

const game = ref(null);
const loading = ref(true);

// Estados
const reviews = ref([]);
const meuComentario = ref("");
const minhaNota = ref("");
const recomendo = ref(true);

const screenshots = ref([]);
const fotoDestaque = ref(null);
const fileInput = ref(null); // Ref para o input de arquivo invisível

// --- ESTADOS DAS TAGS ---
const gameTags = ref([]);
const todasAsTags = ref([]);
const revealedSpoilers = ref([]);

// Estados do Modal
const modalTagsVisible = ref(false);
const selectedTagToAdd = ref("");
const isPrimaryNewTag = ref(false);
const isSpoilerNewTag = ref(false);

onMounted(() => {
  carregarDetalhes();
  carregarReviews();
  carregarScreenshots();
  carregarGameTags();
  carregarTodasAsTags();
});

const carregarDetalhes = async () => {
  try {
    const response = await api.get(`/jogos/${gameId}/`);
    game.value = response.data;
  } catch (error) { 
    console.error(error); 
  } finally { 
    loading.value = false; 
  }
};

const carregarReviews = async () => {
  try {
    const response = await api.get(`/review/?game=${gameId}`);
    reviews.value = response.data;
  } catch (error) { console.error(error); }
};

const carregarScreenshots = async () => {
  try {
    const response = await api.get(`/jogos/screenshot/?game=${gameId}`);
    screenshots.value = response.data;
    if (response.data.length > 0) fotoDestaque.value = response.data[0];
    else fotoDestaque.value = null; 
  } catch (error) { console.error(error); }
};

// --- LÓGICA DE TAGS ---
const carregarGameTags = async () => {
  try {
    const response = await api.get(`/tag/gametag/?game=${gameId}`);
    const sorted = response.data.sort((a, b) => b.is_primary === a.is_primary ? 0 : b.is_primary ? 1 : -1);
    gameTags.value = sorted;
  } catch (error) { console.error("Erro ao carregar tags do jogo:", error); }
};

const carregarTodasAsTags = async () => {
  try {
    const response = await api.get(`/tag/categoria/`);
    todasAsTags.value = response.data;
  } catch (error) { console.error("Erro ao carregar tags base:", error); }
};

const handleAddGameTag = async () => {
  if (!selectedTagToAdd.value) {
    alert("Selecione uma tag para adicionar.");
    return;
  }
  try {
    await api.post('/tag/gametag/', {
      game: gameId,
      tag: selectedTagToAdd.value,
      is_primary: isPrimaryNewTag.value,
      is_spoiler: isSpoilerNewTag.value
    });
    alert("Tag adicionada ao jogo!");
    carregarGameTags();
    selectedTagToAdd.value = "";
    isPrimaryNewTag.value = false;
    isSpoilerNewTag.value = false;
  } catch (error) {
    alert("Não foi possível adicionar a tag.");
  }
};

const handleRemoveGameTag = async (idGameTag) => {
  try {
    await api.delete(`/tag/gametag/${idGameTag}/`);
    carregarGameTags();
  } catch (error) {
    alert("Não foi possível remover a tag.");
  }
};

const toggleSpoiler = (idGameTag) => {
  if (!revealedSpoilers.value.includes(idGameTag)) {
    revealedSpoilers.value.push(idGameTag);
  }
};

// --- LÓGICA DE CARROSSEL ---
const openFilePicker = () => {
  fileInput.value.click(); // Aciona o clique no input file invisível
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('game', gameId);
  formData.append('image', file);

  try {
    await api.post('/jogos/screenshot/', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }); 
    alert("Foto adicionada!");
    carregarScreenshots();
  } catch (error) { 
    alert("Não foi possível enviar a imagem."); 
  }
  
  event.target.value = ''; // Limpa o input
};

const handleApagarFoto = async () => {
  if (!fotoDestaque.value) return;
  
  if (window.confirm("Tem certeza que deseja remover esta imagem?")) {
    try {
      await api.delete(`/jogos/screenshot/${fotoDestaque.value.id}/`);
      alert("Foto removida.");
      carregarScreenshots(); 
    } catch (error) { 
      alert("Acesso Negado ou Falha de conexão."); 
    }
  }
};

// --- LÓGICA DE REVIEWS ---
const handleNotaChange = (event) => {
  let valorLimpo = event.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
  const partes = valorLimpo.split('.');
  if (partes.length > 2) valorLimpo = partes[0] + '.' + partes.slice(1).join('');
  if (!valorLimpo.includes('.') && valorLimpo.length === 2) {
    if (parseInt(valorLimpo) > 10 || valorLimpo.startsWith('0')) valorLimpo = `${valorLimpo[0]}.${valorLimpo[1]}`;
  }
  if (valorLimpo.includes('.')) {
    const [inteiro, decimal] = valorLimpo.split('.');
    if (decimal.length > 1) valorLimpo = `${inteiro}.${decimal.substring(0, 1)}`;
  }
  if (parseFloat(valorLimpo) > 10) valorLimpo = '10';
  minhaNota.value = valorLimpo;
};

const handleEnviarReview = async () => {
  if (!meuComentario.value.trim() || !minhaNota.value) return alert("Preencha a nota e comentário.");
  const notaNum = parseFloat(minhaNota.value);
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) return alert("Nota inválida.");
  
  try {
    await api.post('/review/', { 
      game: gameId, 
      rating: notaNum, 
      comment: meuComentario.value, 
      recommended: recomendo.value 
    });
    meuComentario.value = ""; 
    minhaNota.value = ""; 
    carregarReviews();
  } catch (error) { 
    alert("Não foi possível avaliar."); 
  }
};

const renderList = (items) => {
  if (!items || items.length === 0) return 'Não informado';
  return items.map(item => item.name || item).join(', ');
};
</script>

<template>
  <div v-if="loading" class="center">
    <p class="loading-text">Carregando detalhes...</p>
  </div>
  <div v-else-if="!game" class="center">
    <p class="loading-text">Jogo não encontrado.</p>
  </div>
  
  <div v-else class="container">
    <button class="back-button" @click="router.back()">← Voltar à Biblioteca</button>
    <h1 class="title">{{ game.title }}</h1>
    
    <div class="main-row">
      
      <div class="carousel-column">
        
        <div class="main-image-container">
          <template v-if="fotoDestaque">
            <img :src="fotoDestaque.image" class="main-image" alt="Screenshot do jogo" />
            <button class="delete-button" @click="handleApagarFoto" title="Apagar foto">🗑️</button>
          </template>
          <div v-else class="main-image-placeholder">
            <span class="placeholder-text">Nenhuma imagem na galeria</span>
          </div>
        </div>

        <div class="thumbnail-row-container">
          <div class="thumbnail-scroll">
            <img 
              v-for="shot in screenshots" 
              :key="shot.id"
              :src="shot.image" 
              class="thumbnail" 
              :class="{ 'thumbnail-active': fotoDestaque?.id === shot.id }"
              @click="fotoDestaque = shot"
              alt="Miniatura"
            />
            
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none" 
              accept="image/*" 
              @change="handleFileChange"
            />
            <button class="add-photo-button" @click="openFilePicker">
              + Adicionar Foto
            </button>
          </div>
        </div>

        <div class="tags-section">
          <div class="tags-header">
            <h2 class="tags-title">Tags da Comunidade</h2>
            <button class="manage-tags-btn" @click="modalTagsVisible = true">+ Gerenciar Tags</button>
          </div>
          
          <div class="tags-wrapper">
            <p v-if="gameTags.length === 0" class="no-reviews-text">Nenhuma tag associada a este jogo.</p>
            
            <template v-for="gt in gameTags" :key="gt.id">
              <button 
                v-if="gt.is_spoiler && !revealedSpoilers.includes(gt.id)" 
                class="tag tag-spoiler-hidden" 
                @click="toggleSpoiler(gt.id)"
              >
                [ SPOILER - TOQUE PARA LER ]
              </button>
              
              <div 
                v-else 
                class="tag tag-normal" 
                :class="{ 'tag-primary': gt.is_primary }"
              >
                {{ gt.tag_details?.name || 'Tag' }}
              </div>
            </template>
          </div>
        </div>

      </div>

      <div class="info-column">
        <div v-if="game.cover_image" class="cover-image-container">
          <img :src="game.cover_image" class="cover-image" alt="Capa do Jogo" />
        </div>
        <div v-else class="cover-placeholder">
          <span class="placeholder-text">Sem Capa</span>
        </div>

        <div class="details-box">
          <p class="description">{{ game.description }}</p>
          <hr class="separator" />
          <p class="detail-row"><span class="detail-label">Ano:</span> {{ game.release_year }}</p>
          <p class="detail-row"><span class="detail-label">Nota Média:</span> {{ game.average_rating ? game.average_rating : 'Sem avaliações' }}</p>
          <p class="detail-row"><span class="detail-label">Desenvolvedora:</span> {{ game.developer ? game.developer.name : 'Não informado' }}</p>
          <p class="detail-row"><span class="detail-label">Gêneros:</span> {{ renderList(game.genre) }}</p>
          <p class="detail-row"><span class="detail-label">Consoles:</span> {{ renderList(game.consoles) }}</p>
        </div>
      </div>

    </div>

    <div class="reviews-section">
      <h2 class="section-title">Avaliações</h2>
      
      <div class="write-review-box">
        <div class="review-controls-row">
          <div class="rating-input-container">
            <span class="rating-label">Nota (0-10):</span>
            <input 
              type="text" 
              class="rating-input" 
              v-model="minhaNota" 
              @input="handleNotaChange" 
              placeholder="Ex: 8.5" 
              maxlength="4" 
            />
          </div>
          <button 
            class="recommend-button" 
            :class="recomendo ? 'recommend-active' : 'recommend-inactive'" 
            @click="recomendo = !recomendo"
          >
            {{ recomendo ? '👍 Recomendo' : '👎 Não Recomendo' }}
          </button>
        </div>
        
        <textarea 
          class="review-input" 
          placeholder="Escreva aqui..." 
          v-model="meuComentario"
        ></textarea>
        
        <button class="submit-review-button" @click="handleEnviarReview">
          Publicar Avaliação
        </button>
      </div>

      <p v-if="reviews.length === 0" class="no-reviews-text">Nenhuma avaliação ainda.</p>
      
      <div v-for="rev in reviews" :key="rev.id" class="review-card">
        <div class="review-header">
          <span class="review-user">@{{ rev.username }}</span>
          <div class="review-stats">
            <span class="review-rating-tag">Nota: {{ rev.rating }}</span>
            <span v-if="rev.recommended" class="tag-recomenda">👍 Recomendado</span>
            <span v-else class="tag-nao-recomenda">👎 Não Recomendado</span>
          </div>
        </div>
        <p class="review-comment">{{ rev.comment }}</p>
      </div>
    </div>

    <div v-if="modalTagsVisible" class="modal-overlay" @click.self="modalTagsVisible = false">
      <div class="modal-content">
        <h3 class="modal-title">Gerenciar Tags do Jogo</h3>
        <hr class="separator" />

        <h4 class="modal-subtitle">Adicionar Nova Tag</h4>
        <div class="picker-container-modal">
          <select v-model="selectedTagToAdd" class="picker-select-modal">
            <option value="" disabled>Selecione uma Tag...</option>
            <option v-for="t in todasAsTags" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="switch-row">
          <span class="switch-label">Destaque Principal? (Primária)</span>
          <input type="checkbox" v-model="isPrimaryNewTag" class="vue-switch" />
        </div>
        <div class="switch-row">
          <span class="switch-label">Contém Spoiler?</span>
          <input type="checkbox" v-model="isSpoilerNewTag" class="vue-switch vue-switch-danger" />
        </div>

        <button class="add-tag-button" @click="handleAddGameTag">Adicionar ao Jogo</button>

        <hr class="separator" style="margin-top: 20px;" />

        <h4 class="modal-subtitle">Tags Aplicadas (Clique na lixeira para remover)</h4>
        <div class="tags-list-modal">
          <p v-if="gameTags.length === 0" class="no-reviews-text" style="margin: 0;">Nenhuma tag ainda.</p>
          <div v-for="gt in gameTags" :key="gt.id" class="modal-tag-item">
            <span class="modal-tag-item-text">
              {{ gt.tag_details?.name }} {{ gt.is_primary ? '(Primária)' : '' }} {{ gt.is_spoiler ? '(Spoiler)' : '' }}
            </span>
            <button class="delete-icon-btn" @click="handleRemoveGameTag(gt.id)">❌</button>
          </div>
        </div>

        <button class="close-modal-button" @click="modalTagsVisible = false">Fechar Janela</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Reset básico para o componente */
* { box-sizing: border-box; font-family: sans-serif; }

.center { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #1b2838; }
.loading-text { color: #fff; font-size: 1.2rem; }

.container { padding: 20px; background-color: #1b2838; min-height: 100vh; color: #fff; }

.back-button { align-self: flex-start; background-color: rgba(102, 192, 244, 0.2); color: #66c0f4; border: none; padding: 8px 12px; border-radius: 6px; margin-bottom: 20px; cursor: pointer; font-size: 14px; font-weight: bold; }
.back-button:hover { background-color: rgba(102, 192, 244, 0.3); }

.title { font-size: 32px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 20px; }

/* Grid principal Responsivo (Desktop = Row, Mobile = Column) */
.main-row { display: flex; gap: 20px; margin-bottom: 30px; }
@media (max-width: 768px) {
  .main-row { flex-direction: column-reverse; }
}

.carousel-column { display: flex; flex-direction: column; gap: 10px; flex: 2; min-width: 0; }
.info-column { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }

/* Carrossel */
.main-image-container { position: relative; width: 100%; height: 350px; background-color: #000000; border-radius: 4px; overflow: hidden; display: flex; justify-content: center; align-items: center; }
.main-image { width: 100%; height: 100%; object-fit: contain; }
.main-image-placeholder { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }

.thumbnail-row-container { background-color: #171a21; border-radius: 4px; padding: 10px; overflow-x: auto; }
.thumbnail-scroll { display: flex; gap: 10px; align-items: center; }
.thumbnail { width: 120px; height: 68px; border-radius: 4px; opacity: 0.5; cursor: pointer; object-fit: cover; }
.thumbnail:hover { opacity: 0.8; }
.thumbnail-active { opacity: 1; border: 2px solid #66c0f4; }

.add-photo-button { flex-shrink: 0; width: 120px; height: 68px; background-color: rgba(102, 192, 244, 0.1); border: 1px dashed #66c0f4; color: #66c0f4; font-weight: bold; font-size: 13px; display: flex; justify-content: center; align-items: center; border-radius: 4px; cursor: pointer; }
.add-photo-button:hover { background-color: rgba(102, 192, 244, 0.2); }
.delete-button { position: absolute; top: 10px; right: 10px; background-color: rgba(0,0,0,0.6); border: none; padding: 8px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.delete-button:hover { background-color: rgba(255, 68, 68, 0.8); }

/* Informações da Direita */
.cover-image-container { width: 100%; aspect-ratio: 3/4; border-radius: 4px; overflow: hidden; }
.cover-image { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { width: 100%; aspect-ratio: 3/4; background-color: #2a475e; display: flex; justify-content: center; align-items: center; border-radius: 4px; }
.placeholder-text { color: #8f98a0; font-weight: bold; text-align: center; }

.details-box { background-color: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 4px; }
.description { color: #c7d5e0; font-size: 14px; line-height: 1.5; margin-top: 0; margin-bottom: 15px; }
.separator { height: 1px; background-color: #2a475e; border: none; margin: 15px 0; }
.detail-row { color: #66c0f4; font-size: 13px; margin: 0 0 6px 0; }
.detail-label { color: #8f98a0; font-weight: bold; }

/* Tags */
.tags-section { margin-top: 10px; margin-bottom: 20px; }
.tags-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.tags-title { font-size: 18px; font-weight: bold; color: #fff; text-transform: uppercase; margin: 0; }
.manage-tags-btn { background-color: rgba(102, 192, 244, 0.2); border: none; color: #66c0f4; font-weight: bold; font-size: 12px; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.manage-tags-btn:hover { background-color: rgba(102, 192, 244, 0.3); }

.tags-wrapper { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 6px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; }
.tag-normal { background-color: #2a475e; color: #c7d5e0; }
.tag-primary { background-color: #66c0f4; color: #1b2838; }
.tag-spoiler-hidden { background-color: #000000; color: #666; border: 1px solid #444; letter-spacing: 1px; cursor: pointer; }
.tag-spoiler-hidden:hover { border-color: #66c0f4; color: #888; }

/* Reviews */
.reviews-section { margin-top: 20px; border-top: 1px solid #2a475e; padding-top: 20px; }
.section-title { font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; }

.write-review-box { background-color: #171a21; padding: 15px; border-radius: 4px; margin-bottom: 25px; }
.review-controls-row { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
.rating-input-container { display: flex; align-items: center; background-color: #2a475e; border-radius: 4px; padding: 0 10px; }
.rating-label { color: #c7d5e0; font-weight: bold; margin-right: 5px; }
.rating-input { background: transparent; border: none; color: #fff; font-size: 16px; padding: 8px 0; width: 60px; outline: none; }
.recommend-button { padding: 8px 15px; border-radius: 4px; border: 1px solid transparent; cursor: pointer; color: #fff; font-weight: bold; }
.recommend-active { background-color: rgba(102, 192, 244, 0.2); border-color: #66c0f4; }
.recommend-inactive { background-color: rgba(255, 99, 71, 0.2); border-color: tomato; }
.review-input { width: 100%; background-color: #222b35; color: #c7d5e0; border: none; border-radius: 4px; padding: 15px; font-size: 15px; min-height: 100px; resize: vertical; margin-bottom: 15px; outline: none; }
.submit-review-button { width: 100%; background-color: #66c0f4; color: #1b2838; border: none; padding: 12px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
.submit-review-button:hover { background-color: #5ab0e4; }

.no-reviews-text { color: #8f98a0; font-style: italic; margin-top: 10px; }
.review-card { background-color: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 4px; margin-bottom: 15px; }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; }
.review-user { color: #e5e4e2; font-size: 16px; font-weight: bold; }
.review-stats { display: flex; gap: 10px; align-items: center; }
.review-rating-tag { background-color: #3a6b8c; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.tag-recomenda { color: #66c0f4; font-weight: bold; font-size: 13px; }
.tag-nao-recomenda { color: tomato; font-weight: bold; font-size: 13px; }
.review-comment { color: #acb2b8; font-size: 14px; line-height: 1.5; margin: 0; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
.modal-content { background-color: #171a21; border-radius: 8px; padding: 20px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; border: 1px solid #2a475e; }
.modal-title { font-size: 22px; font-weight: bold; color: #fff; text-align: center; margin-top: 0; margin-bottom: 10px; }
.modal-subtitle { font-size: 16px; font-weight: bold; color: #66c0f4; margin: 10px 0; }

.picker-container-modal { background-color: #2a475e; border-radius: 4px; overflow: hidden; margin-bottom: 15px; }
.picker-select-modal { width: 100%; background: transparent; color: #fff; border: none; padding: 10px; font-size: 15px; outline: none; }
.picker-select-modal option { color: #000; } /* Fallback para opções nativas do HTML */

.switch-row { display: flex; justify-content: space-between; align-items: center; background-color: #222b35; padding: 12px; border-radius: 4px; margin-bottom: 10px; }
.switch-label { color: #c7d5e0; font-size: 14px; font-weight: bold; }
.vue-switch { transform: scale(1.2); accent-color: #66c0f4; cursor: pointer; }
.vue-switch-danger { accent-color: #ff4444; }

.add-tag-button { width: 100%; background-color: #66c0f4; color: #1b2838; border: none; padding: 12px; border-radius: 4px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 5px; }
.add-tag-button:hover { background-color: #5ab0e4; }

.tags-list-modal { background-color: #222b35; border-radius: 4px; padding: 10px; max-height: 150px; overflow-y: auto; }
.modal-tag-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #2a475e; }
.modal-tag-item:last-child { border-bottom: none; }
.modal-tag-item-text { color: #c7d5e0; font-size: 15px; flex: 1; }
.delete-icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; }

.close-modal-button { width: 100%; background-color: #3a6b8c; color: #fff; border: none; padding: 15px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 20px; }
.close-modal-button:hover { background-color: #4a80a5; }
</style>