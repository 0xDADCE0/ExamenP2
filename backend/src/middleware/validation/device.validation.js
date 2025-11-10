// src/middleware/validation/device.validation.js
const ApiError = require('../../utils/ApiError');

// Validar creación de dispositivo
const validateCreateDevice = (req, res, next) => {
    const { location } = req.body;
    if (!location || location.trim() === '') {
        return next(new ApiError(400, 'Error de validación', ['El nombre es requerido']));
    }
    next();
};

module.exports = {
    validateCreateDevice
};