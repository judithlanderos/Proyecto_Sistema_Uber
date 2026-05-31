<template>
    <div class="modal-fondo">
        <div class="modal-caja">
            <h4 style="color:#ffffff; margin-bottom:20px;">
                {{ modoEditar ? 'Editar Pago' : 'Agregar Pago' }}
            </h4>

            <div class="campo" v-if="!modoEditar">
                <label>Viaje (solo completados)</label>
                <select v-model="form.id_viaje" @change="errores.id_viaje = validarSeleccion(form.id_viaje, 'un viaje')">
                    <option value=""> Selecciona un viaje </option>
                    <option v-for="v in viajes" :key="v.id_viaje" :value="v.id_viaje">
                        #{{ v.id_viaje }} — {{ v.origen }} → {{ v.destino }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_viaje">{{ errores.id_viaje }}</span>
            </div>

            <div class="campo">
                <label>Metodo de Pago</label>
                <select v-model="form.id_metodo" @change="errores.id_metodo = validarSeleccion(form.id_metodo, 'un metodo')">
                    <option value="">Selecciona metodo</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="saldo_uber">Saldo Uber</option>
                </select>
                <span class="error-campo" v-if="errores.id_metodo">{{ errores.id_metodo }}</span>
            </div>

            <div class="campo">
                <label>Monto</label>
                <input v-model="form.monto" type="text" placeholder="0.00" @input="errores.monto = validarMonto(form.monto)" />
                <span class="error-campo" v-if="errores.monto">{{ errores.monto }}</span>
            </div>

            
            <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>

            <div class="modal-botones">
                <button class="btn-verde" @click="guardar">{{ modoEditar ? 'Actualizar' : 'Guardar' }}</button>
                <button class="btn-cancelar" @click="$emit('cerrar')">Cancelar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { validarMonto, validarSeleccion } from '../../utils/validaciones'
import { crearPago, actualizarPago, getViajesCompletados, getMetodosPago } from '../../services/pagoService'
import { alertaExito, alertaError } from '../../utils/alertas'

const props = defineProps({ pago: Object })
const emit = defineEmits(['cerrar', 'guardado'])

const modoEditar = ref(false)
const errorGeneral = ref('')
const viajes = ref([])
const metodos = ref([])

const form = ref({ id_viaje: '', id_metodo: '', monto: ''})
const errores = ref({ id_viaje: '', id_metodo: '', monto: '' })

const cargarDesplegables = async () => {
    try {
        const [v, m] = await Promise.all([getViajesCompletados(), getMetodosPago()])
        viajes.value = v.data
        metodos.value = m.data
    } catch { viajes.value = []; metodos.value = [] }
}

// Normaliza la fecha que viene del backend (puede traer hora: "2026-04-01T06:00:00.000Z")
const normalizarFecha = (fecha) => {
    if (!fecha) return ''
    return fecha.toString().substring(0, 10)
}

watch(() => props.pago, (p) => {
    if (p) {
        modoEditar.value = true
        form.value = {
            id_viaje: '',                                       
            id_metodo: p.MetodoPago_id_metodo ?? p.id_metodo ?? '',
            monto: p.monto ?? '',
        }
    } else {
        modoEditar.value = false
        form.value = { id_viaje: '', id_metodo: '', monto: '' }
    }
    errores.value = { id_viaje: '', id_metodo: '', monto: '' }
    errorGeneral.value = ''
}, { immediate: true })

cargarDesplegables()

const formularioValido = () => {
    if (!modoEditar.value) {
        errores.value.id_viaje  = validarSeleccion(form.value.id_viaje,  'un viaje')
        errores.value.id_metodo = validarSeleccion(form.value.id_metodo, 'un metodo')
    } else {
        errores.value.id_viaje  = ''
        errores.value.id_metodo = validarSeleccion(form.value.id_metodo, 'un metodo')
    }
    errores.value.monto            = validarMonto(form.value.monto) || (String(form.value.monto).trim() === '' ? 'El monto es obligatorio' : '')
    //errores.value.fecha_transaccion = validarFecha(form.value.fecha_transaccion)
    return !Object.values(errores.value).some(e => e !== '')
}

const guardar = async () => {
    errorGeneral.value = ''
    if (!formularioValido()) return
    try {
        if (modoEditar.value) {
            await actualizarPago(props.pago.id_pago, {
                monto:             form.value.monto,
                //fecha_transaccion: form.value.fecha_transaccion,
                id_metodo:         form.value.id_metodo
            })
            alertaExito('Pago actualizado correctamente')
        } else {
            await crearPago(form.value)
            alertaExito('Pago creado correctamente')
        }
        emit('guardado')
        setTimeout(() => emit('cerrar'), 1000)
    } catch (err) {
        alertaError(err.response?.data?.error || 'Error al guardar')
        errorGeneral.value = err.response?.data?.error || 'Error al guardar'
    }
}
</script>

<style scoped>
.modal-fondo {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: flex; justify-content: center; align-items: center;
    z-index: 9999;
}
.modal-caja {
    background-color: #141414; border: 1px solid #2a2a2a;
    border-radius: 12px; padding: 32px;
    width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
}
.campo { margin-bottom: 16px; }
.campo label { display: block; color: #a0a0a0; font-size: 13px; margin-bottom: 6px; }
.campo input, .campo select {
    width: 100%; padding: 10px 14px;
    background-color: #1f1f1f; border: 1px solid #2a2a2a;
    border-radius: 8px; color: #ffffff; font-size: 14px;
    outline: none; transition: border 0.2s; box-sizing: border-box;
}
.campo input:focus, .campo select:focus { border-color: #4ade80; }
.campo select option { background-color: #1f1f1f; }
.error-campo { color: #f87171; font-size: 12px; margin-top: 4px; display: block; }
.error-general { color: #f87171; font-size: 13px; text-align: center; margin-bottom: 10px; }
.modal-botones { display: flex; gap: 10px; margin-top: 20px; }
.btn-verde { background-color: #4ade80; color: #0a0a0a; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-verde:hover { background-color: #22c55e; }
.btn-cancelar { background-color: #1f1f1f; border: 1px solid #2a2a2a; color: #a0a0a0; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-cancelar:hover { background-color: #2a2a2a; color: #ffffff; }
</style>