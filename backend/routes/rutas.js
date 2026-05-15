const express = require('express')
const router = express.Router()
const { verificarToken } = require('../middlewares/verificar')
const {
    registro, login, logout,
    getViajes, postViaje, putViaje, deleteViaje,
    getUsuarios, getConductores, getVehiculos, getConteos
} = require('../controllers/controlador')

router.post('/registro', registro)
router.post('/login', login)
router.post('/logout', logout)

router.get('/dashboard/conteos', verificarToken, getConteos)
router.get('/viajes', verificarToken, getViajes)
router.post('/viajes', verificarToken, postViaje)
router.put('/viajes/:id', verificarToken, putViaje)
router.delete('/viajes/:id', verificarToken, deleteViaje)

router.get('/usuarios', verificarToken, getUsuarios)
router.get('/conductores', verificarToken, getConductores)
router.get('/vehiculos', verificarToken, getVehiculos)

// USUARIOS CRUD
router.get('/usuarios/lista', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.primer_ap,
            u.segundo_ap,
            u.correo,
            u.telefono,
            u.fecha_registro,
            COUNT(m.id_metodo) AS metodos_pago
        FROM Usuario u
        LEFT JOIN MetodoPago m ON u.id_usuario = m.Usuario_id_usuario
        GROUP BY u.id_usuario
        ORDER BY u.id_usuario DESC
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

router.post('/usuarios/crear', verificarToken, (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono } = req.body
    const fecha = new Date().toISOString().slice(0, 10)
    const sql = 'INSERT INTO Usuario (nombre, primer_ap, segundo_ap, correo, telefono, fecha_registro, password) VALUES (?, ?, ?, ?, ?, ?, ?)'
    const passwordDefault = require('bcryptjs').hashSync('123456', 10)
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, fecha, passwordDefault], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Usuario creado correctamente' })
    })
})

router.put('/usuarios/:id', verificarToken, (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono } = req.body
    const sql = 'UPDATE Usuario SET nombre = ?, primer_ap = ?, segundo_ap = ?, correo = ?, telefono = ? WHERE id_usuario = ?'
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Usuario actualizado correctamente' })
    })
})

router.delete('/usuarios/:id', verificarToken, (req, res) => {
    const sql = 'DELETE FROM Usuario WHERE id_usuario = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Usuario eliminado correctamente' })
    })
})

module.exports = router