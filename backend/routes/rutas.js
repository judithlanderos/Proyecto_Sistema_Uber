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

module.exports = router