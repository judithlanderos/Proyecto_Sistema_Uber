<template>
    <div>
        <!-- TARJETAS KPI -->
        <div class="row mb-4">
            <div class="col-lg-3 col-6 mb-3">
                <div class="kpi-card">
                    <div class="kpi-icono" style="background-color:#14532d;">
                        <i class="fas fa-users" style="color:#4ade80;"></i>
                    </div>
                    <div class="kpi-info">
                        <p class="kpi-label">Total Usuarios</p>
                        <h3 class="kpi-numero">{{ datos.conteos.total_usuarios }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6 mb-3">
                <div class="kpi-card">
                    <div class="kpi-icono" style="background-color:#1e3a8a;">
                        <i class="fas fa-id-card" style="color:#93c5fd;"></i>
                    </div>
                    <div class="kpi-info">
                        <p class="kpi-label">Total Conductores</p>
                        <h3 class="kpi-numero">{{ datos.conteos.total_conductores }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6 mb-3">
                <div class="kpi-card">
                    <div class="kpi-icono" style="background-color:#854d0e;">
                        <i class="fas fa-car" style="color:#fef08a;"></i>
                    </div>
                    <div class="kpi-info">
                        <p class="kpi-label">Total Viajes</p>
                        <h3 class="kpi-numero">{{ datos.conteos.total_viajes }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6 mb-3">
                <div class="kpi-card">
                    <div class="kpi-icono" style="background-color:#7f1d1d;">
                        <i class="fas fa-dollar-sign" style="color:#fca5a5;"></i>
                    </div>
                    <div class="kpi-info">
                        <p class="kpi-label">Total Ingresos</p>
                        <h3 class="kpi-numero">${{ datos.conteos.total_ingresos }}</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- GRAFICAS -->
        <div class="row mb-4">
            <div class="col-lg-7 mb-3 d-flex">
                <div class="grafica-card">
                    <h5 class="grafica-titulo">Viajes por Estado</h5>
                    <canvas ref="graficaEstados"></canvas>
                </div>
            </div>
            <div class="col-lg-5 mb-3 ">
                <div class="grafica-card">
                    <h5 class="grafica-titulo">Calificacion Promedio</h5>
                    <div class="calificacion-centro">
                        <div class="calificacion-numero">{{ Number(datos.promedio_calificacion).toFixed(1) }}</div>
                        <div class="estrellas">
                            <i v-for="n in 5" :key="n" class="fas fa-star" :style="{ color: n <= Math.round(datos.promedio_calificacion) ? '#4ade80' : '#2a2a2a' }"></i>
                        </div>
                        <p style="color:#a0a0a0; margin-top:8px;">Promedio general de conductores</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ULTIMOS VIAJES -->
        <div class="row">
            <div class="col-12">
                <div class="grafica-card">
                    <h5 class="grafica-titulo">Ultimos 5 Viajes</h5>
                    <div class="tabla-contenedor">
                        <table class="tabla">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Pasajero</th>
                                    <th>Conductor</th>
                                    <th>Origen</th>
                                    <th>Destino</th>
                                    <th>Estado</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="v in datos.ultimos_viajes" :key="v.id_viaje">
                                    <td>{{ v.id_viaje }}</td>
                                    <td>{{ v.pasajero }}</td>
                                    <td>{{ v.conductor }}</td>
                                    <td>{{ v.origen }}</td>
                                    <td>{{ v.destino }}</td>
                                    <td><span :class="['badge-estado', v.estado]">{{ v.estado }}</span></td>
                                    <td>{{ v.monto_cobrado ? '$' + v.monto_cobrado : '—' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { apiGet } from '../../api/index'

const graficaEstados = ref(null)
let chartInstance = null

const datos = ref({
    conteos: {
        total_usuarios: 0,
        total_conductores: 0,
        total_viajes: 0,
        total_pagos: 0,
        total_ingresos: 0
    },
    estados: [],
    ultimos_viajes: [],
    promedio_calificacion: 0
})

const cargar = async () => {
    try {
        const res = await apiGet('/dashboard/estadisticas')
        datos.value = res.data
        await nextTick()
        iniciarGrafica()
    } catch (err) {
        console.error('Error cargando estadisticas', err)
    }
}

const iniciarGrafica = () => {
    if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
    }

    const colores = {
        pendiente: '#854d0e',
        en_curso: '#1e3a8a',
        completado: '#14532d',
        cancelado: '#7f1d1d'
    }

    const etiquetas = datos.value.estados.map(e => e.estado)
    const cantidades = datos.value.estados.map(e => e.cantidad)
    const fondos = etiquetas.map(e => colores[e] || '#2a2a2a')

    const ctx = graficaEstados.value.getContext('2d')
    chartInstance = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: etiquetas,
            datasets: [{
                data: cantidades,
                backgroundColor: fondos,
                borderColor: '#141414',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            }
        }
    })
}

onMounted(cargar)
</script>

<style scoped>
.kpi-card {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: border-color 0.3s;
}

.kpi-card:hover { border-color: #4ade80; }

.kpi-icono {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
}

.kpi-label {
    color: #a0a0a0;
    font-size: 13px;
    margin-bottom: 4px;
}

.kpi-numero {
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
}

.grafica-card {
    background-color: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 24px;
    width: 100%;
    height: 100%;
    min-height: 400px;
}

.grafica-titulo {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 12px;
}

.calificacion-centro {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.calificacion-numero {
    font-size: 72px;
    font-weight: 700;
    color: #4ade80;
    line-height: 1;
    margin-bottom: 16px;
}

.estrellas { font-size: 28px; gap: 4px; display: flex; }

.tabla-contenedor { overflow-x: auto; }

.tabla {
    width: 100%;
    border-collapse: collapse;
}

.tabla th {
    background-color: #1f1f1f;
    color: #4ade80;
    padding: 12px 16px;
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

.badge-estado { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-estado.pendiente  { background-color: #854d0e; color: #fef08a; }
.badge-estado.en_curso   { background-color: #1e3a8a; color: #93c5fd; }
.badge-estado.completado { background-color: #14532d; color: #4ade80; }
.badge-estado.cancelado  { background-color: #7f1d1d; color: #fca5a5; }

@media (max-width: 768px) {
    .kpi-numero { font-size: 22px; }
    .calificacion-numero { font-size: 52px; }
}
</style>