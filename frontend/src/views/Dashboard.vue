<template>
    <div class="wrapper">

        <!-- NAVBAR -->
        <nav class="main-header navbar navbar-expand navbar-dark" style="background-color: #141414; border-bottom: 1px solid #2a2a2a;">
            <span style="color: #4ade80; font-weight: 700; font-size: 20px; padding-left: 16px;">SistemaUber</span>
            <ul class="navbar-nav ml-auto align-items-center">
                <li class="nav-item">
                    <span class="nav-link" style="color: #a0a0a0;">{{ usuario?.nombre }} {{ usuario?.primer_ap }}</span>
                </li>
                <li class="nav-item">
                    <button @click="cerrarSesion" class="btn-salir">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesion
                    </button>
                </li>
            </ul>
        </nav>

        <!-- CONTENIDO -->
        <div class="content-wrapper" style="background-color: #0a0a0a; min-height: 100vh;">

            <!-- ENCABEZADO CON BOTONES -->
            <div class="encabezado">
                <h2 class="bienvenido">Bienvenido, <span class="verde">{{ usuario?.nombre }} {{ usuario?.primer_ap }}</span></h2>
                <div class="botones-modulos">
                    <button
                        v-for="item in menu"
                        :key="item.nombre"
                        @click="moduloActivo = item.componente"
                        :class="['btn-modulo', { activo: moduloActivo === item.componente }]"
                    >
                        <i :class="item.icono"></i> {{ item.nombre }}
                    </button>
                </div>
            </div>

            <!-- MODULO ACTIVO -->
            <div class="contenido-modulo">
                <component :is="moduloActivo" />
            </div>

        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Viajes from './modulos/Viajes.vue'
import Usuarios from './modulos/Usuarios.vue'
import Conductores from './modulos/Conductores.vue'
import Vehiculos from './modulos/Vehiculos.vue'
import Pagos from './modulos/Pagos.vue'
import Calificaciones from './modulos/Calificaciones.vue'

const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario')))
const moduloActivo = ref(Viajes)

const menu = [
    { nombre: 'Usuarios',       componente: Usuarios,       icono: 'fas fa-users' },
    { nombre: 'Conductores',    componente: Conductores,    icono: 'fas fa-id-card' },
    { nombre: 'Vehiculos',      componente: Vehiculos,      icono: 'fas fa-car' },
    { nombre: 'Viajes',         componente: Viajes,         icono: 'fas fa-route' },
    { nombre: 'Pagos',          componente: Pagos,          icono: 'fas fa-credit-card' },
    { nombre: 'Calificaciones', componente: Calificaciones, icono: 'fas fa-star' },
]

const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
}
</script>

<style scoped>
.encabezado {
    padding: 28px 32px 20px 32px;
    border-bottom: 1px solid #2a2a2a;
    background-color: #141414;
}

.bienvenido {
    color: #ffffff;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 18px;
}

.verde {
    color: #4ade80;
}

.botones-modulos {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.btn-modulo {
    background-color: #1f1f1f;
    border: 1px solid #2a2a2a;
    color: #a0a0a0;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-modulo:hover {
    background-color: #2a2a2a;
    color: #ffffff;
}

.btn-modulo.activo {
    background-color: #4ade80;
    color: #0a0a0a;
    border-color: #4ade80;
    font-weight: 600;
}

.contenido-modulo {
    padding: 32px;
}

.btn-salir {
    background: none;
    border: 1px solid #f87171;
    color: #f87171;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 12px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-salir:hover {
    background-color: #f87171;
    color: #ffffff;
}
</style>