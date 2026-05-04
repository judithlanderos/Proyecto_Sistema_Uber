<template>
    <div class="contenedor">
        <h1>Dashboard</h1>
        <p>Bienvenido {{ usuario?.nombre }}</p>
        <button @click="cerrarSesion" class="boton">Cerrar Sesion</button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario')))

const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
}
</script>

<style scoped>
.contenedor {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #0a0a0a;
    color: #ffffff;
    gap: 20px;
}

.boton {
    padding: 12px 30px;
    background-color: #4ade80;
    color: #0a0a0a;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.boton:hover {
    background-color: #22c55e;
}
</style>
