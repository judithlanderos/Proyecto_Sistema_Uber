const db = require('../config/database')

const obtenerPagos = (callback) => {
    const sql = `
        SELECT p.id_pago, p.monto,
            DATE_FORMAT(p.fecha_transaccion, '%Y-%m-%d') AS fecha_transaccion,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            v.origen, v.destino, v.estado,
            m.tipo AS metodo_tipo
        FROM Pago p
        JOIN Viaje v ON p.Viaje_id_viaje = v.id_viaje
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN MetodoPago m ON p.MetodoPago_id_metodo = m.id_metodo
        ORDER BY p.id_pago DESC
    `
    db.query(sql, callback)
}
const crearPago = (datos, callback) => {
    const { id_viaje, monto, id_metodo } = datos
    db.query('SELECT id_pago FROM Pago WHERE Viaje_id_viaje = ?', [id_viaje], (err, results) => {
        if (err) return callback(err)
        if (results.length > 0) return callback(new Error('Este viaje ya tiene un pago registrado'))
        db.query('SELECT id_metodo FROM MetodoPago WHERE tipo = ? LIMIT 1', [id_metodo], (err, results) => {
            if (err) return callback(err)
            if (results.length === 0) return callback(new Error('Método de pago no encontrado'))
            db.query('INSERT INTO Pago (Viaje_id_viaje, monto, MetodoPago_id_metodo) VALUES (?, ?, ?)',
                [id_viaje, monto, results[0].id_metodo], callback)
        })
    })
}

const editarPago = (id, datos, callback) => {
    const { monto, id_metodo } = datos
    db.query('UPDATE Pago SET monto = ?, MetodoPago_id_metodo = ? WHERE id_pago = ?',
        [monto, id_metodo, id], callback)
}

const eliminarPago = (id, callback) => {
    db.query('DELETE FROM Pago WHERE id_pago = ?', [id], callback)
}
const eliminarPorViaje = (id_viaje, callback) => {
    db.query('DELETE FROM Pago WHERE Viaje_id_viaje = ?', [id_viaje], callback)
}
const obtenerViajesCompletados = (callback) => {
    db.query(`SELECT id_viaje, origen, destino FROM Viaje WHERE estado = 'completado'`, callback)
}

const obtenerMetodosPago = (callback) => {
    db.query('SELECT m.id_metodo, m.tipo, m.detalle, CONCAT(u.nombre, " ", u.primer_ap) AS usuario FROM MetodoPago m JOIN Usuario u ON m.id_usuario = u.id_usuario', callback)
}

module.exports = { obtenerPagos, crearPago, editarPago, eliminarPago, eliminarPorViaje, obtenerViajesCompletados, obtenerMetodosPago }