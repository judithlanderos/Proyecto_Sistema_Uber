<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 style="color: #ffffff;">Lista de Vehículos</h4>
            <button class="btn-verde" @click="abrirAgregar">
                <i class="fas fa-plus"></i> Agregar Vehículo
            </button>
        </div>

        <div class="tabla-contenedor">
            <table class="tabla">
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
                            <button class="btn-accion editar" @click="abrirEditar(v)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion eliminar" @click="eliminar(v.id_vehiculo)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <VehiculoModal
            v-if="modalVisible"
            :vehiculo="vehiculoSeleccionado"
            @cerrar="modalVisible = false"
            @guardado="cargar"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VehiculoModal from '../../components/vehiculos/VehiculoModal.vue'
import { getVehiculos, eliminarVehiculo } from '../../services/vehiculosService'

const vehiculos = ref([])
const modalVisible = ref(false)
const vehiculoSeleccionado = ref(null)

const cargar = async () => {
    try {
        const res = await getVehiculos()
        vehiculos.value = res.data
    } catch (err) {
        console.error('Error cargando vehículos', err)
    }
}

const abrirAgregar = () => {
    vehiculoSeleccionado.value = null
    modalVisible.value = true
}

const abrirEditar = (v) => {
    vehiculoSeleccionado.value = v
    modalVisible.value = true
}

const eliminar = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este vehículo?')) return
    try {
        await eliminarVehiculo(id)
        await cargar()
    } catch {
        alert('Error al eliminar vehículo')
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
.btn-accion.editar { background-color: #1e3a8a; color: #93c5fd; }
.btn-accion.eliminar { background-color: #7f1d1d; color: #fca5a5; }
.btn-accion:hover { opacity: 0.8; }
@media (max-width: 768px) {
    .tabla th, .tabla td { padding: 10px 8px; font-size: 12px; }
}
</style>