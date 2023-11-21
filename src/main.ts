import {createApp} from 'vue'
import {createPinia} from 'pinia'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'
import ToastService from 'primevue/toastservice';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue);
app.use(ToastService);

app.mount('#app')
