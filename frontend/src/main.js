import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css'; // Tailwind or fallback CSS

createApp(App).use(router).mount('#app');
