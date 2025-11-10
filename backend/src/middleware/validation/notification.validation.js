// src/middleware/notification.validation.js
const ApiError = require('../../utils/ApiError');

// Para POST /devices/:deviceCode/notifications
const validateCreateNotificationFromDevice = (req, res, next) => {
    const { type, title, body, payload } = req.body;
    const errors = [];

    if (!type) errors.push('El campo "type" es requerido');
    if (!title) errors.push('El campo "title" es requerido');

    if (payload !== undefined && typeof payload !== 'object') {
        errors.push('El campo "payload" debe ser un objeto JSON');
    }

    if (errors.length > 0) {
        return next(new ApiError(400, 'Error de validación', errors));
    }

    next();
};

// Para GET /notifications
const validateListNotifications = (req, res, next) => {
    const { status, limit, offset } = req.query;
    const errors = [];

    if (status && !['unread', 'all'].includes(status)) {
        errors.push('El parámetro "status" debe ser "unread" o "all"');
    }

    if (limit !== undefined && (isNaN(limit) || Number(limit) <= 0)) {
        errors.push('El parámetro "limit" debe ser un número positivo');
    }

    if (offset !== undefined && (isNaN(offset) || Number(offset) < 0)) {
        errors.push('El parámetro "offset" debe ser un número mayor o igual a 0');
    }

    if (errors.length > 0) {
        return next(new ApiError(400, 'Error de validación', errors));
    }

    next();
};

module.exports = {
    validateCreateNotificationFromDevice,
    validateListNotifications
};
