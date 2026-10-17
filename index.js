require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const conectarDB = require("./config/database");
const Videojuego = require("./models/Videojuego");
const authRoutes = require("./routes/auth");
const verificarToken = require("./middleware/auth");

const app = express();


const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API REST de Videojuegos",
            version: "1.0.0",
            description: "API REST creada con Node.js, Express y MongoDB"
        },
        servers: [
            {
                url: 'https://proyectoapi-s0yl.onrender.com'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./index.js", "./routes/*.js"]
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        mensaje: "Demasiadas peticiones. Inténtalo más tarde."
    }
});

app.use(limiter);

app.use(express.json());
app.use("/auth", authRoutes);

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Mi API REST funciona correctamente");
});

/**
 * @swagger
 * /prueba:
 *   get:
 *     summary: Comprobar que la API funciona
 *     description: Comprueba que la API responde correctamente y que MongoDB está conectada.
 *     responses:
 *       200:
 *         description: La API funciona correctamente
 */

app.get("/prueba", (req, res) => {
    res.json({
        mensaje: "La API funciona correctamente",
        baseDatos: "MongoDB conectada"
    });
});

const iniciarServidor = async () => {
    await conectarDB();

    app.listen(PORT, () => {
        console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
};


/**
 * @swagger
 * /videojuegos:
 *   get:
 *     summary: Obtener todos los videojuegos
 *     description: Devuelve la lista de videojuegos guardados en MongoDB.
 *     responses:
 *       200:
 *         description: Lista de videojuegos obtenida correctamente
 *       500:
 *         description: Error al obtener los videojuegos
 */

app.get("/videojuegos", async (req, res) => {
    try {
        const videojuegos = await Videojuego.find();

        res.json(videojuegos);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los videojuegos"
        });
    }
});


/**
 * @swagger
 * /videojuegos:
 *   post:
 *     summary: Crear un videojuego
 *     description: Guarda un nuevo videojuego en MongoDB. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - plataforma
 *               - genero
 *               - precio
 *               - lanzamiento
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Minecraft
 *               plataforma:
 *                 type: string
 *                 example: PC
 *               genero:
 *                 type: string
 *                 example: Sandbox
 *               precio:
 *                 type: number
 *                 example: 29.99
 *               lanzamiento:
 *                 type: integer
 *                 example: 2011
 *     responses:
 *       201:
 *         description: Videojuego creado correctamente
 *       401:
 *         description: Falta el token de autenticación
 *       403:
 *         description: Token no válido o caducado
 */

app.post("/videojuegos", verificarToken, async (req, res) => {
    try {
        const videojuego = new Videojuego(req.body);

        await videojuego.save();

        res.status(201).json(videojuego);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al guardar el videojuego"
        });
    }
});


/**
 * @swagger
 * /videojuegos/{id}:
 *   put:
 *     summary: Modificar un videojuego
 *     description: Modifica un videojuego existente mediante su ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del videojuego
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Minecraft
 *               plataforma:
 *                 type: string
 *                 example: PC
 *               genero:
 *                 type: string
 *                 example: Sandbox
 *               precio:
 *                 type: number
 *                 example: 29.99
 *               lanzamiento:
 *                 type: integer
 *                 example: 2011
 *     responses:
 *       200:
 *         description: Videojuego modificado correctamente
 *       401:
 *         description: Falta el token de autenticación
 *       403:
 *         description: Token no válido o caducado
 *       404:
 *         description: Videojuego no encontrado
 */

app.put("/videojuegos/:id", verificarToken, async (req, res) => {
    try {
        const videojuego = await Videojuego.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!videojuego) {
            return res.status(404).json({
                mensaje: "Videojuego no encontrado"
            });
        }

        res.json(videojuego);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al modificar el videojuego"
        });
    }
});


/**
 * @swagger
 * /videojuegos/{id}:
 *   delete:
 *     summary: Eliminar un videojuego
 *     description: Elimina un videojuego de MongoDB mediante su ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del videojuego
 *     responses:
 *       200:
 *         description: Videojuego eliminado correctamente
 *       401:
 *         description: Falta el token de autenticación
 *       403:
 *         description: Token no válido o caducado
 *       404:
 *         description: Videojuego no encontrado
 */

app.delete("/videojuegos/:id", verificarToken, async (req, res) => {
    try {
        const videojuego = await Videojuego.findByIdAndDelete(
            req.params.id
        );

        if (!videojuego) {
            return res.status(404).json({
                mensaje: "Videojuego no encontrado"
            });
        }

        res.json({
            mensaje: "Videojuego eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar el videojuego"
        });
    }
});


iniciarServidor();
