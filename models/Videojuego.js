
const mongoose = require("mongoose");

const videojuegoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    plataforma: {
        type: String,
        required: true
    },
    genero: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    lanzamiento: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Videojuego", videojuegoSchema);
