import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/LandingPage.vue'
import Login from '../views/Login.vue'
import Registro from '../views/Registro.vue'
import Dashboard from '../views/Dashboard.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: Landing },
        { path: '/login', component: Login },
        { path: '/registro', component: Registro },
        { path: '/dashboard', component: Dashboard, meta: { requiereAuth: true } },
        { path: '/:pathMatch(.*)*', component: NotFound }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiereAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router