<template>
    <div class="layout">
        <!-- SIDEBAR -->
        <div class="sidebar">
            <h1 class="marca">SistemaUber</h1>
            <p class="bienvenida">Hola, {{ usuario?.nombre }} {{ usuario?.primer_ap }}</p>
            <nav class="nav">
                <button :class="['nav-btn', seccion === 'solicitar' && 'activo']" @click="seccion = 'solicitar'">
                    🚗 Solicitar Viaje
                </button>
                <button :class="['nav-btn', seccion === 'viajes' && 'activo']" @click="cambiarSeccion('viajes')">
                    📋 Mis Viajes
                </button>
                <button :class="['nav-btn', seccion === 'pagos' && 'activo']" @click="cambiarSeccion('pagos')">
                    💳 Mis Pagos
                </button>
            </nav>
            <button class="btn-cerrar" @click="cerrarSesion">Cerrar Sesión</button>
        </div>

        <!-- CONTENIDO -->
        <div class="contenido">

            <!-- SOLICITAR VIAJE -->
            <div v-if="seccion === 'solicitar'">
                <h2 class="titulo-seccion">Solicitar Viaje</h2>
                <div class="tarjeta">
                    <div class="campo">
                        <label>Origen</label>
                        <input v-model="form.origen" type="text" placeholder="¿Desde dónde?" />
                    </div>
                    <div class="campo">
                        <label>Destino</label>
                        <input v-model="form.destino" type="text" placeholder="¿A dónde vas?" />
                    </div>

                    <div class="campo">
                        <label>Selecciona un conductor</label>
                        <div v-if="cargandoConductores" class="estado-texto">Cargando conductores...</div>
                        <div v-else-if="conductores.length === 0" class="estado-texto">No hay conductores disponibles.</div>
                        <div v-else class="lista-conductores">
                            <div
                                v-for="c in conductores"
                                :key="c.id_vehiculo"
                                :class="['conductor-card', form.id_conductor === c.id_conductor && form.id_vehiculo === c.id_vehiculo ? 'seleccionado' : '']"
                                @click="seleccionarConductor(c)"
                            >
                                <div class="card-fila">
                                    <span class="conductor-nombre">{{ c.nombre }}</span>
                                    <span class="badge-categoria">{{ c.categoria }}</span>
                                </div>
                                <div class="card-fila secundaria">
                                    <span>🚘 {{ c.marca }} {{ c.modelo }} · {{ c.placa }}</span>
                                    <span>⭐ {{ c.calificacion_prom ?? 'Sin calificación' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p v-if="errorSolicitud" class="error-general">{{ errorSolicitud }}</p>
                    <p v-if="exitoSolicitud" class="msg-exito">{{ exitoSolicitud }}</p>

                    <button class="boton" @click="solicitarViaje" :disabled="cargandoSolicitud">
                        {{ cargandoSolicitud ? 'Solicitando...' : 'Solicitar Viaje' }}
                    </button>
                </div>
            </div>

            <!-- MIS VIAJES -->
            <div v-if="seccion === 'viajes'">
                <h2 class="titulo-seccion">Mis Viajes</h2>
                <div v-if="cargandoViajes" class="estado-texto">Cargando...</div>
                <div v-else-if="viajes.length === 0" class="estado-texto">No tienes viajes registrados.</div>
                <div v-else class="tabla-wrapper">
                    <table class="tabla">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Estado</th>
                                <th>Conductor</th>
                                <th>Vehículo</th>
                                <th>Calif.</th>
                                <th>Monto</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="v in viajes" :key="v.id_viaje">
                                <td>{{ v.id_viaje }}</td>
                                <td>{{ v.origen }}</td>
                                <td>{{ v.destino }}</td>
                                <td><span :class="['badge-estado', v.estado]">{{ v.estado }}</span></td>
                                <td>{{ v.conductor }}</td>
                                <td>{{ v.marca }} {{ v.modelo }} ({{ v.placa }})</td>
                                <td>{{ v.calificacion_prom ?? '—' }}</td>
                                <td>${{ v.monto_cobrado }}</td>
                                <td>
                                    <button v-if="v.estado === 'pendiente'" class="btn-cancelar" @click="cancelarViaje(v.id_viaje)">
                                        Cancelar
                                    </button>
                                    <span v-else class="sin-accion">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- MIS PAGOS -->
            <div v-if="seccion === 'pagos'">
                <h2 class="titulo-seccion">Mis Pagos</h2>
                <div v-if="cargandoPagos" class="estado-texto">Cargando...</div>
                <div v-else-if="pagos.length === 0" class="estado-texto">No tienes pagos registrados.</div>
                <div v-else class="tabla-wrapper">
                    <table class="tabla">
                        <thead>
                            <tr>
                                <th>#</th>
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
                                <td>{{ p.origen }}</td>
                                <td>{{ p.destino }}</td>
                                <td>{{ p.metodo }}</td>
                                <td>${{ p.monto }}</td>
                                <td>{{ p.fecha_pago?.slice(0, 10) }}</td>
                            </tr>
                        </tbody>
                    </table>
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

// ── CONDUCTORES ──────────────────────────────────────────
const conductores = ref([])
const cargandoConductores = ref(false)

const cargarConductores = async () => {
    cargandoConductores.value = true
    try {
        const res = await axios.get('/api/pasajero/conductores', { headers })
        conductores.value = res.data
    } catch {
        conductores.value = []
    } finally {
        cargandoConductores.value = false
    }
}

// ── SOLICITAR VIAJE ──────────────────────────────────────
const form = ref({ origen: '', destino: '', id_conductor: null, id_vehiculo: null })
const cargandoSolicitud = ref(false)
const errorSolicitud = ref('')
const exitoSolicitud = ref('')

const seleccionarConductor = (c) => {
    form.value.id_conductor = c.id_conductor
    form.value.id_vehiculo = c.id_vehiculo
}

const solicitarViaje = async () => {
    errorSolicitud.value = ''
    exitoSolicitud.value = ''
    if (!form.value.origen || !form.value.destino)
        return errorSolicitud.value = 'Ingresa origen y destino'
    if (!form.value.id_conductor)
        return errorSolicitud.value = 'Selecciona un conductor'
    cargandoSolicitud.value = true
    try {
        await axios.post('/api/pasajero/viajes', form.value, { headers })
        exitoSolicitud.value = '¡Viaje solicitado correctamente!'
        form.value = { origen: '', destino: '', id_conductor: null, id_vehiculo: null }
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
    } catch {
        viajes.value = []
    } finally {
        cargandoViajes.value = false
    }
}

const cancelarViaje = async (id) => {
    if (!confirm('¿Cancelar este viaje?')) return
    try {
        await axios.put(`/api/pasajero/viajes/${id}/cancelar`, {}, { headers })
        cargarViajes()
    } catch (err) {
        alert(err.response?.data?.error || 'No se pudo cancelar')
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
/* ── LAYOUT ─────────────────────────────────────────── */
.layout {
    display: flex;
    min-height: 100vh;
    background-color: #0a0a0a;
    color: #ffffff;
    font-family: inherit;
}

/* ── SIDEBAR ─────────────────────────────────────────── */
.sidebar {
    width: 230px;
    background-color: #141414;
    border-right: 1px solid #2a2a2a;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
}

.marca {
    color: #4ade80;
    font-size: 22px;
    margin-bottom: 4px;
}

.bienvenida {
    color: #a0a0a0;
    font-size: 13px;
    margin-bottom: 24px;
}

.nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.nav-btn {
    width: 100%;
    padding: 11px 14px;
    background: transparent;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #a0a0a0;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}
.nav-btn:hover { border-color: #4ade80; color: #ffffff; }
.nav-btn.activo {
    background-color: #4ade80;
    color: #0a0a0a;
    border-color: #4ade80;
    font-weight: 600;
}

.btn-cerrar {
    margin-top: auto;
    padding: 10px;
    background: transparent;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #f87171;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
}
.btn-cerrar:hover { background: #1f1f1f; }

/* ── CONTENIDO ───────────────────────────────────────── */
.contenido {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
}

.titulo-seccion {
    color: #ffffff;
    font-size: 20px;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #2a2a2a;
    font-weight: 500;
}

/* ── TARJETA FORMULARIO (misma que login) ────────────── */
.tarjeta {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 32px;
    max-width: 520px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
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
.campo input:focus { border-color: #4ade80; }

/* ── CONDUCTORES ─────────────────────────────────────── */
.lista-conductores {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.conductor-card {
    background: #1f1f1f;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.2s;
}
.conductor-card:hover { border-color: #4ade80; }
.conductor-card.seleccionado {
    border-color: #4ade80;
    background-color: #0f2a0f;
}

.card-fila {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card-fila.secundaria {
    margin-top: 6px;
    font-size: 13px;
    color: #a0a0a0;
}

.conductor-nombre { font-weight: 600; color: #ffffff; font-size: 15px; }

.badge-categoria {
    font-size: 11px;
    color: #4ade80;
    background: #0f2a0f;
    padding: 2px 10px;
    border-radius: 20px;
    border: 1px solid #4ade8040;
}

/* ── BOTON (igual que login) ─────────────────────────── */
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

/* ── TABLA ───────────────────────────────────────────── */
.tabla-wrapper { overflow-x: auto; }

.tabla {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.tabla th {
    background: #141414;
    color: #a0a0a0;
    padding: 12px 14px;
    text-align: left;
    font-weight: 500;
    border-bottom: 1px solid #2a2a2a;
}

.tabla td {
    padding: 12px 14px;
    border-bottom: 1px solid #1a1a1a;
    color: #e0e0e0;
}

.tabla tr:hover td { background-color: #141414; }

/* ── BADGES ESTADO ───────────────────────────────────── */
.badge-estado {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}
.badge-estado.pendiente   { background: #2a2500; color: #facc15; }
.badge-estado.en\ curso   { background: #001a2a; color: #38bdf8; }
.badge-estado.completado  { background: #0a2a0a; color: #4ade80; }
.badge-estado.cancelado   { background: #2a0a0a; color: #f87171; }

/* ── MISC ────────────────────────────────────────────── */
.btn-cancelar {
    padding: 5px 12px;
    background: transparent;
    border: 1px solid #f87171;
    color: #f87171;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.2s;
}
.btn-cancelar:hover { background: #2a0a0a; }

.sin-accion { color: #3a3a3a; }

.error-general {
    color: #f87171;
    font-size: 13px;
    text-align: center;
    margin-bottom: 10px;
}

.msg-exito {
    color: #4ade80;
    font-size: 13px;
    text-align: center;
    margin-bottom: 10px;
}

.estado-texto {
    color: #a0a0a0;
    padding: 20px 0;
    font-size: 14px;
}

/* ── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 640px) {
    .layout { flex-direction: column; }
    .sidebar { width: 100%; border-right: none; border-bottom: 1px solid #2a2a2a; padding: 20px; }
    .contenido { padding: 20px 16px; }
}
</style>