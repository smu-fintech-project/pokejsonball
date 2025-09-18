import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import Login from '../pages/Login.vue';
import Profile from '../pages/Profile.vue';

const routes = [
  { path: '/', component: LandingPage, meta: { title: 'Marketplace' } },
  { path: '/login', component: Login, meta: { title: 'Login' } },
  { path: '/profile', component: Profile, meta: { title: 'Profile' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = (to.meta.title || 'PokeJsonBall') + ' • PokeJsonBall';
});

export default router;
