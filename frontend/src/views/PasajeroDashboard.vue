<template>
    <div class="layout">
        <div class="sidebar">
            <div class="sidebar-top">
                <div class="logo-area">
                    <div class="logo-icon"><i class="fas fa-car-side"></i></div>
                    <span class="marca">SistemaUber</span>
                </div>
                <div class="user-chip">
                    <div class="avatar"><i class="fas fa-user"></i></div>
                    <div class="user-info">
                        <span class="user-name">{{ usuario?.nombre }} {{ usuario?.primer_ap }}</span>
                        <span class="user-role">Pasajero</span>
                    </div>
                </div>
                <nav class="nav">
                    <button :class="['nav-btn', seccion === 'solicitar' && 'activo']" @click="seccion = 'solicitar'">
                        <i class="fas fa-route nav-icon"></i><span>Solicitar Viaje</span>
                    </button>
                    <button :class="['nav-btn', seccion === 'viajes' && 'activo']" @click="cambiarSeccion('viajes')">
                        <i class="fas fa-list-ul nav-icon"></i><span>Mis Viajes</span>
                    </button>
                    <button :class="['nav-btn', seccion === 'pagos' && 'activo']" @click="cambiarSeccion('pagos')">
                        <i class="fas fa-credit-card nav-icon"></i><span>Mis Pagos</span>
                    </button>
                </nav>
            </div>
            <button class="btn-cerrar" @click="cerrarSesion">
                <i class="fas fa-sign-out-alt"></i><span>Cerrar Sesión</span>
            </button>
        </div>

        <div class="contenido">

            <!-- SOLICITAR VIAJE -->
            <div v-if="seccion === 'solicitar'">
                <div class="seccion-header">
                    <h2 class="titulo-seccion"><i class="fas fa-route header-icon"></i> Solicitar Viaje</h2>
                </div>
                <div class="form-grid">
                    <!-- Ruta -->
                    <div class="tarjeta">
                        <h3 class="tarjeta-titulo"><i class="fas fa-map-marker-alt"></i> Ruta</h3>
                        <div class="campo">
                            <label>Origen</label>
                            <div class="input-wrap">
                                <i class="fas fa-circle-dot input-icon origen-icon"></i>
                                <input
                                    v-model="form.origen"
                                    type="text"
                                    placeholder="¿Desde dónde partes?"
                                    :class="{ 'input-error': errores.origen }"
                                    @input="errores.origen = ''"
                                />
                            </div>
                            <span v-if="errores.origen" class="campo-error">{{ errores.origen }}</span>
                        </div>
                        <div class="ruta-conector"><span class="conector-line"></span></div>
                        <div class="campo">
                            <label>Destino</label>
                            <div class="input-wrap">
                                <i class="fas fa-location-dot input-icon destino-icon"></i>
                                <input
                                    v-model="form.destino"
                                    type="text"
                                    placeholder="¿A dónde vas?"
                                    :class="{ 'input-error': errores.destino }"
                                    @input="errores.destino = ''"
                                />
                            </div>
                            <span v-if="errores.destino" class="campo-error">{{ errores.destino }}</span>
                        </div>
                        <div class="divider"></div>
                        <p v-if="errorSolicitud" class="error-general">
                            <i class="fas fa-triangle-exclamation"></i> {{ errorSolicitud }}
                        </p>
                        <p v-if="exitoSolicitud" class="msg-exito">
                            <i class="fas fa-circle-check"></i> {{ exitoSolicitud }}
                        </p>
                        <button class="boton" @click="solicitarViaje" :disabled="cargandoSolicitud">
                            <i class="fas fa-paper-plane"></i>
                            {{ cargandoSolicitud ? 'Solicitando...' : 'Confirmar Viaje' }}
                        </button>
                    </div>

                    <!-- Conductores -->
                    <div class="tarjeta conductores-tarjeta">
                        <h3 class="tarjeta-titulo">
                            <i class="fas fa-id-badge"></i> Selecciona un Conductor
                            <span v-if="errores.conductor" class="campo-error campo-error-inline">
                                <i class="fas fa-triangle-exclamation"></i> {{ errores.conductor }}
                            </span>
                        </h3>
                        <div v-if="cargandoConductores" class="estado-loading">
                            <i class="fas fa-spinner fa-spin"></i> Cargando conductores...
                        </div>
                        <div v-else-if="conductores.length === 0" class="estado-vacio">
                            <i class="fas fa-user-slash"></i>
                            <p>No hay conductores disponibles.</p>
                        </div>
                        <div v-else class="conductores-grid">
                            <div
                                v-for="c in conductores"
                                :key="c.id_vehiculo"
                                :class="['conductor-card', conductorSeleccionado?.id_vehiculo === c.id_vehiculo ? 'seleccionado' : '']"
                                @click="seleccionarConductor(c)"
                            >
                                <div class="conductor-avatar">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <div class="conductor-info">
                                    <div class="conductor-row">
                                        <span class="conductor-nombre">{{ c.nombre || 'Sin nombre' }}</span>
                                        <span class="badge-categoria">{{ c.categoria || 'Estándar' }}</span>
                                    </div>
                                    <div class="conductor-row sub">
                                        <span><i class="fas fa-car"></i> {{ c.marca || '—' }} {{ c.modelo || '' }}</span>
                                        <span class="placa" v-if="c.placa"><i class="fas fa-hashtag"></i> {{ c.placa }}</span>
                                    </div>
                                    <div class="conductor-row sub">
                                        <span class="rating">
                                            <i class="fas fa-star"></i>
                                            {{ formatCalificacion(c.calificacion_prom) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="check-icon" v-if="conductorSeleccionado?.id_vehiculo === c.id_vehiculo">
                                    <i class="fas fa-circle-check"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MIS VIAJES -->
            <div v-if="seccion === 'viajes'">
                <div class="seccion-header">
                    <h2 class="titulo-seccion"><i class="fas fa-list-ul header-icon"></i> Mis Viajes</h2>
                    <button class="btn-verde" @click="abrirModalAgregar">
                        <i class="fas fa-plus"></i> Agregar Viaje
                    </button>
                </div>
                <div v-if="cargandoViajes" class="estado-loading">
                    <i class="fas fa-spinner fa-spin"></i> Cargando viajes...
                </div>
                <div v-else-if="viajes.length === 0" class="estado-vacio">
                    <i class="fas fa-route"></i>
                    <p>No tienes viajes registrados aún.</p>
                </div>
                <div v-else class="tabla-contenedor">
                    <table class="tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Estado</th>
                                <th>Conductor</th>
                                <th>Vehículo</th>
                                <th>Monto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="v in viajes" :key="v.id_viaje">
                                <td>{{ v.id_viaje }}</td>
                                <td>{{ v.origen || '—' }}</td>
                                <td>{{ v.destino || '—' }}</td>
                                <td><span :class="['badge-estado', estadoClass(v.estado)]">{{ v.estado }}</span></td>
                                <td>{{ v.conductor || '—' }}</td>
                                <td>
                                    <span v-if="v.marca || v.modelo">
                                        {{ v.marca }} {{ v.modelo }}
                                        <span v-if="v.placa" class="placa-mini">{{ v.placa }}</span>
                                    </span>
                                    <span v-else>—</span>
                                </td>
                                <td>
                                    <span v-if="v.monto_cobrado && Number(v.monto_cobrado) > 0" class="monto">
                                        ${{ Number(v.monto_cobrado).toFixed(2) }}
                                    </span>
                                    <span v-else class="badge-pendiente">Pendiente</span>
                                </td>
                                <td>
                                    <button
                                        v-if="v.estado === 'pendiente'"
                                        class="btn-accion eliminar"
                                        @click="cancelarViaje(v.id_viaje)"
                                        title="Cancelar viaje"
                                    >
                                        <i class="fas fa-ban"></i>
                                    </button>
                                    <span v-else>—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- MIS PAGOS -->
            <div v-if="seccion === 'pagos'">
                <div class="seccion-header">
                    <h2 class="titulo-seccion"><i class="fas fa-credit-card header-icon"></i> Mis Pagos</h2>
                </div>
                <div v-if="cargandoPagos" class="estado-loading">
                    <i class="fas fa-spinner fa-spin"></i> Cargando pagos...
                </div>
                <div v-else-if="pagos.length === 0" class="estado-vacio">
                    <i class="fas fa-receipt"></i>
                    <p>No tienes pagos registrados aún.</p>
                </div>
                <div v-else class="tabla-contenedor">
                    <table class="tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Método</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in pagos" :key="p.id_pago">
                                <td>{{ p.id_pago }}</td>
                                <td>{{ p.origen || '—' }}</td>
                                <td>{{ p.destino || '—' }}</td>
                                <td>
                                    <span class="badge-metodo">
                                        <i :class="metodoIcono(p.metodo)"></i> {{ p.metodo || '—' }}
                                    </span>
                                </td>
                                <td class="monto">${{ Number(p.monto || 0).toFixed(2) }}</td>
                                <td>{{ p.fecha_pago?.slice(0, 10) || '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <!-- MODAL AGREGAR VIAJE -->
        <div v-if="modalAgregar" class="modal-overlay" @click.self="cerrarModalAgregar">
            <div class="modal-box">
                <div class="modal-header">
                    <h3><i class="fas fa-plus-circle"></i> Agregar Viaje</h3>
                    <button class="modal-close" @click="cerrarModalAgregar">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="campo">
                        <label>Origen</label>
                        <div class="input-wrap">
                            <i class="fas fa-circle-dot input-icon origen-icon"></i>
                            <input
                                v-model="formModal.origen"
                                type="text"
                                placeholder="¿Desde dónde partes?"
                                :class="{ 'input-error': erroresModal.origen }"
                                @input="erroresModal.origen = ''"
                            />
                        </div>
                        <span v-if="erroresModal.origen" class="campo-error">{{ erroresModal.origen }}</span>
                    </div>
                    <div class="campo">
                        <label>Destino</label>
                        <div class="input-wrap">
                            <i class="fas fa-location-dot input-icon destino-icon"></i>
                            <input
                                v-model="formModal.destino"
                                type="text"
                                placeholder="¿A dónde vas?"
                                :class="{ 'input-error': erroresModal.destino }"
                                @input="erroresModal.destino = ''"
                            />
                        </div>
                        <span v-if="erroresModal.destino" class="campo-error">{{ erroresModal.destino }}</span>
                    </div>
                    <div class="campo">
                        <label>Conductor</label>
                        <div class="conductores-grid modal-conductores">
                            <div
                                v-for="c in conductores"
                                :key="c.id_vehiculo"
                                :class="['conductor-card conductor-card-sm', formModal.id_conductor === c.id_conductor ? 'seleccionado' : '']"
                                @click="seleccionarConductorModal(c)"
                            >
                                <div class="conductor-avatar" style="width:32px;height:32px;font-size:13px;">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <div class="conductor-info">
                                    <div class="conductor-row">
                                        <span class="conductor-nombre" style="font-size:13px;">{{ c.nombre || 'Sin nombre' }}</span>
                                        <span class="badge-categoria">{{ c.categoria || 'Estándar' }}</span>
                                    </div>
                                    <div class="conductor-row sub">
                                        <span><i class="fas fa-car"></i> {{ c.marca || '—' }} {{ c.modelo || '' }}</span>
                                        <span class="rating"><i class="fas fa-star"></i> {{ formatCalificacion(c.calificacion_prom) }}</span>
                                    </div>
                                </div>
                                <div class="check-icon" v-if="formModal.id_conductor === c.id_conductor">
                                    <i class="fas fa-circle-check"></i>
                                </div>
                            </div>
                        </div>
                        <span v-if="erroresModal.conductor" class="campo-error">{{ erroresModal.conductor }}</span>
                    </div>
                    <p v-if="errorModal" class="error-general">
                        <i class="fas fa-triangle-exclamation"></i> {{ errorModal }}
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancelar-modal" @click="cerrarModalAgregar">Cancelar</button>
                    <button class="boton boton-sm" @click="solicitarViajeModal" :disabled="cargandoModal">
                        <i class="fas fa-paper-plane"></i>
                        {{ cargandoModal ? 'Guardando...' : 'Solicitar Viaje' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario') || '{}'))
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }
const seccion = ref('solicitar')

// ── HELPERS ──────────────────────────────────────────────
const formatCalificacion = (val) => {
    const n = parseFloat(val)
    if (!val || isNaN(n) || n === 0) return 'Sin calif.'
    return n.toFixed(1)
}
const estadoClass = (estado) => {
    if (!estado) return ''
    return estado.replace(/ /g, '_').toLowerCase()
}
const metodoIcono = (metodo) => {
    const map = { 'efectivo': 'fas fa-money-bill-wave', 'tarjeta': 'fas fa-credit-card', 'transferencia': 'fas fa-building-columns' }
    return map[metodo?.toLowerCase()] || 'fas fa-wallet'
}

// ── CONDUCTORES ──────────────────────────────────────────
const conductores = ref([])
const cargandoConductores = ref(false)
// Un único ref para el conductor seleccionado en el form principal
const conductorSeleccionado = ref(null)

const cargarConductores = async () => {
    cargandoConductores.value = true
    try {
        const res = await axios.get('/api/pasajero/conductores', { headers })
        conductores.value = res.data
        console.log('Conductores:', res.data) // para debug
    } catch {
        conductores.value = []
    } finally {
        cargandoConductores.value = false
    }
}

// ── SOLICITAR VIAJE ──────────────────────────────────────
const form = ref({ origen: '', destino: '', id_conductor: null, id_vehiculo: null })
const errores = ref({ origen: '', destino: '', conductor: '' })
const cargandoSolicitud = ref(false)
const errorSolicitud = ref('')
const exitoSolicitud = ref('')

const seleccionarConductor = (c) => {
    // Si ya estaba seleccionado, deseleccionar
    if (conductorSeleccionado.value?.id_vehiculo === c.id_vehiculo) {
        conductorSeleccionado.value = null
        form.value.id_conductor = null
        form.value.id_vehiculo = null
    } else {
        conductorSeleccionado.value = c
        form.value.id_conductor = c.id_conductor
        form.value.id_vehiculo = c.id_vehiculo
        errores.value.conductor = ''
    }
}

const validarFormPrincipal = () => {
    let valido = true
    errores.value = { origen: '', destino: '', conductor: '' }
    if (!form.value.origen.trim()) { errores.value.origen = 'El origen es obligatorio'; valido = false }
    if (!form.value.destino.trim()) { errores.value.destino = 'El destino es obligatorio'; valido = false }
    if (!form.value.id_conductor) { errores.value.conductor = 'Debes seleccionar un conductor'; valido = false }
    return valido
}

const solicitarViaje = async () => {
    errorSolicitud.value = ''
    exitoSolicitud.value = ''
    if (!validarFormPrincipal()) return
    cargandoSolicitud.value = true
    try {
        await axios.post('/api/pasajero/viajes', {
            origen: form.value.origen,
            destino: form.value.destino,
            id_conductor: form.value.id_conductor,
            id_vehiculo: form.value.id_vehiculo
        }, { headers })
        exitoSolicitud.value = '¡Viaje solicitado correctamente!'
        form.value = { origen: '', destino: '', id_conductor: null, id_vehiculo: null }
        conductorSeleccionado.value = null
    } catch (err) {
        errorSolicitud.value = err.response?.data?.error || 'Error al solicitar viaje'
    } finally {
        cargandoSolicitud.value = false
    }
}

// ── MIS VIAJES ───────────────────────────────────────────
const viajes = ref([])
const cargandoViajes = ref(false)

const cargarViajes = async () => {
    cargandoViajes.value = true
    try {
        const res = await axios.get('/api/pasajero/viajes', { headers })
        viajes.value = res.data
        console.log('Viajes:', res.data) // debug
    } catch {
        viajes.value = []
    } finally {
        cargandoViajes.value = false
    }
}

const cancelarViaje = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar este viaje?')) return
    try {
        await axios.put(`/api/pasajero/viajes/${id}/cancelar`, {}, { headers })
        cargarViajes()
    } catch (err) {
        alert(err.response?.data?.error || 'No se pudo cancelar')
    }
}

// ── MODAL AGREGAR VIAJE ──────────────────────────────────
const modalAgregar = ref(false)
const formModal = ref({ origen: '', destino: '', id_conductor: null, id_vehiculo: null })
const erroresModal = ref({ origen: '', destino: '', conductor: '' })
const errorModal = ref('')
const cargandoModal = ref(false)

const abrirModalAgregar = () => {
    formModal.value = { origen: '', destino: '', id_conductor: null, id_vehiculo: null }
    erroresModal.value = { origen: '', destino: '', conductor: '' }
    errorModal.value = ''
    modalAgregar.value = true
}
const cerrarModalAgregar = () => { modalAgregar.value = false }

const seleccionarConductorModal = (c) => {
    if (formModal.value.id_conductor === c.id_conductor) {
        formModal.value.id_conductor = null
        formModal.value.id_vehiculo = null
    } else {
        formModal.value.id_conductor = c.id_conductor
        formModal.value.id_vehiculo = c.id_vehiculo
        erroresModal.value.conductor = ''
    }
}

const validarFormModal = () => {
    let valido = true
    erroresModal.value = { origen: '', destino: '', conductor: '' }
    if (!formModal.value.origen.trim()) { erroresModal.value.origen = 'El origen es obligatorio'; valido = false }
    if (!formModal.value.destino.trim()) { erroresModal.value.destino = 'El destino es obligatorio'; valido = false }
    if (!formModal.value.id_conductor) { erroresModal.value.conductor = 'Debes seleccionar un conductor'; valido = false }
    return valido
}

const solicitarViajeModal = async () => {
    errorModal.value = ''
    if (!validarFormModal()) return
    cargandoModal.value = true
    try {
        await axios.post('/api/pasajero/viajes', {
            origen: formModal.value.origen,
            destino: formModal.value.destino,
            id_conductor: formModal.value.id_conductor,
            id_vehiculo: formModal.value.id_vehiculo
        }, { headers })
        cerrarModalAgregar()
        cargarViajes()
    } catch (err) {
        errorModal.value = err.response?.data?.error || 'Error al solicitar viaje'
    } finally {
        cargandoModal.value = false
    }
}

// ── MIS PAGOS ────────────────────────────────────────────
const pagos = ref([])
const cargandoPagos = ref(false)

const cargarPagos = async () => {
    cargandoPagos.value = true
    try {
        const res = await axios.get('/api/pasajero/pagos', { headers })
        pagos.value = res.data
    } catch {
        pagos.value = []
    } finally {
        cargandoPagos.value = false
    }
}

const cambiarSeccion = (s) => {
    seccion.value = s
    if (s === 'viajes') cargarViajes()
    if (s === 'pagos') cargarPagos()
}

const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
}

onMounted(() => cargarConductores())
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background-color: #0a0a0a; color: #fff; font-family: inherit; }

/* SIDEBAR */
.sidebar { width: 240px; background-color: #111; border-right: 1px solid #1e1e1e; padding: 28px 16px 24px; display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; }
.sidebar-top { display: flex; flex-direction: column; gap: 24px; }
.logo-area { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
.logo-icon { width: 36px; height: 36px; background: #4ade80; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #0a0a0a; font-size: 16px; flex-shrink: 0; }
.marca { color: #fff; font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
.user-chip { display: flex; align-items: center; gap: 12px; background: #1a1a1a; border: 1px solid #242424; border-radius: 12px; padding: 12px 14px; }
.avatar { width: 36px; height: 36px; background: #2a2a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4ade80; font-size: 14px; flex-shrink: 0; }
.user-info { display: flex; flex-direction: column; overflow: hidden; }
.user-name { color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { color: #4ade80; font-size: 11px; margin-top: 1px; }
.nav { display: flex; flex-direction: column; gap: 4px; }
.nav-btn { width: 100%; padding: 11px 14px; background: transparent; border: none; border-radius: 10px; color: #6b6b6b; text-align: left; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 10px; transition: all 0.18s; }
.nav-btn:hover { background: #1a1a1a; color: #d1d1d1; }
.nav-btn.activo { background: #0f2a0f; color: #4ade80; font-weight: 600; }
.nav-icon { width: 16px; text-align: center; flex-shrink: 0; }
.btn-cerrar { display: flex; align-items: center; gap: 10px; padding: 11px 14px; background: transparent; border: 1px solid #2a1a1a; border-radius: 10px; color: #f87171; cursor: pointer; font-size: 14px; transition: all 0.18s; width: 100%; }
.btn-cerrar:hover { background: #1f0f0f; border-color: #f87171; }

/* CONTENIDO */
.contenido { flex: 1; padding: 36px 40px; overflow-y: auto; }
.seccion-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #1e1e1e; }
.titulo-seccion { color: #fff; font-size: 20px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 10px; }
.header-icon { color: #4ade80; }

/* FORM GRID */
.form-grid { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }

/* TARJETA */
.tarjeta { background-color: #141414; border: 1px solid #1e1e1e; border-radius: 14px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
.tarjeta-titulo { font-size: 14px; font-weight: 600; color: #4ade80; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 22px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.campo { margin-bottom: 20px; }
.campo label { display: block; color: #888; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
.input-wrap { position: relative; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; pointer-events: none; }
.origen-icon { color: #4ade80; }
.destino-icon { color: #f87171; }
.campo input { width: 100%; padding: 11px 14px 11px 38px; background-color: #1a1a1a; border: 1px solid #242424; border-radius: 9px; color: #fff; font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; box-sizing: border-box; }
.campo input:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.08); }
.campo input.input-error { border-color: #f87171; }
.campo-error { display: block; color: #f87171; font-size: 12px; margin-top: 6px; }
.campo-error-inline { display: inline-flex; align-items: center; gap: 4px; font-weight: 400; font-size: 12px; margin-left: 8px; text-transform: none; letter-spacing: 0; color: #f87171; }
.ruta-conector { display: flex; align-items: center; padding: 0 17px; margin: -8px 0; }
.conector-line { width: 2px; height: 20px; background: #2a2a2a; display: block; border-radius: 2px; }
.divider { border: none; border-top: 1px solid #1e1e1e; margin: 20px 0; }

/* CONDUCTORES */
.conductores-tarjeta { max-height: 580px; overflow-y: auto; }
.conductores-grid { display: flex; flex-direction: column; gap: 10px; }
.modal-conductores { max-height: 260px; overflow-y: auto; margin-bottom: 4px; }
.conductor-card { background: #1a1a1a; border: 1px solid #242424; border-radius: 11px; padding: 14px 16px; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; gap: 14px; position: relative; }
.conductor-card-sm { padding: 10px 12px; }
.conductor-card:hover { border-color: #3a3a3a; background: #1f1f1f; }
.conductor-card.seleccionado { border-color: #4ade80; background: #0c1f0c; }
.conductor-avatar { width: 42px; height: 42px; background: #242424; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #888; font-size: 17px; flex-shrink: 0; }
.conductor-card.seleccionado .conductor-avatar { background: #1a3a1a; color: #4ade80; }
.conductor-info { flex: 1; overflow: hidden; }
.conductor-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.conductor-row.sub { margin-top: 5px; font-size: 12px; color: #666; }
.conductor-nombre { font-weight: 600; color: #e8e8e8; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.badge-categoria { font-size: 11px; color: #4ade80; background: #0c1f0c; padding: 2px 9px; border-radius: 20px; border: 1px solid #1a3a1a; flex-shrink: 0; }
.conductor-card.seleccionado .badge-categoria { background: #143814; border-color: #4ade8060; }
.placa { background: #242424; padding: 2px 8px; border-radius: 5px; font-size: 11px; color: #888; }
.rating { color: #facc15; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; }
.check-icon { color: #4ade80; font-size: 18px; flex-shrink: 0; }

/* BOTONES */
.boton { width: 100%; padding: 13px; background-color: #4ade80; color: #0a0a0a; border: none; border-radius: 9px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background-color 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.boton:hover { background-color: #22c55e; }
.boton:active { transform: scale(0.99); }
.boton:disabled { background-color: #1e1e1e; color: #444; cursor: not-allowed; }
.boton-sm { width: auto; padding: 10px 22px; font-size: 14px; }
.btn-verde { background-color: #4ade80; color: #0a0a0a; border: none; padding: 10px 18px; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background-color 0.2s; display: inline-flex; align-items: center; gap: 8px; }
.btn-verde:hover { background-color: #22c55e; }

/* TABLA (mismo estilo que viajes.vue admin) */
.tabla-contenedor { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; background-color: #141414; border-radius: 12px; overflow: hidden; }
.tabla th { background-color: #1f1f1f; color: #4ade80; padding: 14px 16px; text-align: left; font-size: 13px; text-transform: uppercase; }
.tabla td { padding: 12px 16px; color: #fff; border-bottom: 1px solid #2a2a2a; font-size: 14px; }
.tabla tr:hover td { background-color: #1a1a1a; }

.monto { font-weight: 600; color: #4ade80; }
.placa-mini { background: #242424; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #888; margin-left: 4px; }
.badge-pendiente { font-size: 11px; color: #facc15; background: #2a2500; padding: 3px 9px; border-radius: 20px; }
.badge-metodo { background-color: #14532d; color: #4ade80; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }

.badge-estado { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-estado.pendiente  { background-color: #854d0e; color: #fef08a; }
.badge-estado.en_curso   { background-color: #1e3a8a; color: #93c5fd; }
.badge-estado.completado { background-color: #14532d; color: #4ade80; }
.badge-estado.cancelado  { background-color: #7f1d1d; color: #fca5a5; }

.btn-accion { border: none; padding: 7px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: opacity 0.2s; }
.btn-accion.eliminar { background-color: #7f1d1d; color: #fca5a5; }
.btn-accion:hover { opacity: 0.8; }

/* ESTADOS */
.estado-loading { color: #555; padding: 32px 0; font-size: 14px; display: flex; align-items: center; gap: 10px; }
.estado-vacio { color: #3a3a3a; padding: 40px 0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.estado-vacio i { font-size: 32px; }
.estado-vacio p { margin: 0; font-size: 14px; }

/* MENSAJES */
.error-general { color: #f87171; font-size: 13px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; background: #1f0808; padding: 10px 14px; border-radius: 8px; border: 1px solid #3a1010; }
.msg-exito { color: #4ade80; font-size: 13px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; background: #0a2010; padding: 10px 14px; border-radius: 8px; border: 1px solid #1a3a20; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #141414; border: 1px solid #1e1e1e; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #1e1e1e; }
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
.modal-header h3 i { color: #4ade80; }
.modal-close { background: #1a1a1a; border: 1px solid #242424; color: #888; width: 30px; height: 30px; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.modal-close:hover { background: #242424; color: #fff; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #1e1e1e; background: #111; }
.btn-cancelar-modal { padding: 10px 18px; background: transparent; border: 1px solid #2a2a2a; color: #888; border-radius: 9px; cursor: pointer; font-size: 14px; transition: all 0.15s; }
.btn-cancelar-modal:hover { border-color: #3a3a3a; color: #ccc; }

/* SCROLLBAR */
.conductores-tarjeta::-webkit-scrollbar,
.modal-conductores::-webkit-scrollbar { width: 4px; }
.conductores-tarjeta::-webkit-scrollbar-track,
.modal-conductores::-webkit-scrollbar-track { background: transparent; }
.conductores-tarjeta::-webkit-scrollbar-thumb,
.modal-conductores::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) {
    .layout { flex-direction: column; }
    .sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; padding: 16px; gap: 12px; border-right: none; border-bottom: 1px solid #1e1e1e; }
    .sidebar-top { flex-direction: row; flex-wrap: wrap; gap: 12px; width: 100%; }
    .nav { flex-direction: row; flex-wrap: wrap; }
    .btn-cerrar { width: auto; }
    .contenido { padding: 20px 16px; }
}
</style>