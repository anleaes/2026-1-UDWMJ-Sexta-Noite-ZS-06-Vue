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
    <nav>
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