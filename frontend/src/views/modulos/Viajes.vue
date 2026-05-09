<template>
    <div>
        <!-- BOTON AGREGAR -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 style="color: #ffffff;">Lista de Viajes</h4>
            <button class="btn-verde" @click="abrirModalAgregar">
                <i class="fas fa-plus"></i> Agregar Viaje
            </button>
        </div>

        <!-- TABLA -->
        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pasajero</th>
                        <th>Conductor</th>
                        <th>Vehiculo</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Estado</th>
                        <th>Monto</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="viajes.length === 0">
                        <td colspan="9" style="text-align:center; color:#a0a0a0;">Sin registros</td>
                    </tr>
                    <tr v-for="viaje in viajes" :key="viaje.id_viaje">
                        <td>{{ viaje.id_viaje }}</td>
                        <td>{{ viaje.pasajero }}</td>
                        <td>{{ viaje.conductor }}</td>
                        <td>{{ viaje.vehiculo }}</td>
                        <td>{{ viaje.origen }}</td>
                        <td>{{ viaje.destino }}</td>
                        <td>
                            <span :class="['badge-estado', viaje.estado]">{{ viaje.estado }}</span>
                        </td>
                        <td>{{ viaje.monto_cobrado ? '$' + viaje.monto_cobrado : '—' }}</td>
                        <td>
                            <button class="btn-accion editar" @click="abrirModalEditar(viaje)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion eliminar" @click="eliminarViaje(viaje.id_viaje)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- MODAL -->
        <div class="modal-fondo" v-if="modalVisible">
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
                    <input v-model="form.origen" type="text" placeholder="Direccion de origen" @input="validarOrigen" />
                    <span class="error-campo" v-if="errores.origen">{{ errores.origen }}</span>
                </div>

                <div class="campo">
                    <label>Destino</label>
                    <input v-model="form.destino" type="text" placeholder="Direccion de destino" @input="validarDestino" />
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
                    <input v-model="form.monto_cobrado" type="text" placeholder="0.00" @input="validarMonto" />
                    <span class="error-campo" v-if="errores.monto_cobrado">{{ errores.monto_cobrado }}</span>
                </div>

                <div class="campo" v-if="!modoEditar">
                    <label>Fecha Solicitud</label>
                    <input v-model="form.fecha_solicitud" type="text" placeholder="2024-01-01" @input="validarFecha" />
                    <span class="error-campo" v-if="errores.fecha_solicitud">{{ errores.fecha_solicitud }}</span>
                </div>

                <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>
                <p v-if="exito" class="exito">{{ exito }}</p>

                <div class="modal-botones">
                    <button class="btn-verde" @click="guardar">
                        {{ modoEditar ? 'Actualizar' : 'Guardar' }}
                    </button>
                    <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const viajes = ref([])
const usuarios = ref([])
const conductores = ref([])
const vehiculos = ref([])
const modalVisible = ref(false)
const modoEditar = ref(false)
const errorGeneral = ref('')
const exito = ref('')
const idEditando = ref(null)

const form = ref({
    id_usuario: '',
    id_conductor: '',
    id_vehiculo: '',
    origen: '',
    destino: '',
    estado: '',
    monto_cobrado: '',
    fecha_solicitud: ''
})

const errores = ref({
    id_usuario: '',
    id_conductor: '',
    id_vehiculo: '',
    origen: '',
    destino: '',
    estado: '',
    monto_cobrado: '',
    fecha_solicitud: ''
})

const getHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
}
const cargarViajes = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/viajes', { headers: getHeaders() })
        viajes.value = res.data
    } catch (err) {
        console.error('Error cargando viajes', err)
    }
}

const cargarDesplegables = async () => {
    try {
        const [u, c, v] = await Promise.all([
            axios.get('http://localhost:3000/api/usuarios', { headers: getHeaders() }),
            axios.get('http://localhost:3000/api/conductores', { headers: getHeaders() }),
            axios.get('http://localhost:3000/api/vehiculos', { headers: getHeaders() })
        ])
        usuarios.value = u.data
        conductores.value = c.data
        vehiculos.value = v.data
    } catch (err) {
        console.error('Error cargando desplegables', err)
    }
}

