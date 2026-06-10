<script setup>
import { useRoute } from 'vue-router';

// useRoute nos permite acessar as informações da URL atual
const route = useRoute();

// Aqui capturamos aquele ":id" que configuramos no router
const jogoId = route.params.id;

// Mais pra frente, usaremos esse jogoId para buscar os dados certinhos no seu backend Django!
</script>

<template>
  <div class="game-detail-container">
    <div class="header-temporario">
      <h1>Detalhes do Jogo</h1>
      <p>Você acessou o jogo com ID: <strong>{{ jogoId }}</strong></p>
    </div>

    <main class="content-placeholder">
      <section class="carrossel">
        [ Aqui vai entrar o Carrossel de Imagens ]
      </section>

      <section class="informacoes">
        <h2>Nome do Jogo</h2>
        <p>Descrição, preço, desenvolvedora...</p>
        <div class="tags">
          <span>[ Ação ]</span> <span>[ RPG ]</span>
        </div>
      </section>

      <section class="reviews">
        <h3>Reviews dos Usuários</h3>
        <p>[ Lista de avaliações virá aqui ]</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Um CSS bem básico só para você conseguir visualizar a separação na tela por enquanto */
.game-detail-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-temporario {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.content-placeholder section {
  border: 2px dashed #ccc;
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  text-align: center;
  color: #666;
}
</style>