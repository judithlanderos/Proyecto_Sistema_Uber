<template>
    <div class="wrapper">
        <nav class="main-header navbar navbar-expand navbar-dark" style="background-color:#141414; border-bottom:1px solid #2a2a2a;">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" data-widget="pushmenu" href="#" role="button">
                        <i class="fas fa-bars" style="color:#4ade80;"></i>
                    </a>
                </li>
                <li class="nav-item">
                    <span class="nav-link" style="color:#4ade80; font-weight:700; font-size:18px;">SistemaUber</span>
                </li>
            </ul>
            <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                    <span class="nav-link" style="color:#a0a0a0;">
                        <i class="fas fa-user" style="color:#4ade80;"></i>
                        Bienvenido, {{ usuario?.nombre }} {{ usuario?.primer_ap }}
                    </span>
                </li>
                <li class="nav-item">
                    <button @click="cerrarSesion" class="btn-salir">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesion
                    </button>
                </li>
            </ul>
        </nav>

        <aside class="main-sidebar sidebar-dark-primary elevation-4" style="background-color:#141414;">
            <a href="#" class="brand-link" style="background-color:#141414; border-bottom:1px solid #2a2a2a; text-decoration:none;">
                <span class="brand-text font-weight-light" style="color:#4ade80;">Mi Cuenta</span>
            </a>
            <div class="sidebar">
                <div class="user-panel mt-3 pb-3 mb-3 d-flex" style="border-bottom:1px solid #2a2a2a;">
                    <div class="image">
                        <i class="fas fa-user-circle fa-2x" style="color:#4ade80; padding-left:8px;"></i>
                    </div>
                    <div class="info">
                        <span style="color:#4ade80; font-weight:600; padding-left:8px;">{{ usuario?.nombre }}</span>
                    </div>
                </div>
                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column">
                        <li class="nav-item" v-for="item in menu" :key="item.nombre">
                            <a href="#" class="nav-link" :class="{ active: moduloActivo === item.componente }" @click.prevent="moduloActivo = item.componente">
                                <i :class="[item.icono, 'nav-icon']"></i>
                                <span>{{ item.nombre }}</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>

        <div class="content-wrapper" style="background-color:#0a0a0a;">
            <div class="content-header" style="border-bottom:1px solid #2a2a2a; background-color:#141414;">
                <div class="container-fluid">
                    <h1 style="color:#ffffff;">{{ tituloActivo }}</h1>
                </div>
            </div>
            <div class="content">
                <div class="container-fluid">
                    <component :is="moduloActivo" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, markRaw, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { alertaSesionExpirada } from '../utils/alertas'
import MisViajes from './pasajeros/MisViajes.vue'
import MisPagos from './pasajeros/MisPagos.vue'
import SolicitarViaje from './pasajeros/SolicitarViaje.vue'

const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario')))
const moduloActivo = ref(markRaw(MisViajes))

const menu = [
    { nombre: 'Mis Viajes',      componente: markRaw(MisViajes),      icono: 'fas fa-car' },
    { nombre: 'Solicitar Viaje', componente: markRaw(SolicitarViaje), icono: 'fas fa-plus-circle' },
    { nombre: 'Mis Pagos',       componente: markRaw(MisPagos),       icono: 'fas fa-credit-card' },
]

const tituloActivo = computed(() => {
    const item = menu.find(m => m.componente === moduloActivo.value)
    return item ? item.nombre : ''
})

let temporizador = null
const TIEMPO_INACTIVIDAD = 5 * 60 * 1000
const eventos = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click']

const cerrarSesionInactividad = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    alertaSesionExpirada()
    setTimeout(() => router.push('/login'), 3000)
}

const reiniciarTemporizador = () => {
    clearTimeout(temporizador)
    temporizador = setTimeout(cerrarSesionInactividad, TIEMPO_INACTIVIDAD)
}

onMounted(() => {
    eventos.forEach(e => window.addEventListener(e, reiniciarTemporizador))
    reiniciarTemporizador()
    setTimeout(() => {
        if (window.$) {
            window.$('[data-widget="pushmenu"]').off('click').on('click', function(e) {
                e.preventDefault()
                window.$('body').toggleClass('sidebar-open')
                window.$('body').toggleClass('sidebar-collapse')
            })
        }
    }, 500)
})

onBeforeUnmount(() => {
    clearTimeout(temporizador)
    eventos.forEach(e => window.removeEventListener(e, reiniciarTemporizador))
})

const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
}
</script>

<style scoped>
.nav-link { color: #a0a0a0 !important; transition: all 0.2s; }
.nav-link:hover { background-color: #1f1f1f !important; color: #ffffff !important; }
.nav-link.active { background-color: #4ade80 !important; color: #0a0a0a !important; font-weight: 600; }
.btn-salir {
    background: none; border: 1px solid #f87171; color: #f87171;
    padding: 6px 14px; border-radius: 8px; cursor: pointer;
    font-size: 13px; margin-right: 12px; transition: all 0.2s;
}
.btn-salir:hover { background-color: #f87171; color: #ffffff; }
.content-wrapper { min-height: calc(100vh - 57px); }
</style>