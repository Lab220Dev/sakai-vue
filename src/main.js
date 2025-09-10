import { createApp } from 'vue';
import axios from './axios';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';// Tema do PrimeVue
import PrimeVue from 'primevue/config';// Ícones do PrimeVue
import ConfirmationService from 'primevue/confirmationservice';// Tema do PrimeVue
import ToastService from 'primevue/toastservice';// Ícones do PrimeVue
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.config.globalProperties.$axios = axios;
app.use(pinia);

app.mount('#app');
