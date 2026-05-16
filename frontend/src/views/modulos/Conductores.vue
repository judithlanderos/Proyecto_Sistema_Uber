<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 style="color: #ffffff;">Lista de Conductores</h4>
            <button class="btn-verde" @click="abrirAgregar">
                <i class="fas fa-plus"></i> Agregar Conductor
            </button>
        </div>

        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Telefono</th>
                        <th>Licencia</th>
                        <th>Calificacion</th>
                        <th>Vehiculo Activo</th>
                        
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="conductores.length === 0">
                        <td colspan="8" style="text-align:center; color:#a0a0a0;">Sin registros</td>
                    </tr>
                    <tr v-for="c in conductores" :key="c.id_conductor">
                        <td>{{ c.id_conductor }}</td>
                        <td>{{ c.nombre }} {{ c.primer_ap }} {{ c.segundo_ap }}</td>
                        <td>{{ c.correo }}</td>
                        <td>{{ c.telefono }}</td>
                        <td>{{ c.num_licencia }}</td>
                        <td><span class="badge-cal">{{ c.calificacion_prom }}</span></td>
                        <td>{{ c.placa ? c.placa + ' — ' + c.marca + ' ' + c.modelo : 'Sin vehiculo activo' }}</td>
                        
                    </tr>
                </tbody>
            </table>
        </div>

        <ConductorModal
            v-if="modalVisible"
            :conductor="conductorSeleccionado"
            @cerrar="modalVisible = false"
            @guardado="cargar"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ConductorModal from '../../components/conductores/ConductorModal.vue'
import { getConductores, eliminarConductor } from '../../services/conductoresService'

const conductores = ref([])
const modalVisible = ref(false)
const conductorSeleccionado = ref(null)  

const cargar = async () => {
    try {
        const res = await getConductores()
        conductores.value = res.data
    } catch (err) {
        console.error('Error cargando conductores', err)
    }
}

const abrirAgregar = () => {
    conductorSeleccionado.value = null
    modalVisible.value = true
}

const abrirEditar = (c) => {
    conductorSeleccionado.value = c
    modalVisible.value = true
}

const eliminar = async (id) => {
    if (!confirm('Seguro que deseas eliminar este conductor?')) return
    try {
        await eliminarConductor(id)
        await cargar()
    } catch (err) {
        alert('Error al eliminar conductor')
    }
}

onMounted(cargar)
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
.badge-cal {
    background-color: #14532d;
    color: #4ade80;
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
.btn-accion.editar { background-color: #1e3a8a; color: #93c5fd; }
.btn-accion.eliminar { background-color: #7f1d1d; color: #fca5a5; }
.btn-accion:hover { opacity: 0.8; }
@media (max-width: 768px) {
    .tabla th, .tabla td { padding: 10px 8px; font-size: 12px; }
}
</style>