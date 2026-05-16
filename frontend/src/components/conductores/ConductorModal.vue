<template>
    <div class="modal-fondo">
        <div class="modal-caja">
            <h4 style="color:#ffffff; margin-bottom: 20px;">
                {{ modoEditar ? 'Editar Conductor' : 'Agregar Conductor' }}
            </h4>

            <div class="campo">
                <label>Nombre</label>
                <input v-model="form.nombre" type="text" placeholder="Nombre"
                    @input="errores.nombre = validarNombre(form.nombre)" />
                <span class="error-campo" v-if="errores.nombre">{{ errores.nombre }}</span>
            </div>

            <div class="campo">
                <label>Primer Apellido</label>
                <input v-model="form.primer_ap" type="text" placeholder="Primer apellido"
                    @input="errores.primer_ap = validarApellido(form.primer_ap)" />
                <span class="error-campo" v-if="errores.primer_ap">{{ errores.primer_ap }}</span>
            </div>

            <div class="campo">
                <label>Segundo Apellido <span class="opcional">(opcional)</span></label>
                <input v-model="form.segundo_ap" type="text" placeholder="Segundo apellido"
                    @input="errores.segundo_ap = validarApellido(form.segundo_ap, false)" />
                <span class="error-campo" v-if="errores.segundo_ap">{{ errores.segundo_ap }}</span>
            </div>

            <div class="campo">
                <label>Correo</label>
                <input v-model="form.correo" type="text" placeholder="correo@ejemplo.com"
                    @input="errores.correo = validarCorreo(form.correo)" />
                <span class="error-campo" v-if="errores.correo">{{ errores.correo }}</span>
            </div>

            <div class="campo">
                <label>Telefono</label>
                <input v-model="form.telefono" type="text" placeholder="10 digitos" maxlength="10"
                    @input="manejarTelefono" />
                <span class="error-campo" v-if="errores.telefono">{{ errores.telefono }}</span>
            </div>

            <div class="campo">
                <label>Numero de Licencia</label>
                <input v-model="form.num_licencia" type="text" placeholder="Numero de licencia"
                    @input="errores.num_licencia = validarRequerido(form.num_licencia, 'Licencia')" />
                <span class="error-campo" v-if="errores.num_licencia">{{ errores.num_licencia }}</span>
            </div>

            <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>
            <p v-if="exito" class="exito">{{ exito }}</p>

            <div class="modal-botones">
                <button class="btn-verde" @click="guardar">
                    {{ modoEditar ? 'Actualizar' : 'Guardar' }}
                </button>
                <button class="btn-cancelar" @click="$emit('cerrar')">Cancelar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { validarNombre, validarApellido, validarCorreo, validarTelefono, validarRequerido } from '../../utils/validaciones'
import { crearConductor, actualizarConductor } from '../../services/conductoresService'

const props = defineProps({
    conductor: { type: Object, default: null },  // null = modo agregar
})

const emit = defineEmits(['cerrar', 'guardado'])

const modoEditar = ref(false)
const errorGeneral = ref('')
const exito = ref('')

const form = ref({ nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', num_licencia: '' })
const errores = ref({ nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', num_licencia: '' })

// Cuando se abre con un conductor existente, rellenamos el form
watch(() => props.conductor, (c) => {
    if (c) {
        modoEditar.value = true
        form.value = { nombre: c.nombre, primer_ap: c.primer_ap, segundo_ap: c.segundo_ap || '', correo: c.correo, telefono: c.telefono, num_licencia: c.num_licencia }
    } else {
        modoEditar.value = false
        form.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', num_licencia: '' }
    }
    errores.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', num_licencia: '' }
    errorGeneral.value = ''
    exito.value = ''
}, { immediate: true })

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
    errores.value.num_licencia = validarRequerido(form.value.num_licencia, 'Licencia')
    return !Object.values(errores.value).some(e => e !== '')
}

const guardar = async () => {
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return
    try {
        if (modoEditar.value) {
            await actualizarConductor(props.conductor.id_conductor, form.value)
            exito.value = 'Conductor actualizado correctamente'
        } else {
            await crearConductor(form.value)
            exito.value = 'Conductor creado correctamente'
        }
        emit('guardado')
        setTimeout(() => emit('cerrar'), 1000)
    } catch (err) {
        errorGeneral.value = err.response?.data?.error || 'Error al guardar'
    }
}
</script>

<style scoped>
.modal-fondo {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-caja {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
}
.campo { margin-bottom: 16px; }
.campo label { display: block; color: #a0a0a0; font-size: 13px; margin-bottom: 6px; }
.opcional { color: #555555; font-size: 12px; }
.campo input {
    width: 100%;
    padding: 10px 14px;
    background-color: #1f1f1f;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    transition: border 0.2s;
    box-sizing: border-box;
}
.campo input:focus { border-color: #4ade80; }
.error-campo { color: #f87171; font-size: 12px; margin-top: 4px; display: block; }
.error-general { color: #f87171; font-size: 13px; text-align: center; margin-bottom: 10px; }
.exito { color: #4ade80; font-size: 13px; text-align: center; margin-bottom: 10px; }
.modal-botones { display: flex; gap: 10px; margin-top: 20px; }
.btn-verde {
    background-color: #4ade80;
    color: #0a0a0a;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-verde:hover { background-color: #22c55e; }
.btn-cancelar {
    background-color: #1f1f1f;
    border: 1px solid #2a2a2a;
    color: #a0a0a0;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-cancelar:hover { background-color: #2a2a2a; color: #ffffff; }
@media (max-width: 768px) { .modal-caja { padding: 20px 16px; } }
</style>