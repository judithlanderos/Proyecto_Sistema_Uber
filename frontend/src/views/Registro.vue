<template>
    <div class="contenedor">
        <div class="tarjeta">
            <h1 class="titulo">SistemaUber</h1>
            <h2 class="subtitulo">Crear Cuenta</h2>

            <div class="campo">
                <label>Nombre</label>
                <input
                    v-model="form.nombre"
                    type="text"
                    placeholder="Tu nombre (Solo letras)"
                    @input="errores.nombre = validarNombre(form.nombre)"
                />
                <span class="error-campo" v-if="errores.nombre">{{ errores.nombre }}</span>
            </div>

            <div class="campo">
                <label>Primer Apellido</label>
                <input
                    v-model="form.primer_ap"
                    type="text"
                    placeholder="Primer apellido (Solo letras)"
                    @input="errores.primer_ap = validarApellido(form.primer_ap)"
                />
                <span class="error-campo" v-if="errores.primer_ap">{{ errores.primer_ap }}</span>
            </div>

            <div class="campo">
                <label>Segundo Apellido <span class="opcional">(opcional)</span></label>
                <input
                    v-model="form.segundo_ap"
                    type="text"
                    placeholder="Segundo apellido (Solo letras)"
                    @input="errores.segundo_ap = validarApellido(form.segundo_ap, false)"
                />
                <span class="error-campo" v-if="errores.segundo_ap">{{ errores.segundo_ap }}</span>
            </div>

            <div class="campo">
                <label>Correo</label>
                <input
                    v-model="form.correo"
                    type="text"
                    placeholder="correo@ejemplo.com"
                    @input="errores.correo = validarCorreo(form.correo)"
                />
                <span class="error-campo" v-if="errores.correo">{{ errores.correo }}</span>
            </div>

            <div class="campo">
                <label>Telefono</label>
                <input
                    v-model="form.telefono"
                    type="text"
                    placeholder="10 digitos (Solo numeros)"
                    maxlength="10"
                    @input="manejarTelefono"
                />
                <span class="error-campo" v-if="errores.telefono">{{ errores.telefono }}</span>
            </div>

            <div class="campo">
                <label>Contrasena</label>
                <input
                    v-model="form.password"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    @input="errores.password = validarPassword(form.password)"
                />
                <span class="error-campo" v-if="errores.password">{{ errores.password }}</span>
            </div>

            <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>
            <p v-if="exito" class="exito">{{ exito }}</p>

            <div class="campo">
                <VueRecaptcha
                    sitekey="6LeZX-ksAAAAALMh8W8Pps3WlT5SjklYJOG02JGo"
                    @verify="onCaptchaVerified"
                    @expired="onCaptchaExpired"
                />
                <span class="error-campo" v-if="!captchaValido && intentoEnvio">Verifica que no eres un robot</span>
            </div>

            <button @click="registrar" class="boton" :disabled="cargando">
                {{ cargando ? 'Registrando...' : 'Crear Cuenta' }}
            </button>

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
import { registroService, loginService } from '../services/authService'
import { validarNombre, validarApellido, validarCorreo, validarTelefono, validarPassword } from '../utils/validaciones'

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
const errorGeneral = ref('')
const exito = ref('')
const cargando = ref(false)

const form = ref({
    nombre: '',
    primer_ap: '',
    segundo_ap: '',
    correo: '',
    telefono: '',
    password: ''
})

const errores = ref({
    nombre: '',
    primer_ap: '',
    segundo_ap: '',
    correo: '',
    telefono: '',
    password: ''
})

const manejarTelefono = () => {
    form.value.telefono = form.value.telefono.replace(/[^0-9]/g, '')
    errores.value.telefono = validarTelefono(form.value.telefono)
}

const formularioValido = () => {
    errores.value.nombre = validarNombre(form.value.nombre)
    errores.value.primer_ap = validarApellido(form.value.primer_ap)
    errores.value.segundo_ap = validarApellido(form.value.segundo_ap, false)
    errores.value.correo = validarCorreo(form.value.correo)
    errores.value.telefono = validarTelefono(form.value.telefono)
    errores.value.password = validarPassword(form.value.password)
    return !Object.values(errores.value).some(e => e !== '')
}

const intentoEnvio = ref(false)


const registrar = async () => {
     intentoEnvio.value = true
    if (!captchaValido.value) return
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return
    cargando.value = true
    try {
        await registroService(form.value)
        exito.value = 'Cuenta creada correctamente'
        const res = await loginService(form.value.correo, form.value.password)
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
        setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
        errorGeneral.value = err.response?.data?.error || 'Error al registrar'
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
    align-items: flex-start;
    background-color: #0a0a0a;
    padding: 40px 20px;
    width: 100vw;
    position: relative;
    left: 0;
    margin-left: 0 !important;
}


.tarjeta {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    margin: auto;
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

.opcional {
    color: #555555;
    font-size: 12px;
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

.campo input:focus { border-color: #4ade80; }

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

.exito {
    color: #4ade80;
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
    .tarjeta { padding: 24px 16px; }
    .titulo { font-size: 20px; }
    .subtitulo { font-size: 16px; }
}
</style>