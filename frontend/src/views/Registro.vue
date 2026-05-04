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
                    placeholder="Tu nombre"
                    @input="validarNombre"
                />
                <span class="error-campo" v-if="errores.nombre">{{ errores.nombre }}</span>
            </div>

            <div class="campo">
                <label>Primer Apellido</label>
                <input
                    v-model="form.primer_ap"
                    type="text"
                    placeholder="Primer apellido"
                    @input="validarPrimerAp"
                />
                <span class="error-campo" v-if="errores.primer_ap">{{ errores.primer_ap }}</span>
            </div>

            <div class="campo">
                <label>Segundo Apellido</label>
                <input
                    v-model="form.segundo_ap"
                    type="text"
                    placeholder="Segundo apellido (opcional)"
                    @input="validarSegundoAp"
                />
                <span class="error-campo" v-if="errores.segundo_ap">{{ errores.segundo_ap }}</span>
            </div>

            <div class="campo">
                <label>Correo</label>
                <input
                    v-model="form.correo"
                    type="text"
                    placeholder="correo@ejemplo.com"
                    @input="validarCorreo"
                />
                <span class="error-campo" v-if="errores.correo">{{ errores.correo }}</span>
            </div>

            <div class="campo">
                <label>Telefono</label>
                <input
                    v-model="form.telefono"
                    type="text"
                    placeholder="10 digitos"
                    @input="validarTelefono"
                    maxlength="10"
                />
                <span class="error-campo" v-if="errores.telefono">{{ errores.telefono }}</span>
            </div>

            <div class="campo">
                <label>Contrasena</label>
                <input
                    v-model="form.password"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    @input="validarPassword"
                />
                <span class="error-campo" v-if="errores.password">{{ errores.password }}</span>
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

const errores = ref({
    nombre: '',
    primer_ap: '',
    segundo_ap: '',
    correo: '',
    telefono: '',
    password: ''
})

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/

const validarNombre = () => {
    if (!form.value.nombre) {
        errores.value.nombre = 'El nombre es obligatorio'
    } else if (!soloLetras.test(form.value.nombre)) {
        errores.value.nombre = 'Solo se permiten letras'
    } else if (form.value.nombre.length < 2) {
        errores.value.nombre = 'Minimo 2 caracteres'
    } else {
        errores.value.nombre = ''
    }
}

const validarPrimerAp = () => {
    if (!form.value.primer_ap) {
        errores.value.primer_ap = 'El primer apellido es obligatorio'
    } else if (!soloLetras.test(form.value.primer_ap)) {
        errores.value.primer_ap = 'Solo se permiten letras'
    } else {
        errores.value.primer_ap = ''
    }
}

const validarSegundoAp = () => {
    if (form.value.segundo_ap && !soloLetras.test(form.value.segundo_ap)) {
        errores.value.segundo_ap = 'Solo se permiten letras'
    } else {
        errores.value.segundo_ap = ''
    }
}

const validarCorreo = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.value.correo) {
        errores.value.correo = 'El correo es obligatorio'
    } else if (!regex.test(form.value.correo)) {
        errores.value.correo = 'Formato invalido, ejemplo: correo@gmail.com'
    } else {
        errores.value.correo = ''
    }
}

const validarTelefono = () => {
    const soloNumeros = /^[0-9]*$/
    if (!form.value.telefono) {
        errores.value.telefono = 'El telefono es obligatorio'
    } else if (!soloNumeros.test(form.value.telefono)) {
        errores.value.telefono = 'Solo se permiten numeros'
        form.value.telefono = form.value.telefono.replace(/[^0-9]/g, '')
    } else if (form.value.telefono.length < 10) {
        errores.value.telefono = 'El telefono debe tener 10 digitos'
    } else {
        errores.value.telefono = ''
    }
}

const validarPassword = () => {
    if (!form.value.password) {
        errores.value.password = 'La contrasena es obligatoria'
    } else if (form.value.password.length < 6) {
        errores.value.password = 'Minimo 6 caracteres'
    } else {
        errores.value.password = ''
    }
}

const formularioValido = () => {
    validarNombre()
    validarPrimerAp()
    validarSegundoAp()
    validarCorreo()
    validarTelefono()
    validarPassword()

    return !errores.value.nombre &&
           !errores.value.primer_ap &&
           !errores.value.segundo_ap &&
           !errores.value.correo &&
           !errores.value.telefono &&
           !errores.value.password
}

const registrar = async () => {
    error.value = ''
    exito.value = ''

    if (!formularioValido()) return

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

.error-campo {
    color: #f87171;
    font-size: 12px;
    margin-top: 5px;
    display: block;
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