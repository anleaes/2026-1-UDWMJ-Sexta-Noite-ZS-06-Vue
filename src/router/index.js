import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/GameView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/CadastroView.vue')
    },
    {
      path: '/desenvolvedores',
      name: 'desenvolvedores',
      component: () => import('../views/DeveloperView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/consoles',
      name: 'consoles',
      component: () => import('../views/ConsoleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/generos',
      name: 'generos',
      component: () => import('../views/GenreView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: () => import('../views/ReviewView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;