<template>
    <div class="contenedor">
        <div class="tarjeta">
            <h1 class="titulo">SistemaUber</h1>
            <h2 class="subtitulo">Iniciar Sesion</h2>

            <div class="campo">
                <label>Correo</label>
                <input
                    v-model="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                />
            </div>

            <div class="campo">
                <label>Contrasena</label>
                <input
                    v-model="password"
                    type="password"
                    placeholder="Tu contrasena"
                />
            </div>

            <p v-if="error" class="error">{{ error }}</p>

            <button @click="iniciarSesion" class="boton">Iniciar Sesion</button>

            <p class="enlace">
                No tienes cuenta?
                <router-link to="/registro">Registrate aqui</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const correo = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const iniciarSesion = async () => {
    error.value = ''

    if (!correo.value || !password.value) {
        error.value = 'Todos los campos son obligatorios'
        return
    }

    try {
        const respuesta = await axios.post('http://localhost:3000/api/auth/login', {
            correo: correo.value,
            password: password.value
        })

        localStorage.setItem('token', respuesta.data.token)
        localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario))
        router.push('/dashboard')

    } catch (err) {
        error.value = err.response?.data?.error || 'Error al iniciar sesion'
    }
}
</script>

<style scoped>
.contenedor {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #0a0a0a;
}

.tarjeta {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.titulo {
    color: #4ade80;
    font-size: 24px;
    text-align: center;
    margin-bottom: 6px;
}

.subtitulo {
    color: #ffffff;
    font-size: 18px;
    text-align: center;
    margin-bottom: 30px;
    font-weight: 400;
}

.campo {
    margin-bottom: 20px;
}

.campo label {
    display: block;
    color: #a0a0a0;
    font-size: 14px;
    margin-bottom: 8px;
}

.campo input {
    width: 100%;
    padding: 12px 16px;
    background-color: #1f1f1f;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #ffffff;
    font-size: 15px;
    outline: none;
    transition: border 0.3s;
}

.campo input:focus {
    border-color: #4ade80;
}

.boton {
    width: 100%;
    padding: 13px;
    background-color: #4ade80;
    color: #0a0a0a;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.3s;
}

.boton:hover {
    background-color: #22c55e;
}

.error {
    color: #f87171;
    font-size: 13px;
    margin-bottom: 10px;
    text-align: center;
}

.enlace {
    text-align: center;
    margin-top: 20px;
    color: #a0a0a0;
    font-size: 14px;
}

.enlace a {
    color: #4ade80;
    text-decoration: none;
    font-weight: 500;
}

.enlace a:hover {
    text-decoration: underline;
}
</style>