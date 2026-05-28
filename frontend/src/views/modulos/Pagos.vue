<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn-verde" @click="abrirAgregar">
                <i class="fas fa-plus"></i> Agregar Pago
            </button>
        </div>

        <div class="tabla-contenedor">
            <table ref="tablaRef" class="tabla display nowrap" style="width:100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pasajero</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Metodo</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="pagos.length === 0">
                        <td colspan="8" style="text-align:center; color:#a0a0a0;">Sin registros</td>
                    </tr>
                    <tr v-for="p in pagos" :key="p.id_pago">
                        <td>{{ p.id_pago }}</td>
                        <td>{{ p.pasajero }}</td>
                        <td>{{ p.origen }}</td>
                        <td>{{ p.destino }}</td>
                        <td><span class="badge-metodo">{{ p.metodo_tipo }}</span></td>
                        <td>${{ p.monto }}</td>
                        <td>{{ p.fecha_transaccion }}</td>
                        <td>
                            <button class="btn-accion editar btn-editar" :data-id="p.id_pago">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion eliminar btn-eliminar" :data-id="p.id_pago">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <PagoModal
            v-if="modalVisible"
            :pago="pagoSeleccionado"
            @cerrar="modalVisible = false"
            @guardado="cargar"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import PagoModal from '../../components/pagos/PagoModal.vue'
import { getPagos, eliminarPago } from '../../services/pagoService'
import { alertaExito, alertaError, alertaConfirmar } from '../../utils/alertas'

const tablaRef = ref(null)
let dtInstance = null
const pagos = ref([])
const modalVisible = ref(false)
const pagoSeleccionado = ref(null)

const iniciarDataTable = () => {
    if (dtInstance) { dtInstance.destroy(); dtInstance = null }
    dtInstance = window.$(tablaRef.value).DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
        columnDefs: [{ orderable: false, targets: 7 }],
        order: [[0, 'asc']],
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50]
    })

    window.$(tablaRef.value).on('click', '.btn-editar', function () {
        const id = Number(window.$(this).data('id'))
        const pago = pagos.value.find(p => p.id_pago === id)
        if (pago) { pagoSeleccionado.value = pago; modalVisible.value = true }
    })

    window.$(tablaRef.value).on('click', '.btn-eliminar', function () {
        const id = Number(window.$(this).data('id'))
        eliminar(id)
    })
}

const cargar = async () => {
    try {
        if (dtInstance) { dtInstance.destroy(); dtInstance = null }
        const res = await getPagos()
        pagos.value = res.data
        await nextTick()
        iniciarDataTable()
    } catch (err) { console.error('Error cargando pagos', err) }
}

const abrirAgregar = () => { pagoSeleccionado.value = null; modalVisible.value = true }

const eliminar = async (id) => {
    const resultado = await alertaConfirmar('Seguro que deseas eliminar este pago?')
    if (!resultado.isConfirmed) return
    try {
        await eliminarPago(id)
        await cargar()
        alertaExito('Pago eliminado correctamente')
    } catch { alertaError('Error al eliminar pago') }
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
.badge-metodo { background-color: #14532d; color: #4ade80; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
:deep(.dataTables_wrapper) { color: #ffffff; font-size: 14px; }
:deep(.dataTables_length label), :deep(.dataTables_filter label) { color: #a0a0a0; }
:deep(.dataTables_length select), :deep(.dataTables_filter input) { background-color: #1f1f1f; border: 1px solid #2a2a2a; color: #ffffff; border-radius: 6px; padding: 5px 10px; outline: none; }
:deep(.dataTables_filter input:focus) { border-color: #4ade80; }
:deep(.dataTables_info) { color: #a0a0a0; font-size: 13px; }
:deep(.dataTables_paginate .paginate_button) { background-color: #1f1f1f !important; border: 1px solid #2a2a2a !important; color: #a0a0a0 !important; border-radius: 6px; margin: 2px; padding: 5px 10px; cursor: pointer; }
:deep(.dataTables_paginate .paginate_button:hover) { background-color: #2a2a2a !important; color: #ffffff !important; border-color: #4ade80 !important; }
:deep(.dataTables_paginate .paginate_button.current) { background-color: #4ade80 !important; color: #0a0a0a !important; border-color: #4ade80 !important; font-weight: 700; }
:deep(table.dataTable thead th.sorting), :deep(table.dataTable thead th.sorting_asc), :deep(table.dataTable thead th.sorting_desc) { background-color: #1f1f1f; color: #4ade80; }
.btn-verde { background-color: #4ade80; color: #0a0a0a; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-verde:hover { background-color: #22c55e; }
.btn-accion { border: none; padding: 7px 10px; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 13px; transition: opacity 0.2s; }
.btn-accion.editar { background-color: #1e3a8a; color: #93c5fd; }
.btn-accion.eliminar { background-color: #7f1d1d; color: #fca5a5; }
.btn-accion:hover { opacity: 0.8; }
@media (max-width: 768px) { .tabla th, .tabla td { padding: 10px 8px; font-size: 12px; } }
</style>