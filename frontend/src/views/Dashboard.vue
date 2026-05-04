<template>
    <div class="wrapper">

        <!-- NAVBAR -->
        <nav class="main-header navbar navbar-expand navbar-dark navbar-dark" style="background-color: #141414; border-bottom: 1px solid #2a2a2a;">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" data-widget="pushmenu" href="#"><i class="fas fa-bars"></i></a>
                </li>
                <li class="nav-item">
                    <span class="nav-link" style="color: #4ade80; font-weight: 700; font-size: 18px;">SistemaUber</span>
                </li>
            </ul>
            <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                    <span class="nav-link" style="color: #a0a0a0;">{{ usuario?.nombre }} {{ usuario?.primer_ap }}</span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" @click="cerrarSesion" style="color: #f87171;">
                        <i class="fas fa-sign-out-alt"></i> Salir
                    </a>
                </li>
            </ul>
        </nav>

        <!-- SIDEBAR -->
        <aside class="main-sidebar" style="background-color: #141414; border-right: 1px solid #2a2a2a;">
            <div class="sidebar">
                <div class="user-panel mt-3 pb-3 mb-3 d-flex" style="border-bottom: 1px solid #2a2a2a;">
                    <div class="info">
                        <span style="color: #4ade80; font-weight: 600;">{{ usuario?.nombre }}</span>
                    </div>
                </div>
                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                        <li class="nav-item" v-for="item in menu" :key="item.nombre">
                            <a href="#" class="nav-link" :class="{ active: moduloActivo === item.componente }" @click.prevent="moduloActivo = item.componente" style="color: #a0a0a0;">
                                <i :class="item.icono"></i>
                                <p>{{ item.nombre }}</p>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>

        <!-- CONTENIDO -->
        <div class="content-wrapper" style="background-color: #0a0a0a;">
            <div class="content-header">
                <div class="container-fluid">
                    <h1 class="m-0" style="color: #ffffff;">{{ tituloActivo }}</h1>
                </div>
            </div>
            <div class="content">
                <div class="container-fluid">
                    <component :is="moduloActivo" />
                </div>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="main-footer" style="background-color: #141414; border-top: 1px solid #2a2a2a; color: #a0a0a0;">
            <strong>SistemaUber</strong> — Proyecto Escolar 2024
        </footer>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Inicio from './modulos/Inicio.vue'
import Viajes from './modulos/Viajes.vue'
import Conductores from './modulos/Conductores.vue'
import Pagos from './modulos/Pagos.vue'
import Calificaciones from './modulos/Calificaciones.vue'

const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario')))
const moduloActivo = ref(Inicio)

const menu = [
    { nombre: 'Inicio',         componente: Inicio,        icono: 'fas fa-home nav-icon' },
    { nombre: 'Viajes',         componente: Viajes,        icono: 'fas fa-car nav-icon' },
    { nombre: 'Conductores',    componente: Conductores,   icono: 'fas fa-id-card nav-icon' },
    { nombre: 'Pagos',          componente: Pagos,         icono: 'fas fa-credit-card nav-icon' },
    { nombre: 'Calificaciones', componente: Calificaciones,icono: 'fas fa-star nav-icon' },
]

const tituloActivo = computed(() => {
    const item = menu.find(m => m.componente === moduloActivo.value)
    return item ? item.nombre : ''
})

const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
}
</script>

<style scoped>
.nav-link.active {
    background-color: #4ade80 !important;
    color: #0a0a0a !important;
    font-weight: 600;
}

.nav-link:hover {
    background-color: #1f1f1f !important;
    color: #ffffff !important;
}
</style>