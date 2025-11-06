import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../pages/LandingPage.vue';
import Login from '../pages/Login.vue';
import SignUp from '../pages/SignUp.vue';
import Wallet from '../pages/Wallet.vue';
import StripeReturn from '../pages/StripeReturn.vue';
const Portfolio = () => import('../pages/Profile.vue');
const Community = () => import('../pages/Community.vue');
const UploadCard = () => import('../pages/UploadCard.vue');
const CardDetail = () => import('../pages/CardDetail.vue');
const Messages = () => import('../pages/Messages.vue');
const ThoughtDetail = () => import('../pages/ThoughtDetail.vue');
const AdminPanel = () => import('../pages/AdminPanel.vue');


const routes = [
  { path: '/', component: LandingPage, meta: { title: 'Marketplace' } },
  { path: '/profile', component: Portfolio, meta: { title: 'Profile' } },
  { path: '/portfolio', redirect: '/profile' },
  { path: '/community', component: Community, meta: { title: 'Community' } },
  { path: '/upload', component: UploadCard, meta: { title: 'Upload Card' } },
  { path: '/card/:id', component: CardDetail, meta: { title: 'Card' } },
  { path: '/wallet', component: Wallet, meta: { title: 'My Wallet' } },
  { path: '/stripe-return', component: StripeReturn, meta: {title: 'Return from Bank Verification'}  },
  { path: '/messages', component: Messages, meta: { title: 'Messages' } },
  { path: '/login', component: Login, meta: { title: 'Login' } },
  { path: '/signup', component:SignUp, meta:{title: 'Sign Up'}},
  { path: '/community/:id', component: ThoughtDetail, props: true, meta: { title: 'Thought' }},
  { path: '/admin', component: AdminPanel, meta: { title: 'Admin Panel', requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('token');
    if (!token) {
      next('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isAdmin) {
        alert('Access denied. Admin privileges required.');
        next('/');
        return;
      }
    } catch (e) {
      next('/login');
      return;
    }
  }
  next();
});

router.afterEach((to) => {
  document.title = (to.meta.title || 'PokeJsonBall') + ' • PokeJsonBall';
});

export default router;
