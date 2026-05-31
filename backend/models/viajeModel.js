const db = require('../config/database');

const obtenerViajes = (callback) => {
    const sql = `
        SELECT 
            v.id_viaje,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor,
            ve.placa AS vehiculo,
            v.origen,
            v.destino,
            v.estado,
            v.monto_cobrado,
            v.fecha_salida,
            v.distancia_km
        FROM Viaje v
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN Conductor c ON v.Conductor_id_conductor = c.id_conductor
        JOIN Vehiculo ve ON v.Vehiculo_id_vehiculo = ve.id_vehiculo
        ORDER BY v.id_viaje DESC
    `
    db.query(sql, callback)
}

const agregarViaje = (datos, callback) => {
    const sql = 'INSERT INTO Viaje (Usuario_id_usuario, Conductor_id_conductor, Vehiculo_id_vehiculo, origen, destino, estado, monto_cobrado, distancia_km) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    db.query(sql, datos, callback)
}

const editarViaje = (datos, callback) => {

    console.log('DATOS RECIBIDOS:', datos)

    const sql = `
        UPDATE Viaje 
        SET 
            origen = ?, 
            destino = ?, 
            estado = ?, 
            monto_cobrado = ?, 
            distancia_km = ?
        WHERE id_viaje = ?
    `

    db.query(sql, datos, (err, result) => {

        if (err) {
            console.log('ERROR MYSQL COMPLETO:')
            console.log(err)

            return callback(err, null)
        }

        console.log('UPDATE OK')

        callback(null, result)
    })
}

const eliminarViaje = (id, callback) => {
    const sql = 'DELETE FROM Viaje WHERE id_viaje = ?'
    db.query(sql, [id], callback)
}

const obtenerUsuarios = (callback) => {
    db.query('SELECT id_usuario, nombre, primer_ap FROM Usuario', callback)
}

const obtenerConductores = (callback) => {
    db.query('SELECT id_conductor, nombre, primer_ap FROM Conductor', callback)
}

const obtenerVehiculos = (callback) => {
    db.query('SELECT id_vehiculo, placa, marca, modelo,  id_conductor, activo FROM Vehiculo', callback)
}

const obtenerConteos = (callback) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM Usuario) AS usuarios,
            (SELECT COUNT(*) FROM Conductor) AS conductores,
            (SELECT COUNT(*) FROM Viaje) AS viajes,
            (SELECT COUNT(*) FROM Pago) AS pagos
    `
    db.query(sql, callback)
}

module.exports = {
    obtenerViajes,
    agregarViaje,
    editarViaje,
    eliminarViaje,
    obtenerUsuarios,
    obtenerConductores,
    obtenerVehiculos,
    obtenerConteos
}