const validarOrigen = () => {
    errores.value.origen = !form.value.origen ? 'El origen es obligatorio' : ''
}
const validarDestino = () => {
    errores.value.destino = !form.value.destino ? 'El destino es obligatorio' : ''
}
const validarMonto = () => {
    const regex = /^\d+(\.\d{1,2})?$/
    if (!form.value.monto_cobrado) {
        errores.value.monto_cobrado = ''
    } else if (!regex.test(form.value.monto_cobrado)) {
        errores.value.monto_cobrado = 'Ingresa un monto valido, ejemplo: 150.00'
    } else {
        errores.value.monto_cobrado = ''
    }
}
const validarFecha = () => {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!form.value.fecha_solicitud) {
        errores.value.fecha_solicitud = 'La fecha es obligatoria'
    } else if (!regex.test(form.value.fecha_solicitud)) {
        errores.value.fecha_solicitud = 'Formato invalido, usa: 2024-01-01'
    } else {
        errores.value.fecha_solicitud = ''
    }
}

const formularioValido = () => {
    if (!modoEditar.value) {
        errores.value.id_usuario = !form.value.id_usuario ? 'Selecciona un pasajero' : ''
        errores.value.id_conductor = !form.value.id_conductor ? 'Selecciona un conductor' : ''
        errores.value.id_vehiculo = !form.value.id_vehiculo ? 'Selecciona un vehiculo' : ''
        validarFecha()
    }
    errores.value.estado = !form.value.estado ? 'Selecciona un estado' : ''
    validarOrigen()
    validarDestino()
    validarMonto()

    return !Object.values(errores.value).some(e => e !== '')
}

const abrirModalAgregar = () => {
    modoEditar.value = false
    idEditando.value = null
    form.value = { id_usuario: '', id_conductor: '', id_vehiculo: '', origen: '', destino: '', estado: '', monto_cobrado: '', fecha_solicitud: '' }
    errores.value = { id_usuario: '', id_conductor: '', id_vehiculo: '', origen: '', destino: '', estado: '', monto_cobrado: '', fecha_solicitud: '' }
    errorGeneral.value = ''
    exito.value = ''
    modalVisible.value = true
}

const abrirModalEditar = (viaje) => {
    modoEditar.value = true
    idEditando.value = viaje.id_viaje
    form.value = {
        origen: viaje.origen,
        destino: viaje.destino,
        estado: viaje.estado,
        monto_cobrado: viaje.monto_cobrado || ''
    }
    errores.value = { id_usuario: '', id_conductor: '', id_vehiculo: '', origen: '', destino: '', estado: '', monto_cobrado: '', fecha_solicitud: '' }
    errorGeneral.value = ''
    exito.value = ''
    modalVisible.value = true
}

const cerrarModal = () => {
    modalVisible.value = false
}

const guardar = async () => {
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return

    try {
        if (modoEditar.value) {
            await axios.put(`http://localhost:3000/api/viajes/${idEditando.value}`, form.value, { headers: headers() })
            exito.value = 'Viaje actualizado correctamente'
        } else {
            await axios.post('http://localhost:3000/api/viajes', form.value, { headers: headers() })
            exito.value = 'Viaje agregado correctamente'
        }
        await cargarViajes()
        setTimeout(() => cerrarModal(), 1000)
    } catch (err) {
        errorGeneral.value = err.response?.data?.error || 'Error al guardar'
    }
}

const eliminarViaje = async (id) => {
    if (!confirm('Seguro que deseas eliminar este viaje?')) return
    try {
        await axios.delete(`http://localhost:3000/api/viajes/${id}`, { headers: headers() })
        await cargarViajes()
    } catch (err) {
        alert('Error al eliminar viaje')
    }
}

onMounted(async () => {
    await cargarViajes()
    await cargarDesplegables()
})
</script>

<style scoped>
.tabla-contenedor {
    overflow-x: auto;
}

.tabla {
    width: 100%;
    border-collapse: collapse;
    background-color: #141414;
    border-radius: 12px;
    overflow: hidden;
}

.tabla th {
    background-color: #1f1f1f;
    color: #4ade80;
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    text-transform: uppercase;
}

.tabla td {
    padding: 12px 16px;
    color: #ffffff;
    border-bottom: 1px solid #2a2a2a;
    font-size: 14px;
}

.tabla tr:hover td {
    background-color: #1a1a1a;
}

.badge-estado {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.badge-estado.pendiente { background-color: #854d0e; color: #fef08a; }
.badge-estado.en_curso { background-color: #1e3a8a; color: #93c5fd; }
.badge-estado.completado { background-color: #14532d; color: #4ade80; }
.badge-estado.cancelado { background-color: #7f1d1d; color: #fca5a5; }

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

.btn-accion {
    border: none;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 6px;
    font-size: 13px;
    transition: opacity 0.2s;
}

.btn-accion.editar { background-color: #1e3a8a; color: #93c5fd; }
.btn-accion.eliminar { background-color: #7f1d1d; color: #fca5a5; }
.btn-accion:hover { opacity: 0.8; }

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

.campo {
    margin-bottom: 16px;
}

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