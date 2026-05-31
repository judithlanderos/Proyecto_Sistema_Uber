<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn-verde" @click="abrirForm">
                <i class="fas fa-plus"></i> Agregar Calificación
            </button>
        </div>

        <div class="tabla-contenedor">
            <table ref="tablaRef" class="tabla display nowrap" style="width:100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pasajero</th>
                        <th>Conductor</th>
                        <th>Dirección</th>
                        <th>Puntaje</th>
                        <th>Comentario</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="calificaciones.length === 0">
                        <td colspan="8" style="text-align:center; color:#a0a0a0;">Sin registros</td>
                    </tr>
                    <tr v-for="cal in calificaciones" :key="cal.id_calificacion">
                        <td>{{ cal.id_calificacion }}</td>
                        <td>{{ cal.pasajero }}</td>
                        <td>{{ cal.conductor }}</td>
                        <td>
                            <span :class="['badge-direccion', cal.direccion === 'usuario_a_conductor' ? 'u2c' : 'c2u']">
                                {{ cal.direccion === 'usuario_a_conductor' ? 'Usuario → Conductor' : 'Conductor → Usuario' }}
                            </span>
                        </td>
                        <td>
                            <span class="estrellas">
                                <i v-for="n in 5" :key="n"
                                   :class="['fas', 'fa-star', n <= cal.puntaje ? 'estrella-on' : 'estrella-off']"></i>
                            </span>
                        </td>
                        <td>{{ cal.comentario || '—' }}</td>
                        <td>{{ formatearFecha(cal.fecha_calificacion) }}</td>
                        <td>
                            <button class="btn-accion editar btn-editar" :data-id="cal.id_calificacion">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion eliminar btn-eliminar" :data-id="cal.id_calificacion">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- MODAL AGREGAR / EDITAR -->
        <div class="modal-fondo" v-if="modalVisible">
            <div class="modal-caja">
                <h4 style="color:#ffffff; margin-bottom:20px;">
                    {{ modoEditar ? 'Editar Calificación' : 'Agregar Calificación' }}
                </h4>

                <div class="campo" v-if="!modoEditar">
                    <label>Viaje</label>
                    <select v-model="form.id_viaje" @change="errores.id_viaje = validarSeleccion(form.id_viaje, 'un viaje')">
                        <option value="">Selecciona un viaje</option>
                        <option v-for="v in viajes" :key="v.id_viaje" :value="v.id_viaje">
                            #{{ v.id_viaje }} — {{ v.pasajero }} / {{ v.conductor }}
                        </option>
                    </select>
                    <span class="error-campo" v-if="errores.id_viaje">{{ errores.id_viaje }}</span>
                </div>

                <div class="campo" v-if="!modoEditar">
                    <label>Dirección</label>
                    <select v-model="form.direccion" @change="errores.direccion = validarSeleccion(form.direccion, 'una dirección')">
                        <option value="">Selecciona dirección</option>
                        <option value="usuario_a_conductor">Usuario → Conductor</option>
                        <option value="conductor_a_usuario">Conductor → Usuario</option>
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
                    <textarea v-model="form.comentario" rows="3" placeholder="Escribe un comentario..."
                        @input="errores.comentario = validarComentario(form.comentario)"
                        @blur="errores.comentario = validarComentario(form.comentario)"></textarea>
                    <span class="error-campo" v-if="errores.comentario">{{ errores.comentario }}</span>
                </div>

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
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/index'
import { alertaExito, alertaError, alertaConfirmar } from '../../utils/alertas'
import { validarFecha, validarSeleccion } from '../../utils/validaciones'

const tablaRef = ref(null)
let dtInstance = null

const calificaciones = ref([])
const viajes = ref([])

const modalVisible = ref(false)
const modoEditar = ref(false)
const calificacionSeleccionada = ref(null)

const form = ref({
    id_viaje: '', direccion: '', puntaje: 0,
    comentario: ''
})

const errores = ref({
    id_viaje: '', direccion: '', puntaje: '',
    comentario: ''
})

// ── Validación comentario ─────────────────────────────────────
const validarComentario = (valor) => {
    const v = (valor ?? '').trim()
    if (!v) return ''
    if (/^[\d\s]+$/.test(v)) return 'El comentario no puede ser solo números.'
    if (/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(v)) return 'El comentario no puede ser solo símbolos.'
    if (v.length > 200) return 'El comentario no puede exceder 200 caracteres.'
    return ''
}

const formularioValido = () => {
    if (!modoEditar.value) {
        errores.value.id_viaje           = validarSeleccion(form.value.id_viaje, 'un viaje')
        errores.value.direccion          = validarSeleccion(form.value.direccion, 'una dirección')
    }
    errores.value.puntaje    = form.value.puntaje < 1 ? 'Selecciona un puntaje.' : ''
    errores.value.comentario = validarComentario(form.value.comentario)
    return !Object.values(errores.value).some(e => e !== '')
}
const formatearFecha = (fecha) => {
    if (!fecha) return '—'
    const d = new Date(fecha)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ── DataTable ─────────────────────────────────────────────────
const iniciarDataTable = () => {
    dtInstance = window.$(tablaRef.value).DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
        columnDefs: [{ orderable: false, targets: 7 }],
        order: [[0, 'desc']],
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50]
    })

    window.$(tablaRef.value).on('click', '.btn-editar', function () {
        const id = parseInt(window.$(this).data('id'))
        const cal = calificaciones.value.find(c => c.id_calificacion === id)
        if (cal) abrirEditar(cal)
    })

    window.$(tablaRef.value).on('click', '.btn-eliminar', function () {
        const id = window.$(this).data('id')
        eliminar(id)
    })
}

const cargarCalificaciones = async () => {
    try {
        if (dtInstance) { dtInstance.destroy(); dtInstance = null }
        const res = await apiGet('/calificaciones/lista')
        calificaciones.value = res.data
        await nextTick()
        iniciarDataTable()
    } catch (err) {
        console.error('Error cargando calificaciones', err)
    }
}

const cargarViajes = async () => {
    try {
        const res = await apiGet('/viajes')
        viajes.value = res.data
    } catch (err) {
        console.error('Error cargando viajes', err)
    }
}

// ── Modal ─────────────────────────────────────────────────────
const resetForm = () => {
    form.value = { id_viaje: '', direccion: '', puntaje: 0, comentario: '', fecha_calificacion: '' }
    Object.keys(errores.value).forEach(k => errores.value[k] = '')
}

const abrirForm = () => {
    modoEditar.value = false
    calificacionSeleccionada.value = null
    resetForm()
    modalVisible.value = true
}

const abrirEditar = (cal) => {
    modoEditar.value = true
    calificacionSeleccionada.value = cal
    form.value = {
        id_viaje:           cal.Viaje_id_viaje      || '',
        direccion:          cal.direccion            || '',
        puntaje:            Number(cal.puntaje)      || 0,
        comentario:         cal.comentario           || '',
        fecha_calificacion: cal.fecha_calificacion   || ''
    }
    Object.keys(errores.value).forEach(k => errores.value[k] = '')
    modalVisible.value = true
}

const cerrarModal = () => {
    modalVisible.value = false
    calificacionSeleccionada.value = null
    resetForm()
}

// ── CRUD ──────────────────────────────────────────────────────
const guardar = async () => {
    if (!formularioValido()) return
    try {
        if (modoEditar.value) {
            await apiPut(`/calificaciones/${calificacionSeleccionada.value.id_calificacion}`, {
                puntaje:    form.value.puntaje,
                comentario: form.value.comentario
            })
            alertaExito('Calificación actualizada correctamente')
        } else {
            await apiPost('/calificaciones/crear', {
                id_viaje:            form.value.id_viaje,
                direccion:           form.value.direccion,
                puntaje:             form.value.puntaje,
                comentario:          form.value.comentario,
            })
            alertaExito('Calificación agregada correctamente')
        }
        await cargarCalificaciones()
        cerrarModal()
    } catch (err) {
        alertaError(err.response?.data?.error || 'Error al guardar')
    }
}

const eliminar = async (id) => {
    const resultado = await alertaConfirmar('¿Seguro que deseas eliminar esta calificación?')
    if (!resultado.isConfirmed) return
    try {
        await apiDelete(`/calificaciones/${id}`)
        await cargarCalificaciones()
        alertaExito('Calificación eliminada correctamente')
    } catch (err) {
        alertaError('Error al eliminar calificación')
    }
}

onMounted(async () => {
    await cargarCalificaciones()
    await cargarViajes()
})

onBeforeUnmount(() => {
    if (dtInstance) { dtInstance.destroy(); dtInstance = null }
})
</script>

<style scoped>
.tabla-contenedor { overflow-x: auto; }

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

.tabla tr:hover td { background-color: #1a1a1a; }

:deep(.dataTables_wrapper) { color: #ffffff; font-size: 14px; }
:deep(.dataTables_length label), :deep(.dataTables_filter label) { color: #a0a0a0; }
:deep(.dataTables_length select), :deep(.dataTables_filter input) {
    background-color: #1f1f1f;
    border: 1px solid #2a2a2a;
    color: #ffffff;
    border-radius: 6px;
    padding: 5px 10px;
    outline: none;
}
:deep(.dataTables_filter input:focus) { border-color: #4ade80; }
:deep(.dataTables_info) { color: #a0a0a0; font-size: 13px; }
:deep(.dataTables_paginate .paginate_button) {
    background-color: #1f1f1f !important;
    border: 1px solid #2a2a2a !important;
    color: #a0a0a0 !important;
    border-radius: 6px;
    margin: 2px;
    padding: 5px 10px;
    cursor: pointer;
}
:deep(.dataTables_paginate .paginate_button:hover) {
    background-color: #2a2a2a !important;
    color: #ffffff !important;
    border-color: #4ade80 !important;
}
:deep(.dataTables_paginate .paginate_button.current) {
    background-color: #4ade80 !important;
    color: #0a0a0a !important;
    border-color: #4ade80 !important;
    font-weight: 700;
}
:deep(.dataTables_paginate .paginate_button.disabled) { opacity: 0.3 !important; }
:deep(table.dataTable thead th.sorting),
:deep(table.dataTable thead th.sorting_asc),
:deep(table.dataTable thead th.sorting_desc) { background-color: #1f1f1f; color: #4ade80; }

.badge-direccion {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}
.badge-direccion.u2c { background-color: #1e3a8a; color: #93c5fd; }
.badge-direccion.c2u { background-color: #3b1f6e; color: #c4b5fd; }

.estrellas { display: flex; gap: 2px; }
.estrella-on  { color: #facc15; font-size: 13px; }
.estrella-off { color: #3a3a3a; font-size: 13px; }

.estrellas-input { display: flex; align-items: center; gap: 6px; padding: 8px 0; }
.estrella-click { font-size: 22px; cursor: pointer; transition: transform 0.15s; }
.estrella-click:hover { transform: scale(1.2); }
.puntaje-texto { color: #a0a0a0; font-size: 13px; margin-left: 6px; }

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

.btn-accion { border: none; padding: 7px 10px; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 13px; transition: opacity 0.2s; }
.btn-accion.editar   { background-color: #1e3a8a; color: #93c5fd; }
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

.campo input,
.campo select,
.campo textarea {
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
    resize: vertical;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus { border-color: #4ade80; }
.campo select option { background-color: #1f1f1f; }

.error-campo { color: #f87171; font-size: 12px; margin-top: 4px; display: block; }

.modal-botones { display: flex; gap: 10px; margin-top: 20px; }

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

@media (max-width: 768px) {
    .tabla th, .tabla td { padding: 10px 8px; font-size: 12px; }
    .modal-caja { padding: 20px 16px; }
}
</style>