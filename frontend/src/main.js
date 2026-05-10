import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'admin-lte/dist/css/adminlte.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'admin-lte/dist/js/adminlte.min.js'

const app = createApp(App)

app.use(router)

app.mount('#app')
