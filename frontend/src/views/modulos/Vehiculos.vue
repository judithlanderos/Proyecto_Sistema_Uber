<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn-verde" @click="abrirAgregar">
                <i class="fas fa-plus"></i> Agregar Vehículo
            </button>
        </div>

        <div class="tabla-contenedor">
            <table ref="tablaRef" class="tabla display nowrap" style="width:100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Placa</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Año</th>
                        <th>Categoría</th>
                        <th>Conductor</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="vehiculos.length === 0">
                        <td colspan="9" style="text-align:center; color:#a0a0a0;">Sin registros</td>
                    </tr>
                    <tr v-for="v in vehiculos" :key="v.id_vehiculo">
                        <td>{{ v.id_vehiculo }}</td>
                        <td>{{ v.placa }}</td>
                        <td>{{ v.marca }}</td>
                        <td>{{ v.modelo }}</td>
                        <td>{{ v.anio }}</td>
                        <td><span class="badge-cat">{{ v.categoria }}</span></td>
                        <td>{{ v.conductor_nombre || 'Sin asignar' }}</td>
                        <td>
                            <span :class="v.activo ? 'badge-activo' : 'badge-inactivo'">
                                {{ v.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td>
                            <button class="btn-accion ver btn-ver" :data-id="v.id_vehiculo">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-accion editar btn-editar" :data-id="v.id_vehiculo">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion eliminar btn-eliminar" :data-id="v.id_vehiculo">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <VehiculoModal
            v-if="modalVisible"
            :tipo="tipoModal"
            :vehiculo="vehiculoSeleccionado"
            :detalle="detalle"
            @cerrar="modalVisible = false"
            @guardado="cargar"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount  } from 'vue'
import VehiculoModal from '../../components/vehiculos/VehiculoModal.vue'
import { getVehiculos, getVehiculoDetalle, eliminarVehiculo } from '../../services/vehiculosService'
import { alertaExito, alertaError, alertaConfirmar } from '../../utils/alertas'

const tablaRef        = ref(null)
let   dtInstance      = null
const vehiculos = ref([])
const modalVisible = ref(false)
const vehiculoSeleccionado = ref(null)
const tipoModal       = ref('form')  
const detalle         = ref(null)

const iniciarDataTable = () => {
    dtInstance = window.$(tablaRef.value).DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
        columnDefs: [{ orderable: false, targets: 8 }],
        order: [[0, 'asc']],
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50]
    })

    window.$(tablaRef.value).on('click', '.btn-ver', function () {
        const id = Number(window.$(this).data('id'))
        abrirDetalle(id)
    })

    window.$(tablaRef.value).on('click', '.btn-editar', function () {
        const id = Number(window.$(this).data('id'))
        const v = vehiculos.value.find(x => x.id_vehiculo === id)
        if (v) abrirEditar(v)
    })

    window.$(tablaRef.value).on('click', '.btn-eliminar', function () {
        const id = Number(window.$(this).data('id'))
        eliminar(id)
    })
}

const cargar = async () => {
    try {
        if (dtInstance) { dtInstance.destroy(); dtInstance = null }
        const res = await getVehiculos()
        vehiculos.value = res.data
        await nextTick()
        iniciarDataTable()
    } catch (err) {
        console.error('Error cargando vehículos', err)
    }
}

const abrirAgregar = () => {
    vehiculoSeleccionado.value = null
    tipoModal.value = 'form'
    modalVisible.value = true
}

const abrirEditar = (v) => {
    vehiculoSeleccionado.value = v
    tipoModal.value = 'form'
    modalVisible.value = true
}
const abrirDetalle = async (id) => {
    try {
        const res = await getVehiculoDetalle(id)
        detalle.value = res.data
        tipoModal.value = 'detalle'
        modalVisible.value = true
    } catch {
        alertaError('Error al cargar detalle del vehículo')
    }
}

const cerrarModal = () => {
    modalVisible.value = false
    vehiculoSeleccionado.value = null
    detalle.value = null
}

const eliminar = async (id) => {
    const resultado = await alertaConfirmar('¿Seguro que deseas eliminar este vehículo?')
    if (!resultado.isConfirmed) return
    try {
        await eliminarVehiculo(id)
        await cargar()
        alertaExito('Vehículo eliminado correctamente')
    } catch {
        alertaError('Error al eliminar vehículo')
    }
}

onMounted(cargar)
onBeforeUnmount(() => { if (dtInstance) { dtInstance.destroy(); dtInstance = null } })

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


.badge-cat {
    background-color: #1e3a5f;
    color: #93c5fd;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}
.badge-activo {
    background-color: #14532d;
    color: #4ade80;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}
.badge-inactivo {
    background-color: #3b1f1f;
    color: #f87171;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
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
.btn-accion {
    border: none;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 6px;
    font-size: 13px;
    transition: opacity 0.2s;
}
.btn-accion.ver      { background-color: #14532d; color: #4ade80; }
.btn-accion.editar { background-color: #1e3a8a; color: #93c5fd; }
.btn-accion.eliminar { background-color: #7f1d1d; color: #fca5a5; }
.btn-accion:hover { opacity: 0.8; }
@media (max-width: 768px) {
    .tabla th, .tabla td { padding: 10px 8px; font-size: 12px; }
}
</style>