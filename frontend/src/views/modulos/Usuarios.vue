<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 style="color: #ffffff;">Lista de Usuarios</h4>
            <button class="btn-verde" @click="abrirModalAgregar">
                <i class="fas fa-plus"></i> Agregar Usuario
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
                        <th>Fecha Registro</th>
                        <th>Metodos Pago</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="usuarios.length === 0">
                        <td colspan="7" style="text-align:center; color:#a0a0a0;">Sin registros</td>
                    </tr>
                    <tr v-for="u in usuarios" :key="u.id_usuario">
                        <td>{{ u.id_usuario }}</td>
                        <td>{{ u.nombre }} {{ u.primer_ap }} {{ u.segundo_ap }}</td>
                        <td>{{ u.correo }}</td>
                        <td>{{ u.telefono }}</td>
                        <td>{{ u.fecha_registro }}</td>
                        <td><span class="badge-metodos">{{ u.metodos_pago }}</span></td>
                        <td>
                            <button class="btn-accion editar" @click="abrirModalEditar(u)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion eliminar" @click="eliminar(u.id_usuario)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal-fondo" v-if="modalVisible">
            <div class="modal-caja">
                <h4 style="color:#ffffff; margin-bottom: 20px;">
                    {{ modoEditar ? 'Editar Usuario' : 'Agregar Usuario' }}
                </h4>

                <div class="campo">
                    <label>Nombre</label>
                    <input v-model="form.nombre" type="text" placeholder="Nombre" @input="errores.nombre = validarNombre(form.nombre)" />
                    <span class="error-campo" v-if="errores.nombre">{{ errores.nombre }}</span>
                </div>

                <div class="campo">
                    <label>Primer Apellido</label>
                    <input v-model="form.primer_ap" type="text" placeholder="Primer apellido" @input="errores.primer_ap = validarApellido(form.primer_ap)" />
                    <span class="error-campo" v-if="errores.primer_ap">{{ errores.primer_ap }}</span>
                </div>

                <div class="campo">
                    <label>Segundo Apellido <span class="opcional">(opcional)</span></label>
                    <input v-model="form.segundo_ap" type="text" placeholder="Segundo apellido" @input="errores.segundo_ap = validarApellido(form.segundo_ap, false)" />
                    <span class="error-campo" v-if="errores.segundo_ap">{{ errores.segundo_ap }}</span>
                </div>

                <div class="campo">
                    <label>Correo</label>
                    <input v-model="form.correo" type="text" placeholder="correo@ejemplo.com" @input="errores.correo = validarCorreo(form.correo)" />
                    <span class="error-campo" v-if="errores.correo">{{ errores.correo }}</span>
                </div>

                <div class="campo">
                    <label>Telefono</label>
                    <input v-model="form.telefono" type="text" placeholder="10 digitos" maxlength="10" @input="manejarTelefono" />
                    <span class="error-campo" v-if="errores.telefono">{{ errores.telefono }}</span>
                </div>

                <p v-if="errorGeneral" class="error-general">{{ errorGeneral }}</p>
                <p v-if="exito" class="exito">{{ exito }}</p>

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
import { ref, onMounted } from 'vue'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/index'
import { validarNombre, validarApellido, validarCorreo, validarTelefono } from '../../utils/validaciones'

const usuarios = ref([])
const modalVisible = ref(false)
const modoEditar = ref(false)
const errorGeneral = ref('')
const exito = ref('')
const idEditando = ref(null)

const form = ref({
    nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: ''
})

const errores = ref({
    nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: ''
})

const cargar = async () => {
    try {
        const res = await apiGet('/usuarios/lista')
        usuarios.value = res.data
    } catch (err) {
        console.error('Error cargando usuarios', err)
    }
}

const manejarTelefono = () => {
    form.value.telefono = form.value.telefono.replace(/[^0-9]/g, '')
    errores.value.telefono = validarTelefono(form.value.telefono)
}

const formularioValido = () => {
    errores.value.nombre = validarNombre(form.value.nombre)
    errores.value.primer_ap = validarApellido(form.value.primer_ap)
    errores.value.segundo_ap = validarApellido(form.value.segundo_ap, false)
    errores.value.correo = validarCorreo(form.value.correo)
    errores.value.telefono = validarTelefono(form.value.telefono)
    return !Object.values(errores.value).some(e => e !== '')
}

const abrirModalAgregar = () => {
    modoEditar.value = false
    idEditando.value = null
    form.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '' }
    errores.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '' }
    errorGeneral.value = ''
    exito.value = ''
    modalVisible.value = true
}

const abrirModalEditar = (u) => {
    modoEditar.value = true
    idEditando.value = u.id_usuario
    form.value = { nombre: u.nombre, primer_ap: u.primer_ap, segundo_ap: u.segundo_ap || '', correo: u.correo, telefono: u.telefono }
    errores.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '' }
    errorGeneral.value = ''
    exito.value = ''
    modalVisible.value = true
}

const cerrarModal = () => { modalVisible.value = false }

const guardar = async () => {
    errorGeneral.value = ''
    exito.value = ''
    if (!formularioValido()) return
    try {
        if (modoEditar.value) {
            await apiPut(`/usuarios/${idEditando.value}`, form.value)
            exito.value = 'Usuario actualizado correctamente'
        } else {
            await apiPost('/usuarios/crear', form.value)
            exito.value = 'Usuario creado correctamente'
        }
        await cargar()
        setTimeout(() => cerrarModal(), 1000)
    } catch (err) {
        errorGeneral.value = err.response?.data?.error || 'Error al guardar'
    }
}

const eliminar = async (id) => {
    if (!confirm('Seguro que deseas eliminar este usuario?')) return
    try {
        await apiDelete(`/usuarios/${id}`)
        await cargar()
    } catch (err) {
        alert('Error al eliminar usuario')
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

.badge-metodos {
    background-color: #1e3a8a;
    color: #93c5fd;
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

.campo { margin-bottom: 16px; }

.campo label {
    display: block;
    color: #a0a0a0;
    font-size: 13px;
    margin-bottom: 6px;
}

.opcional { color: #555555; font-size: 12px; }

.campo input {
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

.campo input:focus { border-color: #4ade80; }

.error-campo { color: #f87171; font-size: 12px; margin-top: 4px; display: block; }
.error-general { color: #f87171; font-size: 13px; text-align: center; margin-bottom: 10px; }
.exito { color: #4ade80; font-size: 13px; text-align: center; margin-bottom: 10px; }

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
