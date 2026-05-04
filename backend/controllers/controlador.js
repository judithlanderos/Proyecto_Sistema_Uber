const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registro = (req, res) => {
    const { nombre, primer_ap, segundo_ap, correo, telefono, password } = req.body;

    if (!nombre || !primer_ap || !correo || !telefono || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sqlVerificar = 'SELECT id_usuario FROM Usuario WHERE correo = ?';
    db.query(sqlVerificar, [correo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en servidor' });
        if (results.length > 0) {
            return res.status(400).json({ error: 'El correo ya esta registrado' });
        }

        const hash = bcrypt.hashSync(password, 10);
        const fecha = new Date().toISOString().slice(0, 10);

        const sql = `
            INSERT INTO Usuario (nombre, primer_ap, segundo_ap, correo, telefono, fecha_registro, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [nombre, primer_ap, segundo_ap, correo, telefono, fecha, hash], (err) => {
            if (err) return res.status(500).json({ error: 'Error al registrar usuario' });
            res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
        });
    });
};

const login = (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contrasena son requeridos' });
    }

    const sql = 'SELECT * FROM Usuario WHERE correo = ?';
    db.query(sql, [correo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en servidor' });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contrasena incorrectos' });
        }

        const usuario = results[0];
        const passwordValida = bcrypt.compareSync(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Correo o contrasena incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id_usuario, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        req.session.usuario = { id: usuario.id_usuario, correo: usuario.correo };

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });
    });
};

const logout = (req, res) => {
    req.session.destroy();
    res.json({ mensaje: 'Sesion cerrada' });
};

module.exports = { registro, login, logout };