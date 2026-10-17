
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const router = express.Router();


/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registrar un usuario
 *     description: Crea un usuario nuevo en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: UsuarioPrueba
 *               email:
 *                 type: string
 *                 example: prueba@videojuegos.com
 *               password:
 *                 type: string
 *                 example: Prueba123!
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: El usuario ya existe
 */

router.post("/registro", async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const usuarioExiste = await Usuario.findOne({ email });

        if (usuarioExiste) {
            return res.status(400).json({
                mensaje: "El usuario ya existe"
            });
        }

        const passwordCifrada = await bcrypt.hash(password, 10);

        const usuario = new Usuario({
            nombre,
            email,
            password: passwordCifrada
        });

        await usuario.save();

        res.status(201).json({
            mensaje: "Usuario registrado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar el usuario"
        });
    }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Comprueba las credenciales y devuelve un Access Token y un Refresh Token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: prueba@videojuegos.com
 *               password:
 *                 type: string
 *                 example: Prueba123!
 *     responses:
 *       200:
 *         description: Inicio de sesión correcto
 *       401:
 *         description: Email o contraseña incorrectos
 */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email });

        if (!usuario || !await bcrypt.compare(password, usuario.password)) {
            return res.status(401).json({
                mensaje: "Email o contraseña incorrectos"
            });
        }

        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: usuario._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            mensaje: "Inicio de sesión correcto",
            token,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });
    }
});


/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar el Access Token
 *     description: Genera un nuevo Access Token usando un Refresh Token válido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh Token obtenido al iniciar sesión
 *     responses:
 *       200:
 *         description: Token renovado correctamente
 *       401:
 *         description: No se ha proporcionado el Refresh Token
 *       403:
 *         description: Refresh Token no válido o caducado
 */

router.post("/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            mensaje: "Debes proporcionar el Refresh Token"
        });
    }

    try {
        const datos = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const nuevoToken = jwt.sign(
            { id: datos.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            mensaje: "Token renovado correctamente",
            token: nuevoToken
        });

    } catch (error) {
        res.status(403).json({
            mensaje: "Refresh Token no válido o caducado"
        });
    }
});

module.exports = router;
