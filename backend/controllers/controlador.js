const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')
const viajeService = require('../services/viajeService')
require('dotenv').config()

const registro = (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, password } = req.body
    if (!nombre || !primer_ap || !correo || !telefono || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }
    const sqlVerificar = 'SELECT id_usuario FROM Usuario WHERE correo = ?'
    db.query(sqlVerificar, [correo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en servidor' })
        if (results.length > 0) return res.status(400).json({ error: 'El correo ya esta registrado' })
        const hash = bcrypt.hashSync(password, 10)
        const fecha = new Date().toISOString().slice(0, 10)
        const sql = 'INSERT INTO Usuario (nombre, primer_ap, segundo_ap, correo, telefono, fecha_registro, password) VALUES (?, ?, ?, ?, ?, ?, ?)'
        db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, fecha, hash], (err) => {
            if (err) return res.status(500).json({ error: 'Error al registrar usuario' })
            res.status(201).json({ mensaje: 'Usuario registrado correctamente' })
        })
    })
}

const login = (req, res) => {
    const { correo, password } = req.body
    if (!correo || !password) return res.status(400).json({ error: 'Correo y contrasena son requeridos' })
    const sql = 'SELECT * FROM Usuario WHERE correo = ?'
    db.query(sql, [correo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en servidor' })
        if (results.length === 0) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        const usuario = results[0]
        const passwordValida = bcrypt.compareSync(password, usuario.password)
        if (!passwordValida) return res.status(401).json({ error: 'Correo o contrasena incorrectos' })
        const token = jwt.sign(
            { id: usuario.id_usuario, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        )
        req.session.usuario = { id: usuario.id_usuario, correo: usuario.correo }
        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: { id: usuario.id_usuario, nombre: usuario.nombre, primer_ap: usuario.primer_ap, correo: usuario.correo }
        })
    })
}

const logout = (req, res) => {
    req.session.destroy()
    res.json({ mensaje: 'Sesion cerrada' })
}

const getViajes = (req, res) => {
    viajeService.listarViajes((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
}

const postViaje = (req, res) => {
    viajeService.crearViaje(req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Viaje agregado correctamente' })
    })
}

const putViaje = (req, res) => {
    viajeService.actualizarViaje(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Viaje actualizado correctamente' })
    })
}

const deleteViaje = (req, res) => {
    viajeService.borrarViaje(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Viaje eliminado correctamente' })
    })
}

const getUsuarios = (req, res) => {
    viajeService.listarUsuarios((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
}

const getConductores = (req, res) => {
    viajeService.listarConductores((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
}

const getVehiculos = (req, res) => {
    viajeService.listarVehiculos((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
}

const getConteos = (req, res) => {
    viajeService.listarConteos((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results[0])
    })
}

module.exports = { registro, login, logout, getViajes, postViaje, putViaje, deleteViaje, getUsuarios, getConductores, getVehiculos, getConteos }