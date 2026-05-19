const express = require('express')
const router = express.Router()
const { verificarToken } = require('../middlewares/verificar')
const db = require('../config/database') 

const {
    registro, login, logout,
    getViajes, postViaje, putViaje, deleteViaje,
    getUsuarios, getConductores, getVehiculos, getConteos
} = require('../controllers/controlador')

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const tipos = ['image/jpeg', 'image/png', 'image/jpg']
        if (tipos.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Solo se permiten imagenes JPG y PNG'))
        }
    }
})

router.post('/registro', registro)
router.post('/login', login)
router.post('/logout', logout)

router.get('/dashboard/conteos', verificarToken, getConteos)
router.get('/viajes', verificarToken, getViajes)
router.post('/viajes', verificarToken, postViaje)


router.get('/viajes/detalle/:id', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            v.id_viaje,
            v.origen,
            v.destino,
            v.fecha_salida,
            v.fecha_inicio,
            v.fecha_fin,
            v.distancia_km,
            v.estado,
            v.monto_cobrado,
            CONCAT(u.nombre, ' ', u.primer_ap, ' ', IFNULL(u.segundo_ap,'')) AS pasajero,
            u.correo AS correo_pasajero,
            u.telefono AS telefono_pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap, ' ', IFNULL(c.segundo_ap,'')) AS conductor,
            c.num_licencia,
            c.calificacion_prom,
            ve.placa,
            ve.marca,
            ve.modelo,
            ve.anio,
            ve.categoria
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

router.delete('/viajes/:id', verificarToken, (req, res) => {
    const id = req.params.id
    db.query('DELETE FROM Calificacion WHERE Viaje_id_viaje = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        db.query('DELETE FROM Pago WHERE Viaje_id_viaje = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message })
            db.query('DELETE FROM Viaje WHERE id_viaje = ?', [id], (err) => {
                if (err) return res.status(500).json({ error: err.message })
                res.json({ mensaje: 'Viaje eliminado correctamente' })
            })
        })
    })
})

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
        LEFT JOIN MetodoPago m ON u.id_usuario = m.id_usuario
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
// VEHICULOS CRUD
router.get('/vehiculos/lista', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            v.id_vehiculo,
            v.placa,
            v.marca,
            v.modelo,
            v.anio,
            v.categoria,
            v.activo,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor
        FROM Vehiculo v
        JOIN Conductor c ON v.id_conductor = c.id_conductor
        ORDER BY v.id_vehiculo DESC
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

router.post('/vehiculos/crear', verificarToken, (req, res) => {
    const { placa, marca, modelo, anio, categoria, id_conductor } = req.body
    const sql = 'INSERT INTO Vehiculo (placa, marca, modelo, anio, categoria, activo, id_conductor) VALUES (?, ?, ?, ?, ?, 0, ?)'
    db.query(sql, [placa, marca, modelo, anio, categoria, id_conductor], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Vehiculo creado correctamente' })
    })
})

router.put('/vehiculos/:id', verificarToken, (req, res) => {
    const { placa, marca, modelo, anio, categoria, activo } = req.body
    const sql = 'UPDATE Vehiculo SET placa = ?, marca = ?, modelo = ?, anio = ?, categoria = ?, activo = ? WHERE id_vehiculo = ?'
    db.query(sql, [placa, marca, modelo, anio, categoria, activo, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Vehiculo actualizado correctamente' })
    })
})

router.delete('/vehiculos/:id', verificarToken, (req, res) => {
    const sql = 'DELETE FROM Vehiculo WHERE id_vehiculo = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Vehiculo eliminado correctamente' })
    })
})

// PAGOS CRUD
router.get('/pagos/lista', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            p.id_pago,
            p.monto,
            p.fecha_transaccion,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            v.origen,
            v.destino,
            v.estado
        FROM Pago p
        JOIN Viaje v ON p.Viaje_id_viaje = v.id_viaje
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        ORDER BY p.id_pago DESC
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

router.post('/pagos/crear', verificarToken, (req, res) => {
    const { id_viaje, monto, fecha_transaccion, id_metodo } = req.body
    const sql = 'INSERT INTO Pago (Viaje_id_viaje, monto, fecha_transaccion, MetodoPago_id_metodo) VALUES (?, ?, ?, ?)'
    db.query(sql, [id_viaje, monto, fecha_transaccion, id_metodo], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Pago creado correctamente' })
    })
})

router.put('/pagos/:id', verificarToken, (req, res) => {
    const { monto, fecha_transaccion } = req.body
    const sql = 'UPDATE Pago SET monto = ?, fecha_transaccion = ? WHERE id_pago = ?'
    db.query(sql, [monto, fecha_transaccion, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Pago actualizado correctamente' })
    })
})

router.delete('/pagos/:id', verificarToken, (req, res) => {
    const sql = 'DELETE FROM Pago WHERE id_pago = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Pago eliminado correctamente' })
    })
})

// CALIFICACIONES CRUD
router.get('/calificaciones/lista', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            cal.id_calificacion,
            cal.puntaje,
            cal.comentario,
            cal.direccion,
            cal.fecha_calificacion,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor
        FROM Calificacion cal
        JOIN Viaje v ON cal.Viaje_id_viaje = v.id_viaje
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN Conductor c ON v.id_conductor = c.id_conductor
        ORDER BY cal.id_calificacion DESC
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

router.post('/calificaciones/crear', verificarToken, (req, res) => {
    const { id_viaje, direccion, puntaje, comentario, fecha_calificacion } = req.body
    const sql = 'INSERT INTO Calificacion (Viaje_id_viaje, direccion, puntaje, comentario, fecha_calificacion) VALUES (?, ?, ?, ?, ?)'
    db.query(sql, [id_viaje, direccion, puntaje, comentario, fecha_calificacion], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Calificacion creada correctamente' })
    })
})

router.put('/calificaciones/:id', verificarToken, (req, res) => {
    const { puntaje, comentario } = req.body
    const sql = 'UPDATE Calificacion SET puntaje = ?, comentario = ? WHERE id_calificacion = ?'
    db.query(sql, [puntaje, comentario, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Calificacion actualizada correctamente' })
    })
})

router.delete('/calificaciones/:id', verificarToken, (req, res) => {
    const sql = 'DELETE FROM Calificacion WHERE id_calificacion = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Calificacion eliminada correctamente' })
    })
})

// CONDUCTORES CRUD
router.get('/conductores/lista', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            c.id_conductor,
            c.nombre,
            c.primer_ap,
            c.segundo_ap,
            c.correo,
            c.telefono,
            c.num_licencia,
            c.calificacion_prom,
            v.placa,
            v.marca,
            v.modelo
        FROM Conductor c
        LEFT JOIN Vehiculo v ON v.id_conductor = c.id_conductor AND v.activo = 1
        ORDER BY c.id_conductor DESC
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

router.post('/conductores/crear', verificarToken, (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, num_licencia } = req.body
    const sql = 'INSERT INTO Conductor (nombre, primer_ap, segundo_ap, correo, telefono, num_licencia, calificacion_prom) VALUES (?, ?, ?, ?, ?, ?, 0)'
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, num_licencia], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).json({ mensaje: 'Conductor creado correctamente' })
    })
})

router.put('/conductores/:id', verificarToken, (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, num_licencia } = req.body
    const sql = 'UPDATE Conductor SET nombre = ?, primer_ap = ?, segundo_ap = ?, correo = ?, telefono = ?, num_licencia = ? WHERE id_conductor = ?'
    db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, num_licencia, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Conductor actualizado correctamente' })
    })
})

router.delete('/conductores/:id', verificarToken, (req, res) => {
    const sql = 'DELETE FROM Conductor WHERE id_conductor = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ mensaje: 'Conductor eliminado correctamente' })
    })
})

const multer = require('multer')
const path = require('path')


const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB maximo
    fileFilter: (req, file, cb) => {
        const tipos = ['image/jpeg', 'image/png', 'image/jpg']
        if (tipos.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Solo se permiten imagenes JPG y PNG'))
        }
    }
})
router.post('/usuarios/:id/foto', verificarToken, upload.single('foto'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subio ninguna imagen' })

    try {
        const resultado = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'sistemauber',
                    public_id: `usuario_${req.params.id}`,
                    overwrite: true,
                    transformation: [{ width: 200, height: 200, crop: 'fill' }]
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            stream.end(req.file.buffer)
        })

        const url = resultado.secure_url
        const sql = 'UPDATE Usuario SET foto = ? WHERE id_usuario = ?'
        db.query(sql, [url, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message })
            res.json({ mensaje: 'Foto actualizada correctamente', url })
        })
    } catch (err) {
        console.error('Error Cloudinary:', err)
        res.status(500).json({ error: 'Error al subir imagen' })
    }
})

module.exports = router