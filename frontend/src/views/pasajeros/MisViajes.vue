<template>
    <div>
        <div class="tabla-contenedor">
            <table ref="tablaRef" class="tabla display nowrap" style="width:100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Conductor</th>
                        <th>Vehiculo</th>
                        <th>Estado</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="viajes.length === 0">
                        <td colspan="8" style="text-align:center; color:#a0a0a0;">Sin viajes registrados</td>
                    </tr>
                    <tr v-for="v in viajes" :key="v.id_viaje">
                        <td>{{ v.id_viaje }}</td>
                        <td>{{ v.origen }}</td>
                        <td>{{ v.destino }}</td>
                        <td>{{ v.conductor }}<br><small style="color:#a0a0a0;">Lic: {{ v.num_licencia }}</small></td>
                        <td>{{ v.placa }} — {{ v.marca }} {{ v.modelo }}<br><small style="color:#a0a0a0;">{{ v.categoria }}</small></td>
                        <td><span :class="['badge-estado', v.estado]">{{ v.estado }}</span></td>
                        <td>{{ v.monto_cobrado ? '$' + v.monto_cobrado : '—' }}</td>
                        <td>{{formatearFecha(v.fecha_salida) }}</td>
                        <td>
                            <button v-if="v.estado === 'completado'" class="btn-accion btn-calificar" :data-id="v.id_viaje">
                                <i class="fas fa-star"></i>
                            </button>
                            <button v-if="v.estado === 'completado'" class="btn-accion btn-ver-cal" :data-id="v.id_viaje">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button v-if="v.estado === 'pendiente'" class="btn-accion btn-eliminar" :data-id="v.id_viaje">
                                <i class="fas fa-times"></i>
                            </button>
                        </td>
            
                    </tr>
                </tbody>
            </table>
            <div class="modal-fondo" v-if="modalVisible">
                    <div class="modal-caja">
                        <h4 style="color:#ffffff; margin-bottom:20px;">Calificar Viaje #{{ viajeSeleccionado }}</h4>

                        <div class="campo">
                            <label>Dirección</label>
                            <select v-model="form.direccion">
                                <option value="">Selecciona dirección</option>
                                <option value="usuario_a_conductor">Usuario → Conductor</option>
                            </select>
                            <span class="error-campo" v-if="errores.direccion">{{ errores.direccion }}</span>
                        </div>

                        <div class="campo">
                            <label>Puntaje</label>
                            <div class="estrellas-input">
                                <i v-for="n in 5" :key="n"
                                :class="['fas', 'fa-star', 'estrella-click', n <= form.puntaje ? 'estrella-on' : 'estrella-off']"
                                @click="form.puntaje = n; errores.puntaje = ''"></i>
                                <span class="puntaje-texto">{{ form.puntaje ? form.puntaje + ' / 5' : 'Sin seleccionar' }}</span>
                            </div>
                            <span class="error-campo" v-if="errores.puntaje">{{ errores.puntaje }}</span>
                        </div>

                        <div class="campo">
                            <label>Comentario <span style="color:#a0a0a0;">(opcional)</span></label>
                            <textarea v-model="form.comentario" rows="3" placeholder="Escribe un comentario..."></textarea>
                        </div>

                        <div class="modal-botones">
                            <button class="btn-verde" @click="guardar">Guardar</button>
                            <button class="btn-cancelar" @click="modalVisible = false">Cancelar</button>
                        </div>
                    </div>
                </div>
                <div class="modal-fondo" v-if="modalDetalle">
                <div class="modal-caja">
                    <h4 style="color:#4ade80; margin-bottom:20px;">Calificación recibida</h4>
                    <div v-if="calificacionRecibida">
                        <div class="detalle-item"><span class="detalle-label">Puntaje</span>
                            <span>
                                <i v-for="n in 5" :key="n" :class="['fas','fa-star', n <= calificacionRecibida.puntaje ? 'estrella-on' : 'estrella-off']"></i>
                                {{ calificacionRecibida.puntaje }}/5
                            </span>
                        </div>
                        <div class="detalle-item" style="margin-top:12px;"><span class="detalle-label">Comentario</span>
                            <span>{{ calificacionRecibida.comentario || '—' }}</span>
                        </div>
                        <div class="detalle-item" style="margin-top:12px;"><span class="detalle-label">Fecha</span>
                            <span>{{ calificacionRecibida.fecha_calificacion }}</span>
                        </div>
                    </div>
                    <p v-else style="color:#a0a0a0;">El conductor aún no te ha calificado.</p>
                    <div class="modal-botones">
                        <button class="btn-cancelar" @click="modalDetalle = false">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { apiGet, apiPost, apiPut } from '../../api/index'
import { alertaExito, alertaError, alertaConfirmar } from '../../utils/alertas'

const modalVisible = ref(false)
const viajeSeleccionado = ref(null)
const form = ref({ direccion: 'usuario_a_conductor', puntaje: 0, comentario: '' })
const errores = ref({ direccion: '', puntaje: '' })

const abrirCalificar = (id) => {
    viajeSeleccionado.value = id
    form.value = { direccion: 'usuario_a_conductor', puntaje: 0, comentario: '' }
    errores.value = { direccion: '', puntaje: '' }
    modalVisible.value = true
}

const guardar = async () => {
    errores.value.puntaje = form.value.puntaje < 1 ? 'Selecciona un puntaje.' : ''
    if (Object.values(errores.value).some(e => e !== '')) return
    try {
        const hoy = new Date().toISOString().slice(0, 10)
        await apiPost('/calificaciones/crear', {
            id_viaje: viajeSeleccionado.value,
            direccion: form.value.direccion,
            puntaje: form.value.puntaje,
            comentario: form.value.comentario,
            fecha_calificacion: hoy
        })
        alertaExito('Calificación guardada correctamente')
        modalVisible.value = false
    } catch (err) {
        alertaError(err.response?.data?.error || 'Error al guardar')
    }
}
const formatearFecha = (fecha) => {
    if (!fecha) return '—'
    const d = new Date(fecha)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
}
const modalDetalle = ref(false)
const calificacionRecibida = ref(null)

const verCalificacion = async (id_viaje) => {
    try {
        const res = await apiGet(`/calificaciones/viaje/${id_viaje}/conductor-a-usuario`)
        calificacionRecibida.value = res.data
    } catch {
        calificacionRecibida.value = null
    }
    modalDetalle.value = true
}

const tablaRef = ref(null)
let dtInstance = null
const viajes = ref([])

const iniciarDataTable = () => {
    if (dtInstance) { dtInstance.destroy(); dtInstance = null }
    dtInstance = window.$(tablaRef.value).DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
        order: [[0, 'desc']],
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25]
    })
    window.$(tablaRef.value).on('click', '.btn-calificar', function () {
    const id = Number(window.$(this).data('id'))
    abrirCalificar(id)
})
    window.$(tablaRef.value).on('click', '.btn-ver-cal', function () {
    const id = Number(window.$(this).data('id'))
    verCalificacion(id)
})
window.$(tablaRef.value).on('click', '.btn-eliminar', function () {
    const id = Number(window.$(this).data('id'))
    eliminar(id)
})
}
const eliminar = async (id) => {
    const resultado = await alertaConfirmar('¿Seguro que deseas cancelar este viaje?')
    if (!resultado.isConfirmed) return
    try {
        const viaje = viajes.value.find(v => v.id_viaje === id)
        await apiPut(`/viajes/${id}`, {
            origen: viaje.origen,
            destino: viaje.destino,
            estado: 'cancelado',
            monto_cobrado: viaje.monto_cobrado || '',
            distancia_km: viaje.distancia_km || null
        })
        await cargar()
        alertaExito('Viaje cancelado correctamente')
    } catch {
        alertaError('Error al cancelar viaje')
    }
}
const cargar = async () => {
    try {
        if (dtInstance) { dtInstance.destroy(); dtInstance = null }
        const res = await apiGet('/pasajero/viajes')
        viajes.value = res.data
        await nextTick()
        iniciarDataTable()
    } catch (err) { console.error('Error cargando viajes', err) }
}

onMounted(cargar)
onBeforeUnmount(() => { if (dtInstance) { dtInstance.destroy(); dtInstance = null } })
</script>

<style scoped>
.tabla-contenedor { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; background-color: #141414; border-radius: 12px; overflow: hidden; }
.tabla th { background-color: #1f1f1f; color: #4ade80; padding: 14px 16px; text-align: left; font-size: 13px; text-transform: uppercase; }
.tabla td { padding: 12px 16px; color: #ffffff; border-bottom: 1px solid #2a2a2a; font-size: 14px; }
.tabla tr:hover td { background-color: #1a1a1a; }
.badge-estado { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-estado.pendiente  { background-color: #854d0e; color: #fef08a; }
.badge-estado.en_curso   { background-color: #1e3a8a; color: #93c5fd; }
.badge-estado.completado { background-color: #14532d; color: #4ade80; }
.badge-estado.cancelado  { background-color: #7f1d1d; color: #fca5a5; }
:deep(.dataTables_wrapper) { color: #ffffff; font-size: 14px; }
:deep(.dataTables_length label), :deep(.dataTables_filter label) { color: #a0a0a0; }
:deep(.dataTables_length select), :deep(.dataTables_filter input) { background-color: #1f1f1f; border: 1px solid #2a2a2a; color: #ffffff; border-radius: 6px; padding: 5px 10px; outline: none; }
:deep(.dataTables_filter input:focus) { border-color: #4ade80; }
:deep(.dataTables_info) { color: #a0a0a0; font-size: 13px; }
:deep(.dataTables_paginate .paginate_button) { background-color: #1f1f1f !important; border: 1px solid #2a2a2a !important; color: #a0a0a0 !important; border-radius: 6px; margin: 2px; padding: 5px 10px; cursor: pointer; }
:deep(.dataTables_paginate .paginate_button:hover) { background-color: #2a2a2a !important; color: #ffffff !important; border-color: #4ade80 !important; }
:deep(.dataTables_paginate .paginate_button.current) { background-color: #4ade80 !important; color: #0a0a0a !important; border-color: #4ade80 !important; font-weight: 700; }
:deep(table.dataTable thead th.sorting), :deep(table.dataTable thead th.sorting_asc), :deep(table.dataTable thead th.sorting_desc) { background-color: #1f1f1f; color: #4ade80; }
.btn-accion { border: none; padding: 7px 10px; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 13px; transition: opacity 0.2s; }
.btn-calificar { background-color: #854d0e; color: #fef08a; }
.btn-accion:hover { opacity: 0.8; }
.modal-fondo { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-caja { background-color: #141414; border: 1px solid #2a2a2a; border-radius: 12px; padding: 32px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.campo { margin-bottom: 16px; }
.campo label { display: block; color: #a0a0a0; font-size: 13px; margin-bottom: 6px; }
.campo select, .campo textarea { width: 100%; padding: 10px 14px; background-color: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 8px; color: #ffffff; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical; }
.campo select:focus, .campo textarea:focus { border-color: #4ade80; }
.campo select option { background-color: #1f1f1f; }
.error-campo { color: #f87171; font-size: 12px; margin-top: 4px; display: block; }
.modal-botones { display: flex; gap: 10px; margin-top: 20px; }
.btn-verde { background-color: #4ade80; color: #0a0a0a; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-verde:hover { background-color: #22c55e; }
.btn-cancelar { background-color: #1f1f1f; border: 1px solid #2a2a2a; color: #a0a0a0; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }
.btn-cancelar:hover { background-color: #2a2a2a; color: #ffffff; }
.estrellas-input { display: flex; align-items: center; gap: 6px; padding: 8px 0; }
.estrella-click { font-size: 22px; cursor: pointer; transition: transform 0.15s; }
.estrella-click:hover { transform: scale(1.2); }
.estrella-on { color: #facc15; }
.estrella-off { color: #3a3a3a; }
.puntaje-texto { color: #a0a0a0; font-size: 13px; }
.btn-ver-cal { background-color: #14532d; color: #4ade80; }
.detalle-item { display: flex; flex-direction: column; gap: 4px; }
.detalle-label { color: #a0a0a0; font-size: 12px; text-transform: uppercase; }
.btn-eliminar { background-color: #7f1d1d; color: #fca5a5; }
</style>