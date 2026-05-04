<template>
    <div class="contenedor">
        <div class="tarjeta">
            <h1 class="titulo">SistemaUber</h1>
            <h2 class="subtitulo">Crear Cuenta</h2>

            <div class="campo">
                <label>Nombre</label>
                <input v-model="form.nombre" type="text" placeholder="Tu nombre" />
            </div>

            <div class="campo">
                <label>Primer Apellido</label>
                <input v-model="form.primer_ap" type="text" placeholder="Primer apellido" />
            </div>

            <div class="campo">
                <label>Segundo Apellido</label>
                <input v-model="form.segundo_ap" type="text" placeholder="Segundo apellido (opcional)" />
            </div>

            <div class="campo">
                <label>Correo</label>
                <input v-model="form.correo" type="email" placeholder="correo@ejemplo.com" />
            </div>

            <div class="campo">
                <label>Telefono</label>
                <input v-model="form.telefono" type="text" placeholder="Tu telefono" />
            </div>

            <div class="campo">
                <label>Contrasena</label>
                <input v-model="form.password" type="password" placeholder="Tu contrasena" />
            </div>

            <p v-if="error" class="error">{{ error }}</p>
            <p v-if="exito" class="exito">{{ exito }}</p>

            <button @click="registrar" class="boton">Crear Cuenta</button>

            <p class="enlace">
                Ya tienes cuenta?
                <router-link to="/login">Inicia sesion aqui</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const error = ref('')
const exito = ref('')

const form = ref({
    nombre: '',
    primer_ap: '',
    segundo_ap: '',
    correo: '',
    telefono: '',
    password: ''
})

const registrar = async () => {
    error.value = ''
    exito.value = ''

    if (!form.value.nombre || !form.value.primer_ap || !form.value.correo || !form.value.telefono || !form.value.password) {
        error.value = 'Todos los campos obligatorios deben llenarse'
        return
    }

    try {
        await axios.post('http://localhost:3000/api/auth/registro', form.value)
        exito.value = 'Cuenta creada correctamente'
        setTimeout(() => router.push('/login'), 1500)

    } catch (err) {
        error.value = err.response?.data?.error || 'Error al registrar'
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
    padding: 40px 20px;
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
    margin-bottom: 18px;
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

.exito {
    color: #4ade80;
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