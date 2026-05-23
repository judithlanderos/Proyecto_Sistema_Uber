const db = require('../config/database')

const obtenerConductores = (callback) => {
    const sql = `
        SELECT c.id_conductor, c.nombre, c.primer_ap, c.segundo_ap, c.correo, c.telefono,
            c.num_licencia, c.calificacion_prom, v.placa, v.marca, v.modelo
        FROM Conductor c
        LEFT JOIN Vehiculo v ON v.id_conductor = c.id_conductor AND v.activo = 1
        ORDER BY c.id_conductor DESC
    `
    db.query(sql, callback)
}

const crearConductor = (datos, callback) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, num_licencia } = datos
    db.query('INSERT INTO Conductor (nombre, primer_ap, segundo_ap, correo, telefono, num_licencia, calificacion_prom) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [nombre, primer_ap, segundo_ap, correo, telefono, num_licencia], callback)
}

const editarConductor = (id, datos, callback) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, num_licencia } = datos
    db.query('UPDATE Conductor SET nombre = ?, primer_ap = ?, segundo_ap = ?, correo = ?, telefono = ?, num_licencia = ? WHERE id_conductor = ?',
        [nombre, primer_ap, segundo_ap, correo, telefono, num_licencia, id], callback)
}

const eliminarConductor = (id, callback) => {
    db.query('DELETE FROM Conductor WHERE id_conductor = ?', [id], callback)
}

module.exports = { obtenerConductores, crearConductor, editarConductor, eliminarConductor }