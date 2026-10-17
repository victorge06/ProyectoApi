
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    const cabecera = req.headers["authorization"];

    if (!cabecera) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión"
        });
    }

    const token = cabecera.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            mensaje: "Token no proporcionado"
        });
    }

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = datos;

        next();
    } catch (error) {
        return res.status(403).json({
            mensaje: "Token no válido o caducado"
        });
    }
};

module.exports = verificarToken;
