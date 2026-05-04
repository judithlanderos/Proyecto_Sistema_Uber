import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Landing from '../views/LandingPage.vue'
import Login from '../views/Login.vue'

import Registro from '../views/Registro.vue'
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'
import LandingPage from '@/views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/',  component: LandingPage },
    { path: '/login', component: Login },
    { path: '/registro', component: Registro },
    { path: '/dashboard', component: Dashboard },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ],
})

export default router
