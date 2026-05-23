const viajeModel = require('../models/viajeModel')

const listarViajes = (callback) => {
    viajeModel.obtenerViajes(callback)
}

const crearViaje = (datos, callback) => {
    const { id_usuario, id_conductor, id_vehiculo, origen, destino, fecha_solicitud, estado, monto_cobrado, distancia_km  } = datos
    viajeModel.agregarViaje(
            [id_usuario, id_conductor, id_vehiculo, origen, destino, fecha_solicitud, estado, monto_cobrado, distancia_km || null],
            callback
        )
}

const actualizarViaje = (id, datos, callback) => {
    const { origen, destino, estado, monto_cobrado } = datos
    viajeModel.editarViaje(
            [origen, destino, estado, monto_cobrado, distancia_km || null, id],
            callback
    )
}

const borrarViaje = (id, callback) => {
    viajeModel.eliminarViaje(id, callback)
}

const listarUsuarios = (callback) => {
    viajeModel.obtenerUsuarios(callback)
}

const listarConductores = (callback) => {
    viajeModel.obtenerConductores(callback)
}

const listarVehiculos = (callback) => {
    viajeModel.obtenerVehiculos(callback)
}

const listarConteos = (callback) => {
    viajeModel.obtenerConteos(callback)
}

module.exports = {
    listarViajes,
    crearViaje,
    actualizarViaje,
    borrarViaje,
    listarUsuarios,
    listarConductores,
    listarVehiculos,
    listarConteos
}