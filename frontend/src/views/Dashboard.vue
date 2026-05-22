<template>
    <div class="wrapper">

        <!-- NAVBAR -->
        <nav class="main-header navbar navbar-expand navbar-dark" style="background-color: #141414; border-bottom: 1px solid #2a2a2a;">
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

        <!-- SIDEBAR -->
        <aside class="main-sidebar sidebar-dark-primary elevation-4" style="background-color: #141414;">
            <a href="#" class="brand-link" style="background-color:#141414; border-bottom:1px solid #2a2a2a;  text-decoration:none;">
                <span class="brand-text font-weight-light" style="color:#4ade80;">Sistema Uber</span>
            </a>
            <div class="sidebar">
                <div class="user-panel mt-3 pb-3 mb-3 d-flex" style="border-bottom: 1px solid #2a2a2a;">
                    <div class="image" style="position:relative; cursor:pointer;" @click="triggerFoto">
                        <img
                            v-if="fotoPerfil"
                            :src="fotoPerfil"
                            style="width:40px; height:40px; border-radius:50%; object-fit:cover; border: 2px solid #4ade80;"
                        />
                        <i v-else class="fas fa-user-circle fa-2x" style="color:#4ade80; padding-left:8px;"></i>
                        <input
                            type="file"
                            ref="inputFoto"
                            accept="image/jpeg,image/png"
                            style="display:none"
                            @change="subirFoto"
                        />
                    </div>
                    <div class="info">
                        <span style="color:#4ade80; font-weight:600; padding-left:8px;">{{ usuario?.nombre }}</span>
                    </div>
                </div>
            

                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
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

        <!-- CONTENIDO -->
        <div class="content-wrapper" style="background-color:#0a0a0a;">
            <div class="content-header" style="border-bottom: 1px solid #2a2a2a; background-color: #141414;">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 style="color:#ffffff;">{{ tituloActivo }}</h1>
                        </div>
                        
                    </div>
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
import { ref, computed, markRaw, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Usuarios from './modulos/Usuarios.vue'
import Conductores from './modulos/Conductores.vue'
import Vehiculos from './modulos/Vehiculos.vue'
import Viajes from './modulos/Viajes.vue'
import Pagos from './modulos/Pagos.vue'
import Calificaciones from './modulos/Calificaciones.vue'
import axios from 'axios'
import Inicio from './modulos/Inicio.vue'
import { alertaExito, alertaError } from '../utils/alertas'

onMounted(() => {
     setTimeout(() => {
        if (window.AdminLTE) {
            window.AdminLTE.init()
        } else if (window.$) {
            window.$('[data-widget="pushmenu"]').off('click').on('click', function(e) {
                e.preventDefault()
                window.$('body').toggleClass('sidebar-open')
                window.$('body').toggleClass('sidebar-collapse')
            })
        }
    }, 500)
})
const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario')))
const moduloActivo = ref(markRaw(Inicio))


const menu = [
    { nombre: 'Dashboard',      componente: markRaw(Inicio),         icono: 'fas fa-home' },
    { nombre: 'Viajes',         componente: markRaw(Viajes),         icono: 'fas fa-route' },
    { nombre: 'Usuarios',       componente: markRaw(Usuarios),       icono: 'fas fa-users' },
    { nombre: 'Conductores',    componente: markRaw(Conductores),    icono: 'fas fa-id-card' },
    { nombre: 'Vehiculos',      componente: markRaw(Vehiculos),      icono: 'fas fa-car' },
    { nombre: 'Pagos',          componente: markRaw(Pagos),          icono: 'fas fa-credit-card' },
    { nombre: 'Calificaciones', componente: markRaw(Calificaciones), icono: 'fas fa-star' },
]

const tituloActivo = computed(() => {
    const item = menu.find(m => m.componente === moduloActivo.value)
    return item ? item.nombre : ''
})

const cerrarSesion = () => {
    document.body.className = ''
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
}

const inputFoto = ref(null)
const fotoPerfil = ref(usuario.value?.foto || null)

const triggerFoto = () => {
    inputFoto.value.click()
}

const subirFoto = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    const formData = new FormData()
    formData.append('foto', archivo)

    try {
        const token = localStorage.getItem('token')
        const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'
        const res = await axios.post(
            `${BASE}/api/usuarios/${usuario.value.id}/foto`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        fotoPerfil.value = res.data.url
    } catch (err) {
        alertaError('Error al subir la foto')
    }
}

</script>

<style scoped>
.nav-link {
    color: #a0a0a0 !important;
    transition: all 0.2s;
}

.nav-link:hover {
    background-color: #1f1f1f !important;
    color: #ffffff !important;
}

.nav-link.active {
    background-color: #4ade80 !important;
    color: #0a0a0a !important;
    font-weight: 600;
}

.btn-salir {
    background: none;
    border: 1px solid #f87171;
    color: #f87171;
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    margin-right: 12px;
    transition: all 0.2s;
}

.btn-salir:hover {
    background-color: #f87171;
    color: #ffffff;
}

.content-wrapper {
    min-height: calc(100vh - 57px);
}
</style>