const db = require('../config/database')

const obtenerPagos = (callback) => {
    const sql = `
        SELECT p.id_pago, p.monto, p.fecha_transaccion,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            v.origen, v.destino, v.estado
        FROM Pago p
        JOIN Viaje v ON p.Viaje_id_viaje = v.id_viaje
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        ORDER BY p.id_pago DESC
    `
    db.query(sql, callback)
}

const crearPago = (datos, callback) => {
    const { id_viaje, monto, fecha_transaccion, id_metodo } = datos
    db.query('INSERT INTO Pago (Viaje_id_viaje, monto, fecha_transaccion, MetodoPago_id_metodo) VALUES (?, ?, ?, ?)',
        [id_viaje, monto, fecha_transaccion, id_metodo], callback)
}

const editarPago = (id, datos, callback) => {
    const { monto, fecha_transaccion } = datos
    db.query('UPDATE Pago SET monto = ?, fecha_transaccion = ? WHERE id_pago = ?',
        [monto, fecha_transaccion, id], callback)
}

const eliminarPago = (id, callback) => {
    db.query('DELETE FROM Pago WHERE id_pago = ?', [id], callback)
}

module.exports = { obtenerPagos, crearPago, editarPago, eliminarPago }