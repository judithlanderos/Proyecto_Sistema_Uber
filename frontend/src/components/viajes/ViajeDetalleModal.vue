<template>
    <!-- MODAL AGREGAR/EDITAR -->
    <div class="modal-fondo" v-if="tipo === 'form'">
        <div class="modal-caja">
            <h4 style="color:#ffffff; margin-bottom: 20px;">
                {{ modoEditar ? 'Editar Viaje' : 'Agregar Viaje' }}
            </h4>

            <div class="campo" v-if="!modoEditar">
                <label>Pasajero</label>
                <select v-model="form.id_usuario">
                    <option value="">Selecciona un pasajero</option>
                    <option v-for="u in usuarios" :key="u.id_usuario" :value="u.id_usuario">
                        {{ u.nombre }} {{ u.primer_ap }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_usuario">{{ errores.id_usuario }}</span>
            </div>

            <div class="campo" v-if="!modoEditar">
                <label>Conductor</label>
                <select v-model="form.id_conductor">
                    <option value="">Selecciona un conductor</option>
                    <option v-for="c in conductores" :key="c.id_conductor" :value="c.id_conductor">
                        {{ c.nombre }} {{ c.primer_ap }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_conductor">{{ errores.id_conductor }}</span>
            </div>

            <div class="campo" v-if="!modoEditar">
                <label>Vehiculo</label>
                <select v-model="form.id_vehiculo">
                    <option value="">Selecciona un vehiculo</option>
                    <option v-for="v in vehiculos" :key="v.id_vehiculo" :value="v.id_vehiculo">
                        {{ v.placa }} — {{ v.marca }} {{ v.modelo }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_vehiculo">{{ errores.id_vehiculo }}</span>
            </div>

            <div class="campo">
                <label>Origen</label>
                <input v-model="form.origen" type="text" placeholder="Direccion de origen" @input="validarCampo('origen')" />
                <span class="error-campo" v-if="errores.origen">{{ errores.origen }}</span>
            </div>

            <div class="campo">
                <label>Destino</label>
                <input v-model="form.destino" type="text" placeholder="Direccion de destino" @input="validarCampo('destino')" />
                <span class="error-campo" v-if="errores.destino">{{ errores.destino }}</span>
            </div>

            <div class="campo">
                <label>Estado</label>
                <select v-model="form.estado">
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
                <input v-model="form.monto_cobrado" type="text" placeholder="0.00" @input="validarCampo('monto')" />
                <span class="error-campo" v-if="errores.monto_cobrado">{{ errores.monto_cobrado }}</span>
            </div>


            <div class="campo">
                <label>Distancia (km)</label>
                <input v-model="form.distancia_km" type="text" placeholder="0.00" @input="validarCampo('distancia')" />
                <span class="error-campo" v-if="errores.distancia_km">{{ errores.distancia_km }}</span>
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

    <!-- MODAL DETALLE -->
    <div class="modal-fondo" v-if="tipo === 'detalle'">
        <div class="modal-caja" style="max-width: 600px;">
            <h4 style="color:#4ade80; margin-bottom: 20px;">Detalle del Viaje #{{ detalle?.id_viaje }}</h4>

            <div class="detalle-seccion">
                <h5 style="color:#ffffff; margin-bottom:12px;">Informacion del Viaje</h5>
                <div class="detalle-grid">
                    <div class="detalle-item"><span class="detalle-label">Origen</span><span class="detalle-valor">{{ detalle?.origen }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Destino</span><span class="detalle-valor">{{ detalle?.destino }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Fecha Salida</span><span class="detalle-valor">{{ detalle?.fecha_salida }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Fecha Fin</span><span class="detalle-valor">{{ detalle?.fecha_fin || 'Pendiente' }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Distancia</span><span class="detalle-valor">{{ detalle?.distancia_km ? detalle.distancia_km + ' km' : '-' }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Estado</span><span :class="['badge-estado', detalle?.estado]">{{ detalle?.estado }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Monto</span><span class="detalle-valor">{{ detalle?.monto_cobrado ? '$' + detalle.monto_cobrado : '—' }}</span></div>
                </div>
            </div>

            <div class="detalle-seccion">
                <h5 style="color:#ffffff; margin-bottom:12px;">Pasajero</h5>
                <div class="detalle-grid">
                    <div class="detalle-item"><span class="detalle-label">Nombre</span><span class="detalle-valor">{{ detalle?.pasajero }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Correo</span><span class="detalle-valor">{{ detalle?.correo_pasajero }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Telefono</span><span class="detalle-valor">{{ detalle?.telefono_pasajero }}</span></div>
                </div>
            </div>

            <div class="detalle-seccion">
                <h5 style="color:#ffffff; margin-bottom:12px;">Conductor</h5>
                <div class="detalle-grid">
                    <div class="detalle-item"><span class="detalle-label">Nombre</span><span class="detalle-valor">{{ detalle?.conductor }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Licencia</span><span class="detalle-valor">{{ detalle?.num_licencia }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Calificacion</span><span class="detalle-valor">{{ detalle?.calificacion_prom }}</span></div>
                </div>
            </div>

            <div class="detalle-seccion">
                <h5 style="color:#ffffff; margin-bottom:12px;">Vehiculo</h5>
                <div class="detalle-grid">
                    <div class="detalle-item"><span class="detalle-label">Placa</span><span class="detalle-valor">{{ detalle?.placa }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Marca</span><span class="detalle-valor">{{ detalle?.marca }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Modelo</span><span class="detalle-valor">{{ detalle?.modelo }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Año</span><span class="detalle-valor">{{ detalle?.anio }}</span></div>
                    <div class="detalle-item"><span class="detalle-label">Categoria</span><span class="detalle-valor">{{ detalle?.categoria }}</span></div>
                </div>
            </div>

            <div class="modal-botones">
                <button class="btn-cancelar" @click="$emit('cerrar')">Cerrar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { postViaje, putViaje } from '../../services/viajeService'
import { alertaExito, alertaError } from '../../utils/alertas'
import { validarMonto, validarFecha, validarRequerido, validarDistancia, validarSeleccion, validarOrigen, validarDestino } from '../../utils/validaciones'

const props = defineProps({
    tipo: String,
    modoEditar: Boolean,
    viajeEditar: Object,
    detalle: Object,
    usuarios: Array,
    conductores: Array,
    vehiculos: Array
})

const emit = defineEmits(['cerrar', 'guardado'])

const errorGeneral = ref('')
const exito = ref('')

const form = ref({
    id_usuario: '', id_conductor: '', id_vehiculo: '',
    origen: '', destino: '', estado: '', monto_cobrado: '', 
         fecha_inicio: '', fecha_fin: '', distancia_km: ''
})

const errores = ref({
    id_usuario: '', id_conductor: '', id_vehiculo: '',
    origen: '', destino: '', estado: '', monto_cobrado: '', 
    fecha_inicio: '', fecha_fin: '', distancia_km: ''
})

watch(() => props.viajeEditar, (viaje) => {
    if (viaje) {
        form.value = {
            origen: viaje.origen || '',
            destino: viaje.destino || '',
            estado: viaje.estado || '',
            monto_cobrado: viaje.monto_cobrado || '',
            fecha_inicio: viaje.fecha_inicio || '',
            fecha_fin: viaje.fecha_fin || '',
            distancia_km: viaje.distancia_km || ''
        }
    } else {
        form.value = { id_usuario: '', id_conductor: '', id_vehiculo: '', origen: '', destino: '',
         estado: '', monto_cobrado: '', fecha_inicio: '', fecha_fin: '',
            distancia_km: '' }
    }
}, { immediate: true })

const actualizarFechas = () => {
    if (form.value.fecha_solicitud) {
        form.value.fecha_inicio = form.value.fecha_solicitud
        form.value.fecha_fin = form.value.fecha_solicitud
    }
    validarCampo('fecha')
}

const validarCampo = (campo) => {
    if (campo === 'origen') errores.value.origen = validarOrigen(form.value.origen, 'El origen')
    if (campo === 'destino') errores.value.destino = validarDestino(form.value.destino, 'El destino')
    if (campo === 'monto') errores.value.monto_cobrado = validarMonto(form.value.monto_cobrado)
    //if (campo === 'fecha') errores.value.fecha_solicitud = validarFecha(form.value.fecha_solicitud)
    if (campo === 'distancia') errores.value.distancia_km = form.value.distancia_km ? validarDistancia(form.value.distancia_km) : ''
}

const formularioValido = () => {
    if (!props.modoEditar) {
        errores.value.id_usuario = validarSeleccion(form.value.id_usuario, 'un pasajero')
        errores.value.id_conductor = validarSeleccion(form.value.id_conductor, 'un conductor')
        errores.value.id_vehiculo = validarSeleccion(form.value.id_vehiculo, 'un vehiculo')
    }
    errores.value.estado = validarSeleccion(form.value.estado, 'un estado')
    validarCampo('origen')
    validarCampo('destino')
    validarCampo('monto')
    validarCampo('distancia')
    return !Object.values(errores.value).some(e => e !== '')
}

const guardar = async () => {
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return


    const payload = {
        ...form.value,
        distancia_km: form.value.distancia_km !== '' ? form.value.distancia_km : null
    }

    console.log('PAYLOAD QUE SE MANDA:', payload)
    console.log('distancia_km:', payload.distancia_km) 


    try {
        if (props.modoEditar) {
            await putViaje(props.viajeEditar.id_viaje, payload)
            alertaExito('Viaje actualizado correctamente')
        } else {
            await postViaje(form.value)
            alertaExito('Viaje agregado correctamente')
        }
        emit('guardado')
        setTimeout(() => emit('cerrar'), 1000)
    } catch (err) {
        alertaError(err.response?.data?.error || 'Error al guardar')
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
    z-index: 9999;
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

.campo input, .campo select {
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

.campo input:focus, .campo select:focus { border-color: #4ade80; }
.campo select option { background-color: #1f1f1f; }

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

.detalle-seccion {
    background-color: #1f1f1f;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
}

.detalle-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.detalle-item { display: flex; flex-direction: column; gap: 4px; }
.detalle-label { color: #a0a0a0; font-size: 12px; text-transform: uppercase; }
.detalle-valor { color: #ffffff; font-size: 14px; }

.badge-estado {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}
.badge-estado.pendiente  { background-color: #854d0e; color: #fef08a; }
.badge-estado.en_curso   { background-color: #1e3a8a; color: #93c5fd; }
.badge-estado.completado { background-color: #14532d; color: #4ade80; }
.badge-estado.cancelado  { background-color: #7f1d1d; color: #fca5a5; }

@media (max-width: 768px) {
    .detalle-grid { grid-template-columns: 1fr; }
    .modal-caja { padding: 20px 16px; }
}
</style>