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
                        <td>{{ v.fecha_salida }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { apiGet } from '../../api/index'

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
</style>