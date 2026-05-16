<template>
    <div class="modal-fondo">
        <div class="modal-caja">
            <h4 style="color:#ffffff; margin-bottom: 20px;">
                {{ modoEditar ? 'Editar Viaje' : 'Agregar Viaje' }}
            </h4>

            <!-- Solo en modo agregar -->
            <div class="campo" v-if="!modoEditar">
                <label>Pasajero</label>
                <select v-model="form.id_usuario" @change="() => errores.id_usuario = validarRequerido(form.id_usuario, 'El pasajero')">
                    <option value="">Selecciona un pasajero</option>
                    <option v-for="u in usuarios" :key="u.id_usuario" :value="u.id_usuario">
                        {{ u.nombre }} {{ u.primer_ap }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_usuario">{{ errores.id_usuario }}</span>
            </div>

            <div class="campo" v-if="!modoEditar">
                <label>Conductor</label>
                <select v-model="form.id_conductor" @change="() => errores.id_conductor = validarRequerido(form.id_conductor, 'El conductor')">
                    <option value="">Selecciona un conductor</option>
                    <option v-for="c in conductores" :key="c.id_conductor" :value="c.id_conductor">
                        {{ c.nombre }} {{ c.primer_ap }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_conductor">{{ errores.id_conductor }}</span>
            </div>

            <div class="campo" v-if="!modoEditar">
                <label>Vehiculo</label>
                <select v-model="form.id_vehiculo" @change="() => errores.id_vehiculo = validarRequerido(form.id_vehiculo, 'El vehiculo')">
                    <option value="">Selecciona un vehiculo</option>
                    <option v-for="v in vehiculos" :key="v.id_vehiculo" :value="v.id_vehiculo">
                        {{ v.placa }} — {{ v.marca }} {{ v.modelo }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_vehiculo">{{ errores.id_vehiculo }}</span>
            </div>

            <!-- Campos comunes -->
            <div class="campo">
                <label>Origen</label>
                <input v-model="form.origen" type="text" placeholder="Direccion de origen"
                    @input="() => errores.origen = validarRequerido(form.origen, 'El origen')" />
                <span class="error-campo" v-if="errores.origen">{{ errores.origen }}</span>
            </div>

            <div class="campo">
                <label>Destino</label>
                <input v-model="form.destino" type="text" placeholder="Direccion de destino"
                    @input="() => errores.destino = validarRequerido(form.destino, 'El destino')" />
                <span class="error-campo" v-if="errores.destino">{{ errores.destino }}</span>
            </div>

            <div class="campo">
                <label>Estado</label>
                <select v-model="form.estado" @change="() => errores.estado = validarRequerido(form.estado, 'El estado')">
                    <option value="">Selecciona estado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_curso">En curso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <span class="error-campo" v-if="errores.estado">{{ errores.estado }}</span>
            </div>

            <div class="campo">
                <label>Monto Cobrado</label>
                <input v-model="form.monto_cobrado" type="text" placeholder="0.00"
                    @input="() => errores.monto_cobrado = validarMonto(form.monto_cobrado)" />
                <span class="error-campo" v-if="errores.monto_cobrado">{{ errores.monto_cobrado }}</span>
            </div>

            <div class="campo" v-if="!modoEditar">
                <label>Fecha Solicitud</label>
                <input v-model="form.fecha_solicitud" type="text" placeholder="2024-01-01"
                    @input="() => errores.fecha_solicitud = validarFecha(form.fecha_solicitud)" />
                <span class="error-campo" v-if="errores.fecha_solicitud">{{ errores.fecha_solicitud }}</span>
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
import { createViaje, updateViaje } from '@/services/viajesService'
import { validarMonto, validarFecha, validarRequerido } from '@/utils/validaciones'

// ─── Props y Emits ────────────────────────────────────────────────────────────
const props = defineProps({
    modoEditar: Boolean,
    viajeEditar: Object,    // datos del viaje al editar
    usuarios: Array,
    conductores: Array,
    vehiculos: Array
})

const emit = defineEmits(['cerrar', 'guardado'])

// ─── Estado ───────────────────────────────────────────────────────────────────
const errorGeneral = ref('')
const exito = ref('')

const formVacio = () => ({
    id_usuario: '', id_conductor: '', id_vehiculo: '',
    origen: '', destino: '', estado: '',
    monto_cobrado: '', fecha_solicitud: ''
})

const erroresVacios = () => ({
    id_usuario: '', id_conductor: '', id_vehiculo: '',
    origen: '', destino: '', estado: '',
    monto_cobrado: '', fecha_solicitud: ''
})

const form = ref(formVacio())
const errores = ref(erroresVacios())

// Cuando el padre pasa un viaje para editar, llenamos el form
watch(() => props.viajeEditar, (viaje) => {
    if (viaje) {
        form.value = {
            origen: viaje.origen,
            destino: viaje.destino,
            estado: viaje.estado,
            monto_cobrado: viaje.monto_cobrado || ''
        }
    } else {
        form.value = formVacio()
    }
    errores.value = erroresVacios()
    errorGeneral.value = ''
    exito.value = ''
}, { immediate: true })

// ─── Validación ───────────────────────────────────────────────────────────────
const formularioValido = () => {
    if (!props.modoEditar) {
        errores.value.id_usuario   = validarRequerido(form.value.id_usuario, 'El pasajero')
        errores.value.id_conductor = validarRequerido(form.value.id_conductor, 'El conductor')
        errores.value.id_vehiculo  = validarRequerido(form.value.id_vehiculo, 'El vehiculo')
        errores.value.fecha_solicitud = validarFecha(form.value.fecha_solicitud)
    }
    errores.value.estado         = validarRequerido(form.value.estado, 'El estado')
    errores.value.origen         = validarRequerido(form.value.origen, 'El origen')
    errores.value.destino        = validarRequerido(form.value.destino, 'El destino')
    errores.value.monto_cobrado  = validarMonto(form.value.monto_cobrado)

    return !Object.values(errores.value).some(e => e !== '')
}

// ─── Guardar ──────────────────────────────────────────────────────────────────
const guardar = async () => {
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return

    try {
        if (props.modoEditar) {
            await updateViaje(props.viajeEditar.id_viaje, form.value)
            exito.value = 'Viaje actualizado correctamente'
        } else {
            await createViaje(form.value)
            exito.value = 'Viaje agregado correctamente'
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

.campo label {
    display: block;
    color: #a0a0a0;
    font-size: 13px;
    margin-bottom: 6px;
}

.campo input,
.campo select {
    width: 100%;
    padding: 10px 14px;
    background-color: #1f1f1f;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    transition: border 0.2s;
}

.campo input:focus,
.campo select:focus { border-color: #4ade80; }

.campo select option { background-color: #1f1f1f; }

.error-campo {
    color: #f87171;
    font-size: 12px;
    margin-top: 4px;
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

.modal-botones {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

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
.btn-cancelar:hover {
    background-color: #2a2a2a;
    color: #ffffff;
}
</style>