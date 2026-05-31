const db = require('../config/database')

const obtenerVehiculos = (callback) => {
    const sql = `
        SELECT v.id_vehiculo, v.placa, v.marca, v.modelo, v.anio, v.categoria, v.activo,  v.id_conductor,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor_nombre
        FROM Vehiculo v
        JOIN Conductor c ON v.id_conductor = c.id_conductor
        ORDER BY v.id_vehiculo DESC
    `
    db.query(sql, callback)
}
const crearVehiculo = (datos, callback) => {
    const { placa, marca, modelo, anio, categoria, activo, id_conductor } = datos
    if (activo) {
        db.query('SELECT id_vehiculo FROM Vehiculo WHERE id_conductor = ? AND activo = 1', [id_conductor], (err, results) => {
            if (err) return callback(err)
            if (results.length > 0) return callback(new Error('Este conductor ya tiene un vehículo activo'))
            db.query('INSERT INTO Vehiculo (placa, marca, modelo, anio, categoria, activo, id_conductor) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [placa, marca, modelo, anio, categoria, 1, id_conductor], callback)
        })
    } else {
        db.query('INSERT INTO Vehiculo (placa, marca, modelo, anio, categoria, activo, id_conductor) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [placa, marca, modelo, anio, categoria, 0, id_conductor], callback)
    }
}

const obtenerVehiculoDetalle = (id, callback) => {
    const sql = `
        SELECT v.*, c.nombre, c.primer_ap, c.segundo_ap, c.correo, c.telefono, c.num_licencia, c.calificacion_prom
        FROM Vehiculo v
        LEFT JOIN Conductor c ON v.id_conductor = c.id_conductor
        WHERE v.id_vehiculo = ?
    `
    db.query(sql, [id], callback)
}

const editarVehiculo = (id, datos, callback) => {
      const { placa, marca, modelo, anio, categoria, activo, id_conductor } = datos
      if (activo) {
        db.query('SELECT id_vehiculo FROM Vehiculo WHERE id_conductor = ? AND activo = 1 AND id_vehiculo != ?', [id_conductor, id], (err, results) => {
            if (err) return callback(err)
            if (results.length > 0) return callback(new Error('Este conductor ya tiene un vehículo activo'))
            db.query('UPDATE Vehiculo SET placa = ?, marca = ?, modelo = ?, anio = ?, categoria = ?, activo = ?, id_conductor = ? WHERE id_vehiculo = ?',
                [placa, marca, modelo, anio, categoria, 1, id_conductor, id], callback)
        })
    } else {
        db.query('UPDATE Vehiculo SET placa = ?, marca = ?, modelo = ?, anio = ?, categoria = ?, activo = ?, id_conductor = ? WHERE id_vehiculo = ?',
        [placa, marca, modelo, anio, categoria, activo ? 1 : 0, id_conductor, id], callback)
    }
}
const eliminarVehiculo = (id, callback) => {
    db.query('DELETE FROM Vehiculo WHERE id_vehiculo = ?', [id], callback)
}

module.exports = { obtenerVehiculos, crearVehiculo,  obtenerVehiculoDetalle, editarVehiculo, eliminarVehiculo }