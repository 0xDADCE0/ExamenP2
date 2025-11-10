// src/app.js
const express = require('express');
const swaggerDocs = require('./config/swagger.config')
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const meRoutes = require('./routes/me.routes');
const devicesRoutes = require('./routes/devices.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const ApiError = require('./utils/ApiError');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// 404: cualquier ruta no encontrada
app.use((req, res, next) => {
    next(new ApiError(404, 'Ruta no encontrada'));
});

// Middleware global de errores
app.use((err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno';

    // Manejo específico de errores de MySQL (email duplicado)
    if (!err.statusCode && err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'El email ya está registrado';
    }

    const response = {
        error: message
    };

    if (err.details) {
        response.details = err.details;
    }

    res.status(statusCode).json(response);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación API: http://localhost:${PORT}/api-docs`);
});
