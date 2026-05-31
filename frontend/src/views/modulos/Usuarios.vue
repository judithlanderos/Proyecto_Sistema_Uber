<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn-verde" @click="abrirModalAgregar">
                <i class="fas fa-plus"></i> Agregar Usuario
            </button>
        </div>

        <div class="tabla-contenedor">
            <table ref="tablaRef" class="tabla display nowrap" style="width:100%">
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
                        <td><span class="badge-metodos">{{ u.metodo_tipo || 'Sin métodos' }}</span></td>
                        <td>

                            <button class="btn-accion editar btn-editar" :data-id="u.id_usuario">
                                <i class="fas fa-edit"></i>
                            </button>

                            <button class="btn-accion eliminar btn-eliminar" :data-id="u.id_usuario">
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
                <div class="campo" v-if="!modoEditar">
                    <label>Contrasena</label>
                    <input v-model="form.password" type="password" placeholder="Minimo 6 caracteres" @input="errores.password = validarPassword(form.password)" />
                    <span class="error-campo" v-if="errores.password">{{ errores.password }}</span>
                </div>
                <div v-if="!modoEditar">
                    <div class="seccion-titulo">
                        <span>Métodos de Pago</span>
                        <span class="opcional">(opcional)</span>
                    </div>

                    <div v-for="(m, i) in metodosPago" :key="i" class="metodo-item">
                        <div class="metodo-info">
                            <span class="badge-metodo-tipo">{{ m.tipo }}</span>
                        </div>
                        <button class="btn-quitar" @click="quitarMetodo(i)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="campo">
                        <select v-model="nuevoMetodo.tipo"  @change="confirmarMetodo">
                            <option value="">Selecciona método</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="saldo_uber">Saldo Uber</option>
                        </select>
                        <span class="error-campo" v-if="errores.metodoTipo">{{ errores.metodoTipo }}</span>
                    </div>

        
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
import { ref, onMounted, nextTick, onBeforeUnmount  } from 'vue'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/index'
import { validarNombre, validarApellido, validarCorreo, validarTelefono, validarPassword  } from '../../utils/validaciones'
import { alertaExito, alertaError, alertaConfirmar } from '../../utils/alertas'

const usuarios = ref([])
const modalVisible = ref(false)
const modoEditar = ref(false)
const errorGeneral = ref('')
const exito = ref('')
const idEditando = ref(null)
const tablaRef = ref(null)
let dtInstance = null
const metodosPago = ref([])
const nuevoMetodo = ref({ tipo: '' })
const form = ref({
    nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', password: ''
})

const errores = ref({
    nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', password: '',  metodoTipo: ''
})

const iniciarDataTable = () => {
    if (dtInstance) { dtInstance.destroy(); dtInstance = null }
    dtInstance = window.$(tablaRef.value).DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
        columnDefs: [{ orderable: false, targets: 6 }],
        order: [[0, 'asc']],
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50]
    })
    window.$(tablaRef.value).on('click', '.btn-ver', function () {
            const id = window.$(this).data('id')
            const usuario = usuarios.value.find(u => u.id_usuario === id)
            if (usuario) abrirDetalle(usuario)
        })


    window.$(tablaRef.value).on('click', '.btn-editar', function () {
        const id = window.$(this).data('id')
        const usuario = usuarios.value.find(u => u.id_usuario === id)
        if (usuario) abrirModalEditar(usuario)
    })

    window.$(tablaRef.value).on('click', '.btn-eliminar', function () {
        const id = window.$(this).data('id')
        eliminar(id)
    })
}

const cargar = async () => {
    try {
        if (dtInstance) { dtInstance.destroy(); dtInstance = null }
        const res = await apiGet('/usuarios/lista')
        usuarios.value = res.data
        await nextTick()
        iniciarDataTable()
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
    if (!modoEditar.value) {
    errores.value.password = validarPassword(form.value.password)
}
    return !Object.values(errores.value).some(e => e !== '')
}

const abrirModalAgregar = () => {
    modoEditar.value = false
    idEditando.value = null
    form.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', password: '' }
    errores.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '', password: '', metodoTipo: '' }
    metodosPago.value = [] 
    nuevoMetodo.value = { tipo: '' }
    errorGeneral.value = ''
    exito.value = ''
    modalVisible.value = true
}

const abrirModalEditar = (u) => {
    modoEditar.value = true
    idEditando.value = u.id_usuario
    form.value = { nombre: u.nombre, primer_ap: u.primer_ap, segundo_ap: u.segundo_ap || '', correo: u.correo, telefono: u.telefono }
    errores.value = { nombre: '', primer_ap: '', segundo_ap: '', correo: '', telefono: '' }
    metodosPago.value = []
    nuevoMetodo.value = { tipo: '' }
    errorGeneral.value = ''
    exito.value = ''
    modalVisible.value = true
}

const cerrarModal = () => { modalVisible.value = false }
const quitarMetodo = (i) => {
    metodosPago.value.splice(i, 1)
}
const guardar = async () => {
    errorGeneral.value = ''
    if (!formularioValido()) return
    try {
        if (modoEditar.value) {
            await apiPut(`/usuarios/${idEditando.value}`, form.value)
            alertaExito('Usuario actualizado correctamente')
        } else {
        const res = await apiPost('/usuarios/crear', form.value)
        console.log('response crear:', res.data)
        const nuevoId = res.data.id
        console.log('nuevoId:', nuevoId)
        console.log('response completo:', res.data)
        for (const m of metodosPago.value) {
            //await apiPost(`/usuarios/${nuevoId}/metodos`, { tipo: m.tipo, detalle: m.detalle || null })
            console.log('Enviando metodo:', m)

        const resp = await apiPost(
            `/usuarios/${nuevoId}/metodos`,
            {
                tipo: m.tipo,
                detalle: m.detalle || null
            }
        )

        console.log('RESPUESTA METODO:', resp.data)


    }
    alertaExito('Usuario creado correctamente')
        }
        await cargar()
        setTimeout(() => cerrarModal(), 1000)
    } catch (err) {
        alertaError(err.response?.data?.error || 'Error al guardar')
    }
}

const eliminar = async (id) => {
    const resultado = await alertaConfirmar('Seguro que deseas eliminar este usuario?')
    if (!resultado.isConfirmed) return
    try {
        await apiDelete(`/usuarios/${id}`)
        await cargar()
        alertaExito('Usuario eliminado correctamente')
    } catch (err) {
        alertaError('Error al eliminar usuario')
    }
}
const confirmarMetodo = () => {

    if (!nuevoMetodo.value.tipo) {
        errores.value.metodoTipo = 'Selecciona un tipo'
        return
    }

    const existe = metodosPago.value.some(
        m => m.tipo === nuevoMetodo.value.tipo
    )

    if (existe) {
        errores.value.metodoTipo = 'Ese método ya fue agregado'
        nuevoMetodo.value = { tipo: '' }
        return
    }

    metodosPago.value.push({
        tipo: nuevoMetodo.value.tipo,
        detalle: null
    })

    nuevoMetodo.value = { tipo: '' }

    errores.value.metodoTipo = ''
}
onMounted(cargar)
onBeforeUnmount(() => {
    if (dtInstance) {
        dtInstance.destroy()
        dtInstance = null
    }
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

.badge-metodos {
    background-color: #1e3a8a;
    color: #93c5fd;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}
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
:deep(table.dataTable thead th.sorting),
:deep(table.dataTable thead th.sorting_asc),
:deep(table.dataTable thead th.sorting_desc) {
    background-color: #1f1f1f;
    color: #4ade80;
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
.seccion-titulo {
    color: #a0a0a0;
    font-size: 13px;
    margin-bottom: 12px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-top: 1px solid #2a2a2a;
    padding-top: 16px;
}

.metodo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 8px;
}

.metodo-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.badge-metodo-tipo {
    background-color: #14532d;
    color: #4ade80;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
}

.btn-quitar {
    background: none;
    border: none;
    color: #f87171;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background 0.2s;
}
.btn-quitar:hover { background-color: #7f1d1d33; }

.campo select {
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
.campo select:focus { border-color: #4ade80; }
.campo select option { background-color: #1f1f1f; }

.btn-verde-sm {
    background-color: #4ade80;
    color: #0a0a0a;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    transition: background-color 0.2s;
}
.btn-verde-sm:hover { background-color: #22c55e; }

@media (max-width: 768px) {
    .tabla th, .tabla td { padding: 10px 8px; font-size: 12px; }
    .modal-caja { padding: 20px 16px; }
}
</style>
