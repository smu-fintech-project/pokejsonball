import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import Login from '../pages/Login.vue';
import Profile from '../pages/Profile.vue';
const Portfolio = () => import('../pages/Portfolio.vue');
const Community = () => import('../pages/Community.vue');
const About = () => import('../pages/About.vue');
const CardDetail = () => import('../pages/CardDetail.vue');

const routes = [
  { path: '/', component: LandingPage, meta: { title: 'Marketplace' } },
  { path: '/portfolio', component: Portfolio, meta: { title: 'Portfolio' } },
  { path: '/community', component: Community, meta: { title: 'Community' } },
  { path: '/about', component: About, meta: { title: 'About' } },
  { path: '/card/:id', component: CardDetail, meta: { title: 'Card' } },
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
