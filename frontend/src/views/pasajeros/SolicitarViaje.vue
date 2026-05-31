<template>
    <div>
        <div class="form-card">

            <div class="campo">
                <label>Conductor</label>
                <select v-model="form.id_conductor" @change="errores.id_conductor = validarRequerido(form.id_conductor, 'El conductor')">
                    <option value=""> Selecciona conductor </option>
                    <option v-for="c in conductores" :key="c.id_conductor" :value="c.id_conductor">
                        {{ c.nombre }} {{ c.primer_ap }} 
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_conductor">{{ errores.id_conductor }}</span>
            </div>

            <div class="campo">
                <label>Vehiculo</label>
                <select v-model="form.id_vehiculo" @change="errores.id_vehiculo = validarRequerido(form.id_vehiculo, 'El vehiculo')">
                    <option value="">Selecciona vehiculo</option>
                    <option v-for="v in vehiculosFiltrados" :key="v.id_vehiculo" :value="v.id_vehiculo">
                        {{ v.placa }} — {{ v.marca }} {{ v.modelo }} 
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_vehiculo">{{ errores.id_vehiculo }}</span>
            </div>

            <div class="campo">
                <label>Origen</label>
                <input v-model="form.origen" type="text" placeholder="Direccion de origen"@input="errores.origen = validarOrigen(form.origen)" />
                <span class="error-campo" v-if="errores.origen">{{ errores.origen }}</span>
            </div>

            <div class="campo">
                <label>Destino</label>
                <input v-model="form.destino" type="text" placeholder="Direccion de destino" @input="errores.destino = validarDestino(form.destino, 'El destino')" />
                <span class="error-campo" v-if="errores.destino">{{ errores.destino }}</span>
            </div>

            <div class="campo">
                <label>Monto Estimado (opcional)</label>
                <input v-model="form.monto_cobrado" type="text" placeholder="0.00" @input="errores.monto_cobrado = validarMonto(form.monto_cobrado)" />
                <span class="error-campo" v-if="errores.monto_cobrado">{{ errores.monto_cobrado }}</span>
            </div>

            <button class="btn-verde" @click="solicitar" :disabled="cargando">
                <i class="fas fa-car"></i> {{ cargando ? 'Solicitando...' : 'Solicitar Viaje' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { apiGet, apiPost } from '../../api/index'
import { validarRequerido, validarFecha, validarMonto, validarOrigen, validarDestino } from '../../utils/validaciones'
import { alertaExito, alertaError } from '../../utils/alertas'

const conductores = ref([])
const vehiculos = ref([])
const cargando = ref(false)

const form = ref({
    id_conductor: '', id_vehiculo: '', origen: '', destino: '', monto_cobrado: ''
})

const errores = ref({
    id_conductor: '', id_vehiculo: '', origen: '', destino: '', monto_cobrado: ''
})

const cargarDesplegables = async () => {
    try {
        const [c, v] = await Promise.all([
            apiGet('/conductores'),
            apiGet('/vehiculos')
        ])
        conductores.value = c.data
        vehiculos.value = v.data
    } catch (err) { console.error('Error cargando datos', err) }
}

const formularioValido = () => {
    errores.value.id_conductor = validarRequerido(form.value.id_conductor, 'El conductor')
    errores.value.id_vehiculo = validarRequerido(form.value.id_vehiculo, 'El vehiculo')
    errores.value.origen = validarRequerido(form.value.origen, 'El origen')
    errores.value.destino = validarRequerido(form.value.destino, 'El destino')
    errores.value.origen = validarOrigen(form.value.origen) 
    errores.value.destino = validarDestino(form.value.destino)
    errores.value.monto_cobrado = validarMonto(form.value.monto_cobrado)
    return !Object.values(errores.value).some(e => e !== '')
}

const solicitar = async () => {
    if (!formularioValido()) return
    cargando.value = true
    try {
        await apiPost('/pasajero/solicitar-viaje', form.value)
        alertaExito('Viaje solicitado correctamente')
        form.value = { id_conductor: '', id_vehiculo: '', origen: '', destino: '', monto_cobrado: '' }
        errores.value = { id_conductor: '', id_vehiculo: '', origen: '', destino: '', monto_cobrado: '' }
    } catch (err) {
        alertaError(err.response?.data?.error || 'Error al solicitar viaje')
    } finally {
        cargando.value = false
    }
}

const vehiculosFiltrados = computed(() => {
    if (!form.value.id_conductor) return []
    return vehiculos.value.filter(v => v.id_conductor === form.value.id_conductor && v.activo)
})

watch(() => form.value.id_conductor, () => {
    form.value.id_vehiculo = ''
})

onMounted(cargarDesplegables)
</script>

<style scoped>
.form-card {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 32px;
    max-width: 560px;
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
.btn-verde {
    background-color: #4ade80; color: #0a0a0a; border: none;
    padding: 12px 24px; border-radius: 8px; font-size: 15px;
    font-weight: 600; cursor: pointer; transition: background-color 0.2s;
    margin-top: 8px;
}
.btn-verde:hover { background-color: #22c55e; }
.btn-verde:disabled { background-color: #2a2a2a; color: #a0a0a0; cursor: not-allowed; }
</style>