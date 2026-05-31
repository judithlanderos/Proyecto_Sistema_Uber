<template>
    <div class="modal-fondo">
        <div class="modal-caja">
            <template v-if="tipo === 'detalle' && detalle">
                <h4 style="color:#ffffff; margin-bottom: 20px;">Detalle del Vehículo</h4>

                <div class="detalle-seccion">
                    <p class="detalle-titulo">Vehículo</p>
                    <div class="detalle-grid">
                        <div class="detalle-item"><span class="detalle-label">ID</span><span>{{ detalle.id_vehiculo }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Placa</span><span>{{ detalle.placa }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Marca</span><span>{{ detalle.marca }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Modelo</span><span>{{ detalle.modelo }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Año</span><span>{{ detalle.anio }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Categoría</span><span class="badge-cat">{{ detalle.categoria }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Estado</span>
                            <span :class="detalle.activo ? 'badge-activo' : 'badge-inactivo'">
                                {{ detalle.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="detalle-seccion" v-if="detalle.nombre">
                    <p class="detalle-titulo">Conductor Asignado</p>
                    <div class="detalle-grid">
                        <div class="detalle-item"><span class="detalle-label">Nombre</span><span>{{ detalle.nombre }} {{ detalle.primer_ap }} {{ detalle.segundo_ap }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Correo</span><span>{{ detalle.correo }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Teléfono</span><span>{{ detalle.telefono }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Licencia</span><span>{{ detalle.num_licencia }}</span></div>
                        <div class="detalle-item"><span class="detalle-label">Calificación</span><span class="badge-cal">{{ detalle.calificacion_prom }}</span></div>
                    </div>
                </div>
                <p v-else style="color:#a0a0a0; font-size:13px;">Sin conductor asignado</p>

                <div class="modal-botones">
                    <button class="btn-cancelar" @click="$emit('cerrar')">Cerrar</button>
                </div>
            </template>

        <template v-else>
            <h4 style="color:#ffffff; margin-bottom: 20px;">
                {{ modoEditar ? 'Editar Vehículo' : 'Agregar Vehículo' }}
            </h4>

            <div class="campo">
                <label>Placa</label>
                <input v-model="form.placa" type="text" placeholder="ABC123"
                    @input="errores.placa = validarRequerido(form.placa, 'La placa')" />
                <span class="error-campo" v-if="errores.placa">{{ errores.placa }}</span>
            </div>

            <div class="campo">
                <label>Marca</label>
                <input v-model="form.marca" type="text" placeholder="Nissan"
                    @input="errores.marca = validarNombre(form.marca)" />
                <span class="error-campo" v-if="errores.marca">{{ errores.marca }}</span>
            </div>

            <div class="campo">
                <label>Modelo</label>
                <input v-model="form.modelo" type="text" placeholder="Versa"
                    @input="errores.modelo = validarRequerido(form.modelo, 'El modelo')" />
                <span class="error-campo" v-if="errores.modelo">{{ errores.modelo }}</span>
            </div>

            <div class="campo">
                <label>Año</label>
                <input v-model="form.anio" type="text" maxlength="4" placeholder="2020"
                    @input="errores.anio = validarAnio(form.anio)" />
                <span class="error-campo" v-if="errores.anio">{{ errores.anio }}</span>
            </div>

            <div class="campo">
                <label>Categoría</label>
                <select v-model="form.categoria" @change="errores.categoria = validarRequerido(form.categoria, 'La categoría')">
                    <option value="">Selecciona</option>
                    <option value="UberX">UberX</option>
                    <option value="Comfort">Comfort</option>
                    <option value="UberXL">UberXL</option>
                    <option value="Black">Black</option>
                </select>
                <span class="error-campo" v-if="errores.categoria">{{ errores.categoria }}</span>
            </div>

            <div class="campo">
                <label>Conductor</label>
                <select v-model="form.id_conductor"
                    @change="errores.id_conductor = validarRequerido(form.id_conductor, 'El conductor')">
                    <option value="">Selecciona</option>
                    <option v-for="c in conductores" :key="c.id_conductor" :value="c.id_conductor">
                        {{ c.nombre }} {{ c.primer_ap }}
                    </option>
                </select>
                <span class="error-campo" v-if="errores.id_conductor">{{ errores.id_conductor }}</span>
            </div>

            <div class="campo campo-check">
                <label>
                    <input type="checkbox" v-model="form.activo" />
                    Vehículo activo
                </label>
            </div>

            <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>
            <p v-if="exito" class="exito">{{ exito }}</p>

            <div class="modal-botones">
                <button class="btn-verde" @click="guardar">
                    {{ modoEditar ? 'Actualizar' : 'Guardar' }}
                </button>
                <button class="btn-cancelar" @click="$emit('cerrar')">Cancelar</button>
            </div>
        </template>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { validarNombre, validarRequerido } from '../../utils/validaciones'
import { crearVehiculo, actualizarVehiculo } from '../../services/vehiculosService'
import { getConductores } from '../../services/conductoresService'

const props = defineProps({
    tipo:     { type: String, default: 'form' },
    vehiculo: { type: Object, default: null },
    detalle:  { type: Object, default: null }
})

const emit = defineEmits(['cerrar', 'guardado'])

const modoEditar = ref(false)
const errorGeneral = ref('')
const exito = ref('')
const conductores = ref([])

const formVacio = () => ({
    placa: '', marca: '', modelo: '', anio: '',
    categoria: '', activo: true, id_conductor: ''
})

const form = ref(formVacio())
const errores = ref({
    placa: '', marca: '', modelo: '', anio: '',
    categoria: '', id_conductor: ''
})

const validarAnio = (valor) => {
    if (!valor) return 'El año es obligatorio'
    if (!/^\d{4}$/.test(valor)) return 'Debe ser un año de 4 dígitos'
    const num = parseInt(valor)
    if (num < 1990 || num > new Date().getFullYear() + 1) return 'Año fuera de rango'
    return ''
}

const cargarConductores = async () => {
    try {
        const res = await getConductores()
        conductores.value = res.data
    } catch {
        conductores.value = []
    }
}

watch(() => props.vehiculo, (v) => {
    if (v) {
        modoEditar.value = true
        form.value = {
            placa: v.placa,
            marca: v.marca,
            modelo: v.modelo,
            anio: String(v.anio),
            categoria: v.categoria,
            activo: v.activo === 1 || v.activo === true,
            id_conductor: v.id_conductor
        }
    } else {
        modoEditar.value = false
        form.value = formVacio()
    }
    errores.value = { placa: '', marca: '', modelo: '', anio: '', categoria: '', id_conductor: '' }
    errorGeneral.value = ''
    exito.value = ''
}, { immediate: true })

cargarConductores()

const formularioValido = () => {
    errores.value.placa = validarRequerido(form.value.placa, 'La placa')
    errores.value.marca = validarNombre(form.value.marca)
    errores.value.modelo = validarRequerido(form.value.modelo, 'El modelo')
    errores.value.anio = validarAnio(form.value.anio)
    errores.value.categoria = validarRequerido(form.value.categoria, 'La categoría')
    errores.value.id_conductor = validarRequerido(form.value.id_conductor, 'El conductor')
    return !Object.values(errores.value).some(e => e !== '')
}

const guardar = async () => {
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return
    const payload = { ...form.value, activo: form.value.activo ? 1 : 0 }
    try {
        if (modoEditar.value) {
            await actualizarVehiculo(props.vehiculo.id_vehiculo, payload)
            exito.value = 'Vehículo actualizado correctamente'
        } else {
            await crearVehiculo(payload)
            exito.value = 'Vehículo creado correctamente'
        }
        emit('guardado')
        setTimeout(() => emit('cerrar'), 1000)
    } catch (err) {
        errorGeneral.value = err.response?.data?.error || 'Error al guardar'
    }
}
</script>

<style scoped>
.modal-fondo {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
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
.detalle-seccion { margin-bottom: 24px; }
.detalle-titulo {
    color: #4ade80;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 6px;
}
.detalle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detalle-item { display: flex; flex-direction: column; gap: 4px; }
.detalle-label { color: #a0a0a0; font-size: 12px; }
.detalle-item span:last-child { color: #ffffff; font-size: 14px; }
.badge-cat {
    background-color: #1e3a5f; color: #93c5fd;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
}
.badge-activo {
    background-color: #14532d; color: #4ade80;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
}
.badge-inactivo {
    background-color: #3b1f1f; color: #f87171;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
}
.badge-cal {
    background-color: #14532d; color: #4ade80;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
}

.campo { margin-bottom: 16px; }
.campo label { display: block; color: #a0a0a0; font-size: 13px; margin-bottom: 6px; }
.campo input, .campo select {
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
}
.campo input:focus, .campo select:focus { border-color: #4ade80; }
.campo select option { background-color: #1f1f1f; }
.campo-check label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #a0a0a0; }
.campo-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: #4ade80; cursor: pointer; }
.error-campo { color: #f87171; font-size: 12px; margin-top: 4px; display: block; }
.error-general { color: #f87171; font-size: 13px; text-align: center; margin-bottom: 10px; }
.exito { color: #4ade80; font-size: 13px; text-align: center; margin-bottom: 10px; }
.modal-botones { display: flex; gap: 10px; margin-top: 20px; }
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
@media (max-width: 768px) { .modal-caja { padding: 20px 16px; } }
</style>