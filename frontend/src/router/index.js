import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import Login from '../pages/Login.vue';
import SignUp from '../pages/SignUp.vue';
import Wallet from '../pages/Wallet.vue';
const Portfolio = () => import('../pages/Profile.vue');
const Community = () => import('../pages/Community.vue');
const About = () => import('../pages/About.vue');
const CardDetail = () => import('../pages/CardDetail.vue');
const Certs = () => import('../pages/Certs.vue');


const routes = [
  { path: '/', component: LandingPage, meta: { title: 'Marketplace' } },
  { path: '/profile', component: Portfolio, meta: { title: 'Profile' } },
  { path: '/portfolio', redirect: '/profile' },
  { path: '/community', component: Community, meta: { title: 'Community' } },
  { path: '/about', component: About, meta: { title: 'About' } },
  { path: '/certs', component: Certs, meta: { title: 'PSA Cert Gallery' } },
  { path: '/card/:id', component: CardDetail, meta: { title: 'Card' } },
  { path: '/wallet', component: Wallet, meta: { title: 'My Wallet' } },
  { path: '/login', component: Login, meta: { title: 'Login' } },
  { path: '/signup', component:SignUp, meta:{title: 'Sign Up'}}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = (to.meta.title || 'PokeJsonBall') + ' • PokeJsonBall';
});

export default router;
