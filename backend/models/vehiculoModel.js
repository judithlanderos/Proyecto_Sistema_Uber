const db = require('../config/database')

const obtenerVehiculos = (callback) => {
    const sql = `
        SELECT v.id_vehiculo, v.placa, v.marca, v.modelo, v.anio, v.categoria, v.activo,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor
        FROM Vehiculo v
        JOIN Conductor c ON v.id_conductor = c.id_conductor
        ORDER BY v.id_vehiculo DESC
    `
    db.query(sql, callback)
}

const editarVehiculo = (id, datos, callback) => {
    const { placa, marca, modelo, anio, categoria, activo } = datos
    db.query('UPDATE Vehiculo SET placa = ?, marca = ?, modelo = ?, anio = ?, categoria = ?, activo = ? WHERE id_vehiculo = ?',
        [placa, marca, modelo, anio, categoria, activo, id], callback)
}

const eliminarVehiculo = (id, callback) => {
    db.query('DELETE FROM Vehiculo WHERE id_vehiculo = ?', [id], callback)
}

module.exports = { obtenerVehiculos, editarVehiculo, eliminarVehiculo }