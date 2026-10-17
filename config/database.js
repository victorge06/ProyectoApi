const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://victorapi:victorapi@clusterapi.ckvz3rj.mongodb.net/');

        console.log('Conexión a MongoDB correcta');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;