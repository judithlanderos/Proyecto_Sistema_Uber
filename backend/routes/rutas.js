const express = require('express');
const router = express.Router();
const { registro, login, logout } = require('../controllers/controlador');
const { verificarToken } = require('../middlewares/verificar')
const db = require('../config/database')


router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);

// CONTEOS
router.get('/dashboard/conteos', verificarToken, (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM Usuario) AS usuarios,
            (SELECT COUNT(*) FROM Conductor) AS conductores,
            (SELECT COUNT(*) FROM Viaje) AS viajes,
            (SELECT COUNT(*) FROM Pago) AS pagos
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener conteos' })
        res.json(results[0])
    })
})

// VIAJES - consulta multitabla
router.get('/viajes', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            v.id_viaje,
            CONCAT(u.nombre, ' ', u.primer_ap) AS pasajero,
            CONCAT(c.nombre, ' ', c.primer_ap) AS conductor,
            ve.placa AS vehiculo,
            v.origen,
            v.destino,
            v.estado,
            v.monto_cobrado,
            v.fecha_solicitud
        FROM Viaje v
        JOIN Usuario u ON v.Usuario_id_usuario = u.id_usuario
        JOIN Conductor c ON v.Conductor_id_conductor = c.id_conductor
        JOIN Vehiculo ve ON v.Vehiculo_id_vehiculo = ve.id_vehiculo
        ORDER BY v.id_viaje DESC
    `
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener viajes' })
        res.json(results)
    })
})

// VIAJES - agregar
router.post('/viajes', verificarToken, (req, res) => {
    const { id_usuario, id_conductor, id_vehiculo, origen, destino, fecha_solicitud, estado, monto_cobrado } = req.body
    const sql = `
        INSERT INTO Viaje (Usuario_id_usuario, Conductor_id_conductor, Vehiculo_id_vehiculo, origen, destino, fecha_solicitud, estado, monto_cobrado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    db.query(sql, [id_usuario, id_conductor, id_vehiculo, origen, destino, fecha_solicitud, estado, monto_cobrado], (err) => {
        if (err) return res.status(500).json({ error: 'Error al agregar viaje' })
        res.status(201).json({ mensaje: 'Viaje agregado correctamente' })
    })
})

// VIAJES - editar
router.put('/viajes/:id', verificarToken, (req, res) => {
    const { origen, destino, estado, monto_cobrado } = req.body
    const sql = `
        UPDATE Viaje SET origen = ?, destino = ?, estado = ?, monto_cobrado = ?
        WHERE id_viaje = ?
    `
    db.query(sql, [origen, destino, estado, monto_cobrado, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al editar viaje' })
        res.json({ mensaje: 'Viaje actualizado correctamente' })
    })
})

// VIAJES - eliminar
router.delete('/viajes/:id', verificarToken, (req, res) => {
    const sql = 'DELETE FROM Viaje WHERE id_viaje = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar viaje' })
        res.json({ mensaje: 'Viaje eliminado correctamente' })
    })
})

// USUARIOS - para desplegables
router.get('/usuarios', verificarToken, (req, res) => {
    db.query('SELECT id_usuario, nombre, primer_ap FROM Usuario', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener usuarios' })
        res.json(results)
    })
})

// CONDUCTORES - para desplegables
router.get('/conductores', verificarToken, (req, res) => {
    db.query('SELECT id_conductor, nombre, primer_ap FROM Conductor', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener conductores' })
        res.json(results)
    })
})

// VEHICULOS - para desplegables
router.get('/vehiculos', verificarToken, (req, res) => {
    db.query('SELECT id_vehiculo, placa, marca, modelo FROM Vehiculo', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener vehiculos' })
        res.json(results)
    })
})


module.exports = router;