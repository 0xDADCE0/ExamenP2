// src/middleware/auth/user.auth.js
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/ApiError');

const authenticateUser = (req, res, next) => {
    // Obtener el token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return next(new ApiError(401, 'Token no proporcionado'));
    }
    
    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new ApiError(403, 'Token inválido'));
        }
        
        req.user = user;
        next();
    });
};

module.exports = authenticateUser;
