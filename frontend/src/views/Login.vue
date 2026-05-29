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
                    @input="errores.correo = validarCorreo(correo)"
                />
                <span class="error-campo" v-if="errores.correo">{{ errores.correo }}</span>
            </div>

            <div class="campo">
                <label>Contrasena</label>
                <input
                    v-model="password"
                    type="password"
                    placeholder="Tu contrasena"
                    @input="errores.password = validarPassword(password)"
                />
                <span class="error-campo" v-if="errores.password">{{ errores.password }}</span>
            </div>

            <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>

            <div class="campo">
            <VueRecaptcha
                sitekey="6LeZX-ksAAAAALMh8W8Pps3WlT5SjklYJOG02JGo"
                @verify="onCaptchaVerified"
                @expired="onCaptchaExpired"
            />
            <span class="error-campo" v-if="!captchaValido && intentoEnvio">Verifica que no eres un robot</span>
        </div>

            <button @click="iniciarSesion" class="boton" :disabled="cargando">
                {{ cargando ? 'Ingresando...' : 'Iniciar Sesion' }}
            </button>

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
import { loginService } from '../services/authService'
import { validarCorreo, validarPassword } from '../utils/validaciones'

import VueRecaptcha from 'vue3-recaptcha2'

const captchaValido = ref(false)
const captchaToken = ref('')

const onCaptchaVerified = (token) => {
    captchaToken.value = token
    captchaValido.value = true
}

const onCaptchaExpired = () => {
    captchaToken.value = ''
    captchaValido.value = false
}

const router = useRouter()
const correo = ref('')
const password = ref('')
const errorGeneral = ref('')
const cargando = ref(false)

const errores = ref({
    correo: '',
    password: ''
})

const intentoEnvio = ref(false)

const iniciarSesion = async () => {
    intentoEnvio.value = true
    if (!captchaValido.value) return
    errores.value.correo = validarCorreo(correo.value)
    errores.value.password = validarPassword(password.value)

    if (errores.value.correo || errores.value.password) return

    cargando.value = true
    errorGeneral.value = ''

    try {
        const res = await loginService(correo.value, password.value)
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
        const rol = res.data.usuario.rol
        router.push(rol === 'admin' ? '/dashboard' : '/pasajero')
    } catch (err) {
        errorGeneral.value = err.response?.data?.error || 'Error al iniciar sesion'
    } finally {
        cargando.value = false
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
    padding: 20px;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
}

.tarjeta {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
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
    box-sizing: border-box;
}

.campo input:focus {
    border-color: #4ade80;
}

.error-campo {
    color: #f87171;
    font-size: 12px;
    margin-top: 5px;
    display: block;
}

.error-general {
    color: #f87171;
    font-size: 13px;
    text-align: center;
    margin-bottom: 10px;
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

.boton:hover { background-color: #22c55e; }
.boton:disabled { background-color: #2a2a2a; color: #a0a0a0; cursor: not-allowed; }

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

.enlace a:hover { text-decoration: underline; }

@media (max-width: 480px) {
    .tarjeta {
        padding: 24px 16px;
    }
    .titulo { font-size: 20px; }
    .subtitulo { font-size: 16px; }
}
</style>