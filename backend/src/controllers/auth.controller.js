// controllers/auth.controller.js
const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authController = {
    // Registrar nuevo usuario
    async register(req, res) {
        const { email, password, username } = req.body;
        
        // Verificar si el email ya existe
        const [existing] = await db.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            throw new ApiError(409, 'El email ya está registrado');
        }
        
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userToSave = username || '';
        
        const [result] = await db.execute(
            'INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)',
            [email, password_hash, userToSave]
        );
        
        res.status(201).json({ 
            user_id: result.insertId,
            message: 'Usuario creado exitosamente' 
        });
    },

    // Iniciar sesión
    async login(req, res) {
            const { email, password } = req.body;
            
            // Buscar usuario por email
            const [rows] = await db.execute(
                'SELECT user_id, email, username, password_hash FROM users WHERE email = ?',
                [email]
            );
            
            if (rows.length === 0) {
                throw new ApiError(401, 'Credenciales inválidas');
            }
            
            const user = rows[0];
            
            // Verificar contraseña
            const validPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!validPassword) {
                throw new ApiError(401, 'Credenciales inválidas');
            }
            
            // Crear token JWT
            const token = jwt.sign(
                { user_id: user.user_id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    username: user.username
                }
            });
    }
};

module.exports = authController;
