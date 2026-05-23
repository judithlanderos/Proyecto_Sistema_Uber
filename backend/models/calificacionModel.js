const db = require('../config/database')

const obtenerCalificaciones = (callback) => {
    const sql = `
        SELECT cal.id_calificacion, cal.puntaje, cal.comentario, cal.direccion, cal.fecha_calificacion,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor
        FROM Calificacion cal
        JOIN Viaje v ON cal.Viaje_id_viaje = v.id_viaje
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN Conductor c ON v.Conductor_id_conductor = c.id_conductor
        ORDER BY cal.id_calificacion DESC
    `
    db.query(sql, callback)
}

const crearCalificacion = (datos, callback) => {
    const { id_viaje, direccion, puntaje, comentario, fecha_calificacion } = datos
    db.query('INSERT INTO Calificacion (Viaje_id_viaje, direccion, puntaje, comentario, fecha_calificacion) VALUES (?, ?, ?, ?, ?)',
        [id_viaje, direccion, puntaje, comentario, fecha_calificacion], callback)
}

const editarCalificacion = (id, datos, callback) => {
    const { puntaje, comentario } = datos
    db.query('UPDATE Calificacion SET puntaje = ?, comentario = ? WHERE id_calificacion = ?',
        [puntaje, comentario, id], callback)
}

const eliminarCalificacion = (id, callback) => {
    db.query('DELETE FROM Calificacion WHERE id_calificacion = ?', [id], callback)
}

module.exports = { obtenerCalificaciones, crearCalificacion, editarCalificacion, eliminarCalificacion }