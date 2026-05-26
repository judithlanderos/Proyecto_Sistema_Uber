const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { verificarToken } = require('../middlewares/verificar')
const db = require('../config/database')

const usuarioModel = require('../models/usuarioModel')
const conductorModel = require('../models/conductorModel')
const vehiculoModel = require('../models/vehiculoModel')
const pagoModel = require('../models/pagoModel')
const calificacionModel = require('../models/calificacionModel')
const viajeModel = require('../models/viajeModel')


const {
    registro, login, logout,
    getViajes, postViaje, putViaje,
    getUsuarios, getConductores, getVehiculos, getConteos
} = require('../controllers/controlador')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const tipos = ['image/jpeg', 'image/png', 'image/jpg']
        if (tipos.includes(file.mimetype)) cb(null, true)
        else cb(new Error('Solo se permiten imagenes JPG y PNG'))
    }
})


router.post('/registro', registro)
router.post('/login', login)
router.post('/logout', logout)

// DASHBOARD
router.get('/dashboard/conteos', verificarToken, getConteos)
router.get('/dashboard/estadisticas', verificarToken, (req, res) => {
    const sqlConteos = `
        SELECT
            (SELECT COUNT(*) FROM Usuario) AS total_usuarios,
            (SELECT COUNT(*) FROM Conductor) AS total_conductores,
            (SELECT COUNT(*) FROM Viaje) AS total_viajes,
            (SELECT COUNT(*) FROM Pago) AS total_pagos,
            (SELECT IFNULL(SUM(monto), 0) FROM Pago) AS total_ingresos
    `
    const sqlEstados = `SELECT estado, COUNT(*) AS cantidad FROM Viaje GROUP BY estado`
    const sqlUltimosViajes = `
        SELECT v.id_viaje,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor,
            v.origen, v.destino, v.estado, v.monto_cobrado
        FROM Viaje v
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN Conductor c ON v.Conductor_id_conductor = c.id_conductor
        ORDER BY v.id_viaje DESC LIMIT 5
    `
    const sqlCalificaciones = `SELECT AVG(CAST(puntaje AS DECIMAL)) AS promedio_calificacion FROM Calificacion`

    db.query(sqlConteos, (err, conteos) => {
        if (err) return res.status(500).json({ error: err.message })
        db.query(sqlEstados, (err, estados) => {
            if (err) return res.status(500).json({ error: err.message })
            db.query(sqlUltimosViajes, (err, ultimos) => {
                if (err) return res.status(500).json({ error: err.message })
                db.query(sqlCalificaciones, (err, calificaciones) => {
                    if (err) return res.status(500).json({ error: err.message })
                    res.json({
                        conteos: conteos[0],
                        estados,
                        ultimos_viajes: ultimos,
                        promedio_calificacion: calificaciones[0].promedio_calificacion || 0
                    })
                })
            })
        })
    })
})

// VIAJES
router.get('/viajes', verificarToken, getViajes)
router.get('/viajes/detalle/:id', verificarToken, (req, res) => {
    const sql = `
        SELECT v.id_viaje, v.origen, v.destino, v.fecha_salida, v.fecha_inicio, v.fecha_fin,
            v.distancia_km, v.estado, v.monto_cobrado,
            CONCAT(u.nombre, ' ', u.primer_ap, ' ', IFNULL(u.segundo_ap,'')) AS pasajero,
            u.correo AS correo_pasajero, u.telefono AS telefono_pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap, ' ', IFNULL(c.segundo_ap,'')) AS conductor,
            c.num_licencia, c.calificacion_prom,
            ve.placa, ve.marca, ve.modelo, ve.anio, ve.categoria
        FROM Viaje v
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN Conductor c ON v.Conductor_id_conductor = c.id_conductor
        JOIN Vehiculo ve ON v.Vehiculo_id_vehiculo = ve.id_vehiculo
        WHERE v.id_viaje = ?
    `
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        if (results.length === 0) return res.status(404).json({ error: 'Viaje no encontrado' })
        res.json(results[0])
    })
})
router.post('/viajes', verificarToken, postViaje)

router.delete('/viajes/:id', verificarToken, (req, res) => {
    const id = req.params.id
    calificacionModel.eliminarPorViaje(id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        pagoModel.eliminarPorViaje(id, (err) => {
            if (err) return res.status(500).json({ error: err.message })
            viajeModel.eliminarViaje(id, (err) => {
                if (err) return res.status(500).json({ error: err.message })
                res.json({ mensaje: 'Viaje eliminado correctamente' })
            })
        })
    })
})

// USUARIOS
router.get('/usuarios', verificarToken, getUsuarios)
router.get('/usuarios/lista', verificarToken, (req, res) => {
        usuarioModel.obtenerUsuarios((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
router.post('/usuarios/crear', verificarToken, (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono } = req.body
    const fecha = new Date().toISOString().slice(0, 10)
    const passwordDefault = require('bcryptjs').hashSync(req.body.password || '123456', 10)
    const sql = 'INSERT INTO Usuario (nombre, primer_ap, segundo_ap, correo, telefono, fecha_registro, password) VALUES (?, ?, ?, ?, ?, ?, ?)'
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, fecha, passwordDefault], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Usuario creado correctamente' })
    })
})
router.put('/usuarios/:id', verificarToken, (req, res) => {
    usuarioModel.editarUsuario(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Usuario actualizado correctamente' })
    })
})
router.delete('/usuarios/:id', verificarToken, (req, res) => {
    usuarioModel.eliminarUsuario(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Usuario eliminado correctamente' })
    })
})
router.post('/usuarios/:id/foto', verificarToken, upload.single('foto'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subio ninguna imagen' })
    try {
        const resultado = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'sistemauber', public_id: `usuario_${req.params.id}`, overwrite: true, transformation: [{ width: 200, height: 200, crop: 'fill' }] },
                (error, result) => { if (error) reject(error); else resolve(result) }
            )
            stream.end(req.file.buffer)
        })
        const url = resultado.secure_url
        db.query('UPDATE Usuario SET foto = ? WHERE id_usuario = ?', [url, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ mensaje: 'Foto actualizada correctamente', url })
        })
    } catch (err) {
        res.status(500).json({ error: 'Error al subir imagen' })
    }
})

// CONDUCTORES
router.get('/conductores', verificarToken, getConductores)
router.get('/conductores/lista', verificarToken, (req, res) => {
    conductorModel.obtenerConductores((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
router.post('/conductores/crear', verificarToken, (req, res) => {
     conductorModel.crearConductor(req.body, (err) => { 
         if (err) return res.status(500).json({ error: err.message })
            res.status(201).json({ mensaje: 'Conductor creado correctamente' })
        })
})
router.put('/conductores/:id', verificarToken, (req, res) => {
    conductorModel.editarConductor(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message })
            res.json({ mensaje: 'Conductor actualizado correctamente' })
        })
})
router.delete('/conductores/:id', verificarToken, (req, res) => {
    conductorModel.eliminarConductor(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Conductor eliminado correctamente' })
    })
})

// VEHICULOS
router.get('/vehiculos', verificarToken, getVehiculos)
router.get('/vehiculos/lista', verificarToken, (req, res) => {
    vehiculoModel.obtenerVehiculos((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
router.post('/vehiculos/crear', verificarToken, (req, res) => {
    vehiculoModel.crearVehiculo(req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Vehículo creado correctamente' })
    })
})
router.get('/vehiculos/:id', verificarToken, (req, res) => {
    vehiculoModel.obtenerVehiculoDetalle(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        if (results.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' })
        res.json(results[0])
    })
})

router.put('/vehiculos/:id', verificarToken, (req, res) => {
    vehiculoModel.editarVehiculo(req.params.id, req.body, (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ mensaje: 'Vehiculo actualizado correctamente' })
        })
})
router.delete('/vehiculos/:id', verificarToken, (req, res) => {
    vehiculoModel.eliminarVehiculo(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Vehiculo eliminado correctamente' })
    })
})

// PAGOS
router.get('/pagos/lista', verificarToken, (req, res) => {
        pagoModel.obtenerPagos((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
router.post('/pagos/crear', verificarToken, (req, res) => {
        pagoModel.crearPago(req.body, (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.status(201).json({ mensaje: 'Pago creado correctamente' })
        })
})
router.put('/pagos/:id', verificarToken, (req, res) => {
        pagoModel.editarPago(req.params.id, req.body, (err) => {
            res.json({ mensaje: 'Pago actualizado correctamente' })
        })
})
router.delete('/pagos/:id', verificarToken, (req, res) => {
    pagoModel.eliminarPago(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Pago eliminado correctamente' })
    })
})

// CALIFICACIONES
router.get('/calificaciones/lista', verificarToken, (req, res) => {
        calificacionModel.obtenerCalificaciones((err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
router.post('/calificaciones/crear', verificarToken, (req, res) => {
        calificacionModel.crearCalificacion(req.body, (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.status(201).json({ mensaje: 'Calificacion creada correctamente' })
        })
})
router.put('/calificaciones/:id', verificarToken, (req, res) => {
    calificacionModel.editarCalificacion(req.params.id, req.body, (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ mensaje: 'Calificacion actualizada correctamente' })
        })
})
router.delete('/calificaciones/:id', verificarToken, (req, res) => {
    calificacionModel.eliminarCalificacion(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Calificacion eliminada correctamente' })
    })
})
router.put('/viajes/:id', verificarToken, (req, res) => {
    const { origen, destino, estado, monto_cobrado, fecha_solicitud, fecha_inicio, fecha_fin, distancia_km } = req.body
    const sql = 'UPDATE Viaje SET origen = ?, destino = ?, estado = ?, monto_cobrado = ?, fecha_salida = ?, fecha_inicio = ?, fecha_fin = ?, distancia_km = ? WHERE id_viaje = ?'
    db.query(sql, [origen, destino, estado, monto_cobrado, fecha_solicitud, fecha_inicio, fecha_fin, distancia_km, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Viaje actualizado correctamente' })
    })
})

module.exports = router