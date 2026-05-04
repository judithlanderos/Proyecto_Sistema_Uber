import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Registro from '../views/Registro.vue'
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/',  redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/registro', component: Registro },
    { path: '/dashboard', component: Dashboard },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ],
})

export default router
