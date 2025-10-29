import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import Login from '../pages/Login.vue';
import SignUp from '../pages/SignUp.vue';
import Wallet from '../pages/Wallet.vue';
const Portfolio = () => import('../pages/Profile.vue');
const Community = () => import('../pages/Community.vue');
const About = () => import('../pages/About.vue');
const UploadCard = () => import('../pages/UploadCard.vue');
const CardDetail = () => import('../pages/CardDetail.vue');
const Messages = () => import('../pages/Messages.vue');
const ThoughtDetail = () => import('../pages/ThoughtDetail.vue');


const routes = [
  { path: '/', component: LandingPage, meta: { title: 'Marketplace' } },
  { path: '/profile', component: Portfolio, meta: { title: 'Profile' } },
  { path: '/portfolio', redirect: '/profile' },
  { path: '/community', component: Community, meta: { title: 'Community' } },
  { path: '/about', component: About, meta: { title: 'About' } },
  { path: '/upload', component: UploadCard, meta: { title: 'Upload Card' } },
  { path: '/card/:id', component: CardDetail, meta: { title: 'Card' } },
  { path: '/wallet', component: Wallet, meta: { title: 'My Wallet' } },
  { path: '/messages', component: Messages, meta: { title: 'Messages' } },
  { path: '/login', component: Login, meta: { title: 'Login' } },
  { path: '/signup', component:SignUp, meta:{title: 'Sign Up'}},
  { path: '/community/:id', component: ThoughtDetail, props: true, meta: { title: 'Thought' }},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = (to.meta.title || 'PokeJsonBall') + ' • PokeJsonBall';
});

export default router;
