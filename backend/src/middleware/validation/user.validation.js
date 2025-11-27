// src/middleware/validation/user.validation.js
const ApiError = require('../../utils/ApiError');

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Validar datos para crear usuario
const validateCreateUser = (req, res, next) => {
    const { email, password, username } = req.body;
    const errors = [];

    // Verificar campos requeridos
    if (email === undefined) errors.push('El email es requerido');
    if (password === undefined) errors.push('La contraseña es requerida');

    // Validar formato de email
    if (email !== undefined && !EMAIL_REGEX.test(email)) {
        errors.push('Formato de email inválido');
    }

    // Validar longitud de contraseña
    if (password !== undefined && password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (username !== undefined && username.length > 50) {
        errors.push('El nombre no puede exceder 50 caracteres');
    }

    if (errors.length > 0) {
        return next(new ApiError(400, 'Error de validación', errors));
    }

    next();
};

// Validar datos para iniciar sesión de usuario
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Verificar campos requeridos
    if (email === undefined) errors.push('El email es requerido');
    if (password === undefined) errors.push('La contraseña es requerida');

    // Validar formato de email
    if (email !== undefined && !EMAIL_REGEX.test(email)) {
        errors.push('Formato de email inválido');
    }

    if (errors.length > 0) {
        return next(new ApiError(400, 'Error de validación', errors));
    }

    next();
};

// Validar datos para actualizar usuario
const validateUpdateUser = (req, res, next) => {
    const { email, password, username } = req.body || {};
    const errors = [];

    if (email === undefined && password === undefined && username === undefined) {
        errors.push('Debe enviar al menos un campo para actualizar');
    }

    if (email !== undefined && !EMAIL_REGEX.test(email)) {
        errors.push('Formato de email inválido');
    }

    if (password !== undefined && password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (username !== undefined && username.length > 50) {
        errors.push('El nombre no puede exceder 50 caracteres');
    }

    if (errors.length > 0) {
        return next(new ApiError(400, 'Error de validación', errors));
    }

    next();
};

module.exports = {
    validateCreateUser,
    validateLogin,
    validateUpdateUser
};
