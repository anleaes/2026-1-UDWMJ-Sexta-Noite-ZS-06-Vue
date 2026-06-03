<script setup>
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <header v-if="authStore.isAuthenticated" class="navbar">
    <div class="logo">Catálogo de Jogos</div>
    <nav class="nav-links">
      <RouterLink to="/" class="nav-item">Início</RouterLink>
      <RouterLink to="/desenvolvedores" class="nav-item">Desenvolvedores</RouterLink>
      <RouterLink to="/consoles" class="nav-item">Consoles</RouterLink>
      <RouterLink to="/generos" class="nav-item">Gêneros</RouterLink>
      <RouterLink to="/reviews" class="nav-item">Avaliações</RouterLink>
      <RouterLink to="/tags" class="nav-item">Tags</RouterLink>
      <RouterLink to="/perfil" class="nav-item">Meu Perfil</RouterLink>
      <button @click="handleLogout" class="btn-logout">Sair</button>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style>
body { margin: 0; font-family: Arial, sans-serif; }
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px 20px;
}
.logo { font-weight: bold; font-size: 18px; }
.nav-links {
  display: flex;
  align-items: center;
  gap: 15px;
}
.nav-item {
  color: white;
  text-decoration: none;
  font-size: 15px;
}
.nav-item:hover {
  text-decoration: underline;
}
.btn-logout {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-logout:hover { background-color: #ff3333; }
</style>