const db = require('../config/database')

const obtenerUsuarios = (callback) => {
    const sql = `
        SELECT u.id_usuario, u.nombre, u.primer_ap, u.segundo_ap, u.correo, u.telefono,
            u.fecha_registro, 
            GROUP_CONCAT(m.tipo SEPARATOR ', ') AS metodo_tipo
        FROM Usuario u
        LEFT JOIN MetodoPago m ON u.id_usuario = m.id_usuario
        GROUP BY u.id_usuario ORDER BY u.id_usuario DESC
    `
    db.query(sql, callback)
}

const crearUsuario = (datos, callback) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, fecha, password } = datos
    const sql = 'INSERT INTO Usuario (nombre, primer_ap, segundo_ap, correo, telefono, fecha_registro, password) VALUES (?, ?, ?, ?, ?, ?, ?)'
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, fecha, password], callback)
}

const editarUsuario = (id, datos, callback) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono } = datos
    const sql = 'UPDATE Usuario SET nombre = ?, primer_ap = ?, segundo_ap = ?, correo = ?, telefono = ? WHERE id_usuario = ?'
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, id], callback)
}

const eliminarUsuario = (id, callback) => {
    db.query('DELETE FROM Usuario WHERE id_usuario = ?', [id], callback)
}

const actualizarFoto = (id, url, callback) => {
    db.query('UPDATE Usuario SET foto = ? WHERE id_usuario = ?', [url, id], callback)
}

const buscarPorCorreo = (correo, callback) => {
    db.query('SELECT * FROM Usuario WHERE correo = ?', [correo], callback)
}
const crearMetodoPago = (datos, callback) => {
    const { id_usuario, tipo, detalle } = datos
    db.query(
        'INSERT INTO MetodoPago (id_usuario, tipo, detalle, activo) VALUES (?, ?, ?, 1)',
        [id_usuario, tipo, detalle || null],
        callback
    )
}

module.exports = { obtenerUsuarios, crearUsuario, editarUsuario, eliminarUsuario, actualizarFoto, buscarPorCorreo, crearMetodoPago